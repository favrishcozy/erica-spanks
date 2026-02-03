import axios from 'axios'
import crypto from 'crypto'

const PAYSTACK_API_URL = 'https://api.paystack.co'
const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY

const paystackAPI = axios.create({
  baseURL: PAYSTACK_API_URL,
  headers: {
    Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
    'Content-Type': 'application/json'
  }
})

/**
 * Initialize a payment with Paystack
 * Returns reference and authorization URL for client-side redirect
 */
export const initializePayment = async (email, amount, metadata = {}) => {
  try {
    console.log('🔄 Initializing Paystack payment for:', { email, amount, metadata })
    
    const response = await paystackAPI.post('/transaction/initialize', {
      email,
      amount: Math.round(amount * 100), // Convert to kobo (smallest unit)
      metadata: {
        ...metadata,
        timestamp: new Date().toISOString()
      }
    })

    console.log('✅ Paystack API response status:', response.data.status)
    console.log('📦 Paystack response data:', response.data.data)

    if (response.data.status) {
      const paymentData = {
        reference: response.data.data.reference,
        accessCode: response.data.data.access_code,
        authorizationUrl: response.data.data.authorization_url
      }
      console.log('✅ Payment data extracted:', paymentData)
      return {
        success: true,
        data: paymentData
      }
    } else {
      console.error('❌ Paystack returned status false:', response.data.message)
      return {
        success: false,
        error: response.data.message || 'Failed to initialize payment'
      }
    }
  } catch (error) {
    console.error('❌ Paystack initialization error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to initialize payment'
    }
  }
}

/**
 * Verify a payment transaction with Paystack
 */
export const verifyPayment = async (reference) => {
  try {
    const response = await paystackAPI.get(`/transaction/verify/${reference}`)

    if (response.data.status && response.data.data.status === 'success') {
      return {
        success: true,
        data: {
          reference: response.data.data.reference,
          amount: response.data.data.amount / 100, // Convert back from kobo to Naira
          status: response.data.data.status,
          paymentMethod: response.data.data.authorization?.channel || 'unknown',
          transactionId: response.data.data.id,
          timestamp: response.data.data.paid_at
        }
      }
    } else {
      return {
        success: false,
        error: 'Payment verification failed',
        data: response.data.data
      }
    }
  } catch (error) {
    console.error('Paystack verification error:', error.response?.data || error.message)
    return {
      success: false,
      error: error.response?.data?.message || 'Failed to verify payment'
    }
  }
}

/**
 * Verify webhook signature from Paystack
 * Used to validate incoming webhook events
 */
export const verifyWebhookSignature = (signature, payload) => {
  const hash = crypto
    .createHmac('sha512', PAYSTACK_SECRET_KEY)
    .update(JSON.stringify(payload))
    .digest('hex')

  return hash === signature
}

export default {
  initializePayment,
  verifyPayment,
  verifyWebhookSignature
}
