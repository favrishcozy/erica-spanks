import express from 'express'
import mongoose from 'mongoose'
import { sendEmail, emailTemplates } from '../utils/emailService.js'

const router = express.Router()

// Simple newsletter subscription schema
const newsletterSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  subscribedAt: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  }
})

const Newsletter = mongoose.model('Newsletter', newsletterSchema)

// @desc    Subscribe to newsletter
// @route   POST /api/newsletter/subscribe
// @access  Public
router.post('/subscribe', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      })
    }

    // Check if email already exists
    const existingSubscriber = await Newsletter.findOne({ email })
    
    if (existingSubscriber) {
      if (existingSubscriber.isActive) {
        return res.status(400).json({
          success: false,
          error: 'This email is already subscribed to our newsletter'
        })
      } else {
        // Reactivate subscription
        existingSubscriber.isActive = true
        existingSubscriber.subscribedAt = new Date()
        await existingSubscriber.save()
        
        return res.json({
          success: true,
          message: 'Successfully resubscribed to our newsletter!'
        })
      }
    }

    // Create new subscription
    const newSubscriber = new Newsletter({ email })
    await newSubscriber.save()

    // Send welcome email
    const welcomeTemplate = emailTemplates.newsletterWelcome(email)
    await sendEmail(email, welcomeTemplate)

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to our newsletter!'
    })
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'This email is already subscribed'
      })
    }

    res.status(500).json({
      success: false,
      error: 'Failed to subscribe. Please try again.'
    })
  }
})

// @desc    Unsubscribe from newsletter
// @route   POST /api/newsletter/unsubscribe
// @access  Public
router.post('/unsubscribe', async (req, res) => {
  try {
    const { email } = req.body

    if (!email) {
      return res.status(400).json({
        success: false,
        error: 'Email address is required'
      })
    }

    const subscriber = await Newsletter.findOne({ email })
    
    if (!subscriber) {
      return res.status(404).json({
        success: false,
        error: 'Email not found in our newsletter list'
      })
    }

    subscriber.isActive = false
    await subscriber.save()

    res.json({
      success: true,
      message: 'Successfully unsubscribed from our newsletter'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to unsubscribe. Please try again.'
    })
  }
})

export default router
