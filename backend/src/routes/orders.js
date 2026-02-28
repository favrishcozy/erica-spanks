import express from 'express'
import mongoose from 'mongoose'
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

// POST /api/orders/:orderId/retry-payment - Reinitialize payment for an order
router.post('/:orderId/retry-payment', customer, async (req, res) => {
  try {
    const { orderId } = req.params
    const order = await Order.findById(orderId).populate('user')

    if (!order) {
      return res.status(404).json({ success: false, error: 'Order not found' })
    }

    // If order already paid/confirmed, don't allow retry
    if (order.paymentInfo && order.paymentInfo.status === 'completed') {
      return res.status(400).json({ success: false, error: 'Order is already paid' })
    }

    const amount = order.pricing?.total || (order.paymentInfo?.amountPaid || 0)

    // Initialize payment with Paystack using order id in metadata
    const paymentInit = await paymentService.initializePayment(
      order.user?.email || order.shippingAddress?.email,
      amount,
      { orderId: order._id.toString(), items: order.items.map(i => `${i.productSnapshot?.name || 'Product'} x${i.quantity}`) }
    )

    if (!paymentInit.success) {
      console.error('❌ Retry payment initialization failed:', paymentInit.error)
      return res.status(400).json({ success: false, error: paymentInit.error || 'Failed to initialize payment' })
    }

    // Update order with latest reference so we can match it on verify
    order.paymentInfo = order.paymentInfo || {}
    order.paymentInfo.reference = paymentInit.data.reference
    order.paymentInfo.status = 'pending'
    await order.save()

    res.json({ success: true, data: { paymentInitialization: paymentInit.data } })
  } catch (error) {
    console.error('Error retrying payment:', error)
    res.status(500).json({ success: false, error: error.message || 'Server error retrying payment' })
  }
})

// POST /api/orders - Create new order (customers only)
router.post('/', customer, async (req, res) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

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

    // Validate items in stock with stock service
    const stockService = await import('../services/stockService.js');
    const stockValidation = await stockService.validateStockAvailability(
      items.map(item => ({
        productId: item.productId,
        variationSku: item.variationSku,
        quantity: item.quantity,
        size: item.size,
        color: item.color
      }))
    )

    if (!stockValidation.success) {
      return res.status(400).json({
        success: false,
        error: 'Stock validation failed',
        details: stockValidation.results
      })
    }

    // Validate items and calculate totals
    let subtotal = 0
    const orderItems = []

    for (const cartItem of items) {
      const product = await Product.findById(cartItem.productId).session(session)
      
      if (!product) {
        throw new Error(`Product ${cartItem.productId} not found`)
      }

      // Check if product can be ordered (not out of stock or discontinued)
      if (!product.canBeOrdered()) {
        throw new Error(`${product.name} is currently unavailable for purchase`)
      }

      // Find matching variation
      const variation = product.variations?.find(
        v => v.size === cartItem.size && v.color === cartItem.color
      )

      if (!variation) {
        throw new Error(`${product.name} is not available in ${cartItem.size} / ${cartItem.color}`)
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
    const shippingCost = req.body.deliveryFee || 0
    let discount = 0

    if (pointsRedemption?.pointsToRedeem) {
      // Assume 1 point = 0.5 Naira (adjust as needed)
      discount = pointsRedemption.pointsToRedeem * 0.5
    }

    const subtotalBeforeVAT = subtotal + shippingCost - discount
    const VAT_RATE = 0.075 // 7.5% VAT
    const vat = Math.round(subtotalBeforeVAT * VAT_RATE * 100) / 100
    const total = subtotalBeforeVAT + vat

    console.log('💰 Pricing Calculation:')
    console.log('  Subtotal:', subtotal)
    console.log('  Shipping Cost:', shippingCost)
    console.log('  Discount:', discount)
    console.log('  Subtotal Before VAT:', subtotalBeforeVAT)
    console.log('  VAT Rate:', VAT_RATE)
    console.log('  VAT Amount:', vat)
    console.log('  Total:', total)

    // Create order in DB with pending status
    const order = await Order.create([{
      user: req.user._id,
      items: orderItems,
      shippingAddress: {
        firstName: shipping.firstName,
        lastName: shipping.lastName,
        email: shipping.email,
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
        vat,
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
    }], { session })

    // Initialize payment with Paystack
    const paymentInit = await paymentService.initializePayment(
      shipping.email,
      total,
      {
        orderId: order[0]._id.toString(),
        items: orderItems.map(i => `${i.productSnapshot?.name || 'Product'} x${i.quantity}`)
      }
    )

    console.log('✅ Paystack initialization response:', paymentInit)

    if (!paymentInit.success) {
      throw new Error(paymentInit.error || 'Failed to initialize payment')
    }

    // Commit transaction
    await session.commitTransaction()

    console.log('✅ Returning payment data:', paymentInit.data)

    // Send order confirmation email (non-blocking for performance)
    const confirmationTemplate = emailTemplates.orderConfirmation({
      orderId: order[0]._id.toString().slice(-6).toUpperCase(),
      createdAt: order[0].createdAt,
      items: orderItems,
      shipping: order[0].shippingAddress,
      pricing: order[0].pricing,
      status: order[0].status
    })
    
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
        orderId: order[0]._id.toString(),
        status: order[0].status,
        items: orderItems,
        pricing: order[0].pricing,
        paymentInitialization: paymentInit.data
      }
    })
  } catch (error) {
    await session.abortTransaction()
    console.error('Error creating order:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Server error creating order'
    })
  } finally {
    session.endSession()
  }
})

