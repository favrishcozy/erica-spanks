import express from 'express'
import Order from '../models/Order.js'
import * as paymentService from '../services/paymentService.js'
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
      const order = await Order.findById(orderId)

      if (!order) {
        console.warn(`Order ${orderId} not found for webhook`)
        return res.json({ success: true })
      }

      // Update payment info
      order.paymentInfo.status = 'success'
      order.paymentInfo.transactionId = data.id
      order.paymentInfo.reference = reference
      order.paymentDate = new Date()
      order.status = 'confirmed'

      // Award points
      if (order.pricing.subtotal > 0) {
        const pointsEarned = Math.floor(order.pricing.subtotal / 100)
        order.pointsEarned = pointsEarned
        order.pointsAwarded = true
      }

      await order.save()

      // Send confirmation email
      const statusTemplate = emailTemplates.orderStatusUpdate(
        {
          orderId: order._id.toString().slice(-6).toUpperCase(),
          shipping: order.shipping,
          items: order.items
        },
        'confirmed'
      )
      await sendEmail(order.shipping.email, statusTemplate)

      console.log(`Order ${orderId} payment confirmed via webhook`)
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
          await order.save()

          console.log(`Order ${orderId} payment failed`)
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
