import express from 'express'
import Order from '../models/Order.js'
import * as paymentService from '../services/paymentService.js'
import * as invoiceService from '../services/invoiceService.js'
import * as stockService from '../services/stockService.js'
import { sendEmail, emailTemplates } from '../utils/emailService.js'

const router = express.Router()

/**
 * POST /api/webhooks/paystack
 * Handle Paystack webhook events
 * Paystack will send POST requests to this endpoint when events occur
 */
router.post('/paystack', async (req, res) => {
  try {
    // Get signature from headers
    const signature = req.headers['x-paystack-signature']
    
    console.log('🔔 Webhook received from Paystack')

    if (!signature) {
      console.warn('⚠️ Missing webhook signature header')
      return res.status(401).json({
        success: false,
        error: 'Missing webhook signature'
      })
    }

      // Verify signature using raw body (important for HMAC verification)
      const payloadString = req.rawBody || JSON.stringify(req.body)
      console.log('📝 Payload for verification:', payloadString)
    
      const isValidSignature = paymentService.verifyWebhookSignature(
        signature,
        payloadString
      )

      console.log('🔐 Signature verification result:', isValidSignature ? '✅ Valid' : '❌ Invalid')

    if (!isValidSignature) {
      console.warn('❌ Invalid webhook signature received')
      return res.status(401).json({
        success: false,
        error: 'Invalid signature'
      })
    }

    const event = req.body.event
    const data = req.body.data

    // Handle charge.success event
    if (event === 'charge.success') {
      const { reference, metadata } = data
      const orderId = metadata?.orderId

      if (!orderId) {
        console.warn('Webhook received without orderId in metadata')
        return res.json({ success: true }) // Still return 200 to avoid retry
      }

      // Update order status
      const order = await Order.findById(orderId).populate('user')

      if (!order) {
        console.warn(`Order ${orderId} not found for webhook`)
        return res.json({ success: true })
      }

      // Update payment info
      order.paymentInfo.status = 'completed'
      order.paymentInfo.transactionId = data.id
      order.paymentInfo.reference = reference
      order.paymentDate = new Date()
      order.status = 'confirmed'

      // Add status history entry
      order.statusHistory = order.statusHistory || []
      order.statusHistory.push({
        status: 'confirmed',
        updatedBy: 'webhook',
        note: 'Payment confirmed via Paystack webhook'
      })

      // Deduct stock using transaction for atomicity
      const deductionResult = await stockService.deductStockForOrder(orderId)
      
      if (!deductionResult.success) {
        console.error(`❌ Failed to deduct stock for order ${orderId}:`, deductionResult.error)
        // Don't fail the webhook, but log the issue
      } else {
        console.log(`✅ Stock deducted for order ${orderId}`)
      }

      // Award points
      if (order.pricing.subtotal > 0) {
        const pointsEarned = Math.floor(order.pricing.subtotal / 100)
        order.pointsEarned = pointsEarned
        order.pointsAwarded = true
      }

      await order.save()

      // Generate invoice (source of truth: webhook, not verify endpoint)
      try {
        const existingInvoice = await invoiceService.getOrderInvoice(orderId)
        console.log('📄 Invoice already exists for order:', existingInvoice._id)
      } catch (invoiceError) {
        // No invoice exists, create one
        try {
          console.log('📄 Creating invoice for order:', orderId)
          const invoice = await invoiceService.createInvoiceFromOrder(order, { status: 'sent' })
          order.invoice = invoice._id
          await order.save()
          console.log('✅ Invoice created successfully:', invoice._id)
        } catch (createError) {
          console.error('❌ Failed to create invoice:', createError.message)
          // Log but don't fail the webhook - payment is already confirmed
        }
      }

      // Send confirmation email
      const userEmail = order.user?.email || order.shippingAddress?.email
      if (userEmail) {
        const statusTemplate = emailTemplates.orderStatusUpdate(
          {
            orderId: order._id.toString().slice(-6).toUpperCase(),
            shipping: order.shippingAddress,
            items: order.items
          },
          'confirmed'
        )
        sendEmail(userEmail, statusTemplate).catch(err => console.error('Error sending webhook confirmation email:', err))
      }

      console.log(`✅ Order ${orderId} payment confirmed via webhook`)
    }

    // Handle charge.failed event
    if (event === 'charge.failed') {
      const { metadata } = data
      const orderId = metadata?.orderId

      if (orderId) {
        const order = await Order.findById(orderId)
        if (order) {
          order.paymentInfo.status = 'failed'
          order.status = 'payment_failed'
          
          // Add status history entry
          order.statusHistory = order.statusHistory || []
          order.statusHistory.push({
            status: 'payment_failed',
            updatedBy: 'webhook',
            note: 'Payment failed via Paystack webhook'
          })
          
          // Reconcile stock for failed payment
          const reconciliationResult = await stockService.reconcileStockForOrder(orderId)
          
          if (!reconciliationResult.success) {
            console.error(`❌ Failed to reconcile stock for order ${orderId}:`, reconciliationResult.error)
          } else {
            console.log(`✅ Stock reconciled for failed order ${orderId}`)
          }
          
          await order.save()
          console.log(`❌ Order ${orderId} payment failed via webhook`)
        }
      }
    }
    
    // Handle charge.pending event (authorization only)
    if (event === 'charge.pending') {
      const { metadata } = data
      const orderId = metadata?.orderId

      if (orderId) {
        const order = await Order.findById(orderId)
        if (order) {
          order.paymentInfo.status = 'pending'
          order.status = 'pending'
          
          // Add status history entry
          order.statusHistory = order.statusHistory || []
          order.statusHistory.push({
            status: 'pending',
            updatedBy: 'webhook',
            note: 'Payment pending via Paystack webhook'
          })
          
          await order.save()
          console.log(`⏳ Order ${orderId} payment pending via webhook`)
        }
      }
    }

    // Always return 200 to acknowledge webhook receipt
    res.json({ success: true })
  } catch (error) {
    console.error('Webhook error:', error)
    // Still return 200 to prevent Paystack from retrying
    res.json({ success: true, error: error.message })
  }
})

export default router
