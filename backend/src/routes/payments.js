import express from 'express'
import * as paymentService from '../services/paymentService.js'
import Order from '../models/Order.js'
import { sendEmail, emailTemplates } from '../utils/emailService.js'
const router = express.Router()

// webhook alias endpoint (Paystack will call configured URL)
// This provides POST /api/payments/webhook as an alternative to /api/webhooks/paystack
router.post('/webhook', async (req, res) => {
  try {
    const signature = req.headers['x-paystack-signature']
    const payloadString = req.rawBody || JSON.stringify(req.body)

    if (!signature || !paymentService.verifyWebhookSignature(signature, payloadString)) {
      console.warn('Invalid webhook signature for /api/payments/webhook')
      return res.status(401).json({ success: false, error: 'Invalid signature' })
    }

    const event = req.body.event
    const data = req.body.data

    if (event === 'charge.success') {
      const { reference, metadata } = data
      const orderId = metadata?.orderId || null
      if (orderId) {
        const order = await Order.findById(orderId).populate('user')
        if (order) {
          order.paymentInfo.status = 'completed'
          order.paymentInfo.transactionId = data.id
          order.paymentInfo.reference = reference
          order.paymentDate = new Date()
          order.status = 'confirmed'
          if (order.pricing && order.pricing.subtotal > 0) {
            const pointsEarned = Math.floor(order.pricing.subtotal / 100)
            order.pointsEarned = pointsEarned
            order.pointsAwarded = true
          }
          await order.save()

          const statusTemplate = emailTemplates.orderStatusUpdate(
            {
              orderId: order._id.toString().slice(-6).toUpperCase(),
              shipping: order.shippingAddress,
              items: order.items
            },
            'confirmed'
          )
          sendEmail(order.user.email, statusTemplate).catch(err => console.error('Error sending webhook confirmation email:', err))
        }
      }
    }

    // acknowledge
    res.json({ success: true })
  } catch (error) {
    console.error('Error in /api/payments/webhook:', error)
    res.json({ success: true })
  }
})

// POST /api/payments/verify
router.post('/verify', async (req, res) => {
  try {
    const { reference } = req.body

    if (!reference) {
      console.warn('⚠️ No reference provided to /payments/verify')
      return res.status(400).json({ success: false, error: 'Payment reference is required' })
    }

    console.log('🔍 Processing payment verification for reference:', reference)

    // Verify with Paystack
    const verification = await paymentService.verifyPayment(reference)

    // If verification failed, try to mark order as payment failed so user can retry
    if (!verification.success) {
      console.log('⚠️ Paystack verification returned success: false for reference:', reference)
      // try to find order by stored payment reference
      try {
        const orderFallback = await Order.findOne({ 'paymentInfo.reference': reference })
        if (orderFallback) {
          console.log('📍 Found order to mark as failed:', orderFallback._id)
          orderFallback.paymentInfo.status = 'failed'
          // push status history entry
          orderFallback.statusHistory = orderFallback.statusHistory || []
          orderFallback.statusHistory.push({ status: 'payment_failed', updatedAt: new Date(), updatedBy: 'system', note: 'Payment verification failed' })
          await orderFallback.save()
          return res.status(400).json({ success: false, error: 'Payment not successful', data: { orderId: orderFallback._id.toString() } })
        }
      } catch (e) {
        console.error('❌ Error marking order payment failed fallback:', e)
      }

      return res.status(400).json({ success: false, error: verification.error || 'Payment verification failed' })
    }

    // Try to locate order from metadata returned by Paystack
    const metadata = verification.data.metadata || {}
    const orderIdFromMeta = metadata.orderId || metadata.order_id || metadata.order || null

    console.log('📦 Verification metadata:', metadata)
    console.log('🔎 Order ID from metadata:', orderIdFromMeta)

    let order = null
    if (orderIdFromMeta) {
      console.log('🔍 Looking up order by metadata orderId:', orderIdFromMeta)
      order = await Order.findById(orderIdFromMeta).populate('user')
    }

    // Fallback: try to find order by reference stored earlier
    if (!order) {
      console.log('🔍 Fallback: looking up order by reference:', reference)
      order = await Order.findOne({ 'paymentInfo.reference': reference }).populate('user')
    }

    if (!order) {
      // No order found; still return verification success so frontend can show generic success page
      console.log('⚠️ No order found for reference:', reference)
      return res.json({ success: true, data: { reference, verification: verification.data } })
    }

    console.log('✅ Found order:', order._id)

    // Check if order is already confirmed (likely from webhook)
    if (order.status === 'confirmed' && order.paymentInfo.status === 'completed') {
      console.log('✅ Order already confirmed by webhook, returning order data')
      res.json({ success: true, data: { orderId: order._id.toString(), order } })
      return
    }

    // Update order with payment info if not already completed
    order.paymentInfo.status = 'completed'
    order.paymentInfo.transactionId = verification.data.transactionId
    order.paymentInfo.reference = reference
    order.paymentDate = new Date()
    order.status = 'confirmed'

    // Ensure statusHistory exists and has proper structure
    if (!order.statusHistory) {
      order.statusHistory = []
    }
    
    // Only add status history entry if one doesn't already exist for 'confirmed'
    const hasConfirmedEntry = order.statusHistory.some(h => h.status === 'confirmed' && h.updatedBy)
    if (!hasConfirmedEntry) {
      order.statusHistory.push({
        status: 'confirmed',
        updatedBy: 'payment_verification',
        note: 'Payment verified via /api/payments/verify endpoint'
      })
    }

    // Award points if applicable
    if (order.pricing && order.pricing.subtotal > 0) {
      const pointsEarned = Math.floor(order.pricing.subtotal / 100)
      order.pointsEarned = pointsEarned
      order.pointsAwarded = true
    }

    await order.save()
    console.log('✅ Order saved with payment confirmation')

    // Send confirmation email asynchronously
    const statusTemplate = emailTemplates.orderStatusUpdate(
      {
        orderId: order._id.toString().slice(-6).toUpperCase(),
        shipping: order.shippingAddress,
        items: order.items
      },
      'confirmed'
    )
    sendEmail(order.user.email, statusTemplate).catch(err => console.error('❌ Error sending confirmation email:', err))

    res.json({ success: true, data: { orderId: order._id.toString(), order } })
  } catch (error) {
    console.error('❌ Error in payments verify route:', error)
    res.status(500).json({ success: false, error: error.message || 'Server error verifying payment' })
  }
})

export default router