// GET /api/orders/my-orders - Get current user's orders
router.get('/my-orders', async (req, res) => {
  try {
    const orders = await orderService.getOrdersByUser(req.user._id)
    res.json({
      success: true,
      data: orders,
      message: 'Orders retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching user orders:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching orders'
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

    const order = await Order.findById(req.params.orderId).populate('user', 'firstName lastName email phone')

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
    order.paymentInfo.status = 'completed'
    order.paymentInfo.transactionId = verification.data.transactionId
    order.paymentInfo.reference = reference
    order.paymentDate = new Date()
    order.status = 'confirmed'

    // Deduct inventory from products
    for (const item of order.items) {
      const product = await Product.findById(item.product)
      if (product) {
        const variation = product.variations.find(
          v => v.size === item.variation.size && v.color === item.variation.color
        )
        if (variation) {
          variation.inventory.quantity -= item.quantity
          
          // Update product stock status
          await product.updateStockStatus()
          await product.save()
        }
      }
    }

    // Award points if applicable
    if (order.pricing.subtotal > 0) {
      const pointsEarned = Math.floor(order.pricing.subtotal / 100) // 1 point per ₦100
      order.pointsEarned = pointsEarned
      order.pointsAwarded = true
    }

    await order.save()

    // Send payment confirmation email (non-blocking for performance)
    // Use order.user.email if populated, otherwise fallback to shipping email from order
    const userEmail = order.user?.email || order.shippingAddress?.email
    
    console.log(`DEBUG: userEmail = ${userEmail}`)
    console.log(`DEBUG: order.user?.email = ${order.user?.email}`)
    console.log(`DEBUG: order.shippingAddress?.email = ${order.shippingAddress?.email}`)
    
    if (userEmail) {
      try {
        const statusTemplate = emailTemplates.orderStatusUpdate(
          {
            orderId: order._id.toString().slice(-6).toUpperCase(),
            shipping: order.shippingAddress,
            items: order.items
          },
          'confirmed'
        )
        console.log(`[ORDER] Template created for ${userEmail}`)
        console.log(`[ORDER] Template subject: ${statusTemplate.subject}`)
        
        // Send email asynchronously without blocking the response
        console.log(`📧 Attempting to send order status update email to: ${userEmail}`)
        sendEmail(userEmail, statusTemplate)
          .then((sent) => {
            if (sent) {
              console.log(`✅ Order status update email sent to ${userEmail}`)
            } else {
              console.error(`❌ Failed to send order status update email to ${userEmail}`)
            }
          })
          .catch(error => {
            console.error(`❌ Error in order status update email sending to ${userEmail}:`, error.message || error)
          })
      } catch (templateError) {
        console.error(`❌ Error creating email template:`, templateError.message || templateError)
      }
    } else {
      console.warn(`⚠️ Cannot send order status update email - no email found in user or shipping address`)
      console.warn(`   user object:`, order.user)
      console.warn(`   shippingAddress:`, order.shippingAddress)
    }

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