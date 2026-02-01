import express from 'express'
import { protect, customer } from '../middleware/auth.js'
import Order from '../models/Order.js'
import Product from '../models/Product.js'
import * as orderService from '../services/orderService.js'
import * as paymentService from '../services/paymentService.js'
import { sendEmail, emailTemplates } from '../utils/emailService.js'

const router = express.Router()

// All order routes require authentication
router.use(protect)

// GET /api/orders - Get user's orders (customers see their own, admins see all)
router.get('/', async (req, res) => {
  try {
    let orders
    if (req.user.role === 'customer') {
      // Customers only see their own orders
      orders = await orderService.getOrdersByUser(req.user._id)
    } else if (req.user.role === 'admin') {
      // Admins see all orders
      orders = await orderService.getAllOrders()
    }

    res.json({
      success: true,
      data: orders,
      message: 'Orders retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching orders'
    })
  }
})

// GET /api/orders/my-orders - Alias for customers to get their orders
router.get('/my-orders', async (req, res) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user._id)
    res.json({
      success: true,
      data: orders,
      message: 'Orders retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching orders:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching orders'
    })
  }
})

// POST /api/orders - Create new order (customers only)
router.post('/', customer, async (req, res) => {
  try {
    const { shipping, items, pointsRedemption, paymentMethod } = req.body

    // Validate required fields
    if (!shipping || !items || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Shipping info and items are required'
      })
    }

    if (!paymentMethod) {
      return res.status(400).json({
        success: false,
        error: 'Payment method is required'
      })
    }

    // Validate items in stock
    let subtotal = 0
    const orderItems = []

    for (const cartItem of items) {
      const product = await Product.findById(cartItem.productId)
      
      if (!product) {
        return res.status(404).json({
          success: false,
          error: `Product ${cartItem.productId} not found`
        })
      }

      // Check if product can be ordered (not out of stock or discontinued)
      if (!product.canBeOrdered()) {
        return res.status(400).json({
          success: false,
          error: `${product.name} is currently unavailable for purchase`
        })
      }

      // Find matching variation
      const variation = product.variations?.find(
        v => v.size === cartItem.size && v.color === cartItem.color
      )

      if (!variation) {
        return res.status(400).json({
          success: false,
          error: `${product.name} is not available in ${cartItem.size} / ${cartItem.color}`
        })
      }

      if (!variation.inventory || variation.inventory.quantity < cartItem.quantity) {
        return res.status(400).json({
          success: false,
          error: `${product.name} (${cartItem.size}) is out of stock`
        })
      }

      const itemTotal = variation.price * cartItem.quantity
      subtotal += itemTotal

      orderItems.push({
        product: product._id,
        variation: {
          size: cartItem.size,
          color: cartItem.color,
          sku: variation.sku
        },
        quantity: cartItem.quantity,
        unitPrice: variation.price,
        totalPrice: itemTotal,
        productSnapshot: {
          name: product.name,
          image: variation.images?.[0]?.url || product.images?.[0]?.url
        }
      })
    }

    // Calculate pricing
    const shippingCost = subtotal > 50000 ? 0 : 1500
    let discount = 0

    if (pointsRedemption?.pointsToRedeem) {
      // Assume 1 point = 0.5 Naira (adjust as needed)
      discount = pointsRedemption.pointsToRedeem * 0.5
    }

    const total = subtotal + shippingCost - discount

    // Create order in DB with pending status
    const order = await Order.create({
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        firstName: shipping.firstName,
        lastName: shipping.lastName,
        address1: shipping.address,
        city: shipping.city,
        state: shipping.state,
        zipCode: shipping.postalCode || '000000',
        country: shipping.country,
        phone: shipping.phone
      },
      billingAddress: {
        firstName: shipping.firstName,
        lastName: shipping.lastName,
        address1: shipping.address,
        city: shipping.city,
        state: shipping.state,
        zipCode: shipping.postalCode || '000000',
        country: shipping.country,
        phone: shipping.phone
      },
      pricing: {
        subtotal,
        shippingCost,
        tax: 0,
        discount,
        total
      },
      status: 'pending',
      paymentInfo: {
        method: paymentMethod,
        transactionId: `temp_${Date.now()}`,
        status: 'pending',
        amountPaid: total,
        currency: 'NGN'
      },
      pointsRedemption: pointsRedemption ? {
        reservation_id: pointsRedemption.reservationId,
        points_redeemed: pointsRedemption.pointsToRedeem,
        discount_applied: discount > 0
      } : null
    })

    // Initialize payment with Paystack
    const paymentInit = await paymentService.initializePayment(
      shipping.email,
      total,
      {
        orderId: order._id.toString(),
        items: orderItems.map(i => `${i.productSnapshot?.name || 'Product'} x${i.quantity}`)
      }
    )

    console.log('✅ Paystack initialization response:', paymentInit)

    if (!paymentInit.success) {
      // Delete order if payment initialization fails
      await Order.deleteOne({ _id: order._id })
      console.error('❌ Payment initialization failed:', paymentInit.error)
      return res.status(400).json({
        success: false,
        error: paymentInit.error || 'Failed to initialize payment'
      })
    }

    console.log('✅ Returning payment data:', paymentInit.data)

    // Send order confirmation email (non-blocking for performance)
    // Fire and forget - don't await this
    const confirmationTemplate = emailTemplates.orderConfirmation({
      orderId: order._id.toString().slice(-6).toUpperCase(),
      createdAt: order.createdAt,
      items: orderItems,
      shipping: order.shippingAddress,
      pricing: order.pricing,
      status: order.status
    })
    // Send email asynchronously without blocking the response
    console.log(`📧 Sending order confirmation email to: ${shipping.email}`)
    sendEmail(shipping.email, confirmationTemplate)
      .then((sent) => {
        if (sent) {
          console.log(`✅ Order confirmation email sent to ${shipping.email}`)
        } else {
          console.error(`❌ Failed to send order confirmation email to ${shipping.email}`)
        }
      })
      .catch(error => {
        console.error(`❌ Error in email sending process to ${shipping.email}:`, error)
      })

    res.status(201).json({
      success: true,
      data: {
        orderId: order._id.toString(),
        status: order.status,
        items: orderItems,
        pricing: order.pricing,
        paymentInitialization: paymentInit.data
      }
    })
  } catch (error) {
    console.error('Error creating order:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Server error creating order'
    })
  }
})

// POST /api/orders/:orderId/verify-payment - Verify payment and complete order
router.post('/:orderId/verify-payment', async (req, res) => {
  try {
    const { reference } = req.body

    if (!reference) {
      return res.status(400).json({
        success: false,
        error: 'Payment reference is required'
      })
    }

    const order = await Order.findById(req.params.orderId).populate('user')

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Verify payment with Paystack
    const verification = await paymentService.verifyPayment(reference)

    if (!verification.success) {
      return res.status(400).json({
        success: false,
        error: verification.error || 'Payment verification failed'
      })
    }

    // Update order with payment info
    order.paymentInfo.status = 'success'
    order.paymentInfo.transactionId = verification.data.transactionId
    order.paymentInfo.reference = reference
    order.paymentDate = new Date()
    order.status = 'confirmed'

    // Award points if applicable
    if (order.pricing.subtotal > 0) {
      const pointsEarned = Math.floor(order.pricing.subtotal / 100) // 1 point per ₦100
      order.pointsEarned = pointsEarned
      order.pointsAwarded = true
    }

    await order.save()

    // Send payment confirmation email (non-blocking for performance)
    const statusTemplate = emailTemplates.orderStatusUpdate(
      {
        orderId: order._id.toString().slice(-6).toUpperCase(),
        shipping: order.shippingAddress,
        items: order.items
      },
      'confirmed'
    )
    // Send email asynchronously without blocking the response
    console.log(`📧 Sending payment confirmation email to: ${order.user.email}`)
    sendEmail(order.user.email, statusTemplate)
      .then((sent) => {
        if (sent) {
          console.log(`✅ Payment confirmation email sent to ${order.user.email}`)
        } else {
          console.error(`❌ Failed to send payment confirmation email to ${order.user.email}`)
        }
      })
      .catch(error => {
        console.error(`❌ Error in email sending process to ${order.user.email}:`, error)
      })

    res.json({
      success: true,
      data: {
        orderId: order._id.toString(),
        status: order.status,
        paymentStatus: order.paymentInfo.status,
        pointsEarned: order.pointsEarned
      }
    })
  } catch (error) {
    console.error('Error verifying payment:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Server error verifying payment'
    })
  }
})

// GET /api/orders/:orderId - Get a single order by ID
router.get('/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name slug')

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    // Check authorization: customer can only view their own order, admin can view any
    if (req.user.role === 'customer' && order.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this order'
      })
    }

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Error fetching order:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching order'
    })
  }
})

// PUT /api/orders/:orderId/status - Update order status (admin only)
router.put('/:orderId/status', async (req, res) => {
  try {
    console.log('='.repeat(50))
    console.log('Update order status request')
    console.log('Order ID:', req.params.orderId)
    console.log('New status:', req.body.status)
    console.log('User:', req.user?.email, 'Role:', req.user?.role)
    
    // Check if user is admin
    if (req.user.role !== 'admin') {
      console.log('User is not admin')
      return res.status(403).json({
        success: false,
        error: 'Not authorized to update order status'
      })
    }

    const { status } = req.body
    const validStatuses = ['pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled']

    if (!status || !validStatuses.includes(status)) {
      console.log('Invalid status:', status)
      return res.status(400).json({
        success: false,
        error: `Invalid status. Must be one of: ${validStatuses.join(', ')}`
      })
    }

    console.log('Finding order...')
    const order = await Order.findById(req.params.orderId).populate('user')

    if (!order) {
      console.log('Order not found')
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    console.log('Order found, updating status from', order.status, 'to', status)
    const oldStatus = order.status
    order.status = status
    order.statusHistory = order.statusHistory || []
    order.statusHistory.push({
      status: status,
      updatedAt: new Date(),
      updatedBy: req.user.email
    })

    console.log('Saving order...')
    await order.save()
    console.log('Order saved successfully')

    // Send status update email to customer
    if (order.user && order.user.email) {
      console.log('Sending status update email to', order.user.email)
      const statusTemplate = emailTemplates.orderStatusUpdate(
        {
          orderId: order._id.toString().slice(-6).toUpperCase(),
          shipping: order.shippingAddress,
          items: order.items,
          trackingNumber: order.trackingNumber
        },
        status
      )
      await sendEmail(order.user.email, statusTemplate)
    }

    console.log(`Admin ${req.user.email} updated order ${order._id} status from ${oldStatus} to ${status}`)
    console.log('Sending response...')

    res.json({
      success: true,
      data: order,
      message: `Order status updated to ${status}`
    })
  } catch (error) {
    console.error('Error updating order status:', error.message)
    console.error('Stack:', error.stack)
    res.status(500).json({
      success: false,
      error: 'Server error updating order status'
    })
  }
})

export default router