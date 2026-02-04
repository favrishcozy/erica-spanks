import express from 'express'
import mongoose from 'mongoose'
import { sendEmail, emailTemplates } from '../utils/emailService.js'
import { protect, admin } from '../middleware/auth.js'

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

// Newsletter campaign schema for tracking campaigns and scheduling
const campaignSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true
  },
  subject: {
    type: String,
    required: true
  },
  htmlContent: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['draft', 'scheduled', 'sent'],
    default: 'draft'
  },
  scheduledFor: {
    type: Date,
    default: null
  },
  sentAt: {
    type: Date,
    default: null
  },
  recipientCount: {
    type: Number,
    default: 0
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true })

const Campaign = mongoose.model('NewsletterCampaign', campaignSchema)

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

// ADMIN ENDPOINTS

// @desc    Get all subscribers count
// @route   GET /api/newsletter/admin/stats
// @access  Private/Admin
router.get('/admin/stats', protect, admin, async (req, res) => {
  try {
    const totalSubscribers = await Newsletter.countDocuments({ isActive: true })
    const totalCampaigns = await Campaign.countDocuments()
    const sentCampaigns = await Campaign.countDocuments({ status: 'sent' })
    
    res.json({
      success: true,
      data: {
        totalSubscribers,
        totalCampaigns,
        sentCampaigns
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch stats'
    })
  }
})

// @desc    Get all subscribers
// @route   GET /api/newsletter/admin/subscribers
// @access  Private/Admin
router.get('/admin/subscribers', protect, admin, async (req, res) => {
  try {
    const subscribers = await Newsletter.find({ isActive: true })
      .select('email subscribedAt')
      .sort({ subscribedAt: -1 })
      .limit(100)
    
    res.json({
      success: true,
      data: subscribers,
      count: subscribers.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch subscribers'
    })
  }
})

// @desc    Create or save campaign draft
// @route   POST /api/newsletter/admin/campaigns
// @access  Private/Admin
router.post('/admin/campaigns', protect, admin, async (req, res) => {
  try {
    const { title, subject, htmlContent, status = 'draft', scheduledFor } = req.body

    if (!title || !subject || !htmlContent) {
      return res.status(400).json({
        success: false,
        error: 'Title, subject, and content are required'
      })
    }

    const campaign = new Campaign({
      title,
      subject,
      htmlContent,
      status,
      scheduledFor: status === 'scheduled' ? scheduledFor : null,
      createdBy: req.user._id,
      recipientCount: 0
    })

    await campaign.save()

    res.status(201).json({
      success: true,
      data: campaign,
      message: `Campaign saved as ${status}`
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to create campaign'
    })
  }
})

// @desc    Update campaign
// @route   PUT /api/newsletter/admin/campaigns/:id
// @access  Private/Admin
router.put('/admin/campaigns/:id', protect, admin, async (req, res) => {
  try {
    const { title, subject, htmlContent, status, scheduledFor } = req.body

    const campaign = await Campaign.findById(req.params.id)
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      })
    }

    // Prevent editing sent campaigns
    if (campaign.status === 'sent') {
      return res.status(400).json({
        success: false,
        error: 'Cannot modify sent campaigns'
      })
    }

    campaign.title = title || campaign.title
    campaign.subject = subject || campaign.subject
    campaign.htmlContent = htmlContent || campaign.htmlContent
    campaign.status = status || campaign.status
    campaign.scheduledFor = status === 'scheduled' ? scheduledFor : null
    campaign.updatedAt = new Date()

    await campaign.save()

    res.json({
      success: true,
      data: campaign,
      message: 'Campaign updated'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to update campaign'
    })
  }
})

// @desc    Get all campaigns
// @route   GET /api/newsletter/admin/campaigns
// @access  Private/Admin
router.get('/admin/campaigns', protect, admin, async (req, res) => {
  try {
    const campaigns = await Campaign.find()
      .populate('createdBy', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
    
    res.json({
      success: true,
      data: campaigns,
      count: campaigns.length
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaigns'
    })
  }
})

// @desc    Get single campaign
// @route   GET /api/newsletter/admin/campaigns/:id
// @access  Private/Admin
router.get('/admin/campaigns/:id', protect, admin, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)
      .populate('createdBy', 'name email')
    
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      })
    }

    res.json({
      success: true,
      data: campaign
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to fetch campaign'
    })
  }
})

// @desc    Send campaign immediately or schedule it
// @route   POST /api/newsletter/admin/campaigns/:id/send
// @access  Private/Admin
router.post('/admin/campaigns/:id/send', protect, admin, async (req, res) => {
  try {
    const { sendNow = true, scheduledFor } = req.body

    const campaign = await Campaign.findById(req.params.id)
    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      })
    }

    if (campaign.status === 'sent') {
      return res.status(400).json({
        success: false,
        error: 'Campaign already sent'
      })
    }

    // Get all active subscribers
    const subscribers = await Newsletter.find({ isActive: true }).select('email')

    if (subscribers.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'No active subscribers found'
      })
    }

    if (sendNow) {
      // Send immediately
      console.log(`[NEWSLETTER] Sending campaign to ${subscribers.length} subscribers...`)
      
      let successCount = 0
      for (const subscriber of subscribers) {
        const sent = await sendEmail(subscriber.email, {
          subject: campaign.subject,
          html: campaign.htmlContent
        })
        if (sent) successCount++
      }

      campaign.status = 'sent'
      campaign.sentAt = new Date()
      campaign.recipientCount = subscribers.length
      await campaign.save()

      res.json({
        success: true,
        data: campaign,
        message: `Campaign sent to ${successCount}/${subscribers.length} subscribers`
      })
    } else {
      // Schedule for later
      campaign.status = 'scheduled'
      campaign.scheduledFor = scheduledFor
      campaign.recipientCount = subscribers.length
      await campaign.save()

      res.json({
        success: true,
        data: campaign,
        message: `Campaign scheduled for ${new Date(scheduledFor).toLocaleString()}`
      })
    }
  } catch (error) {
    console.error('[NEWSLETTER] Send error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to send campaign'
    })
  }
})

// @desc    Delete campaign
// @route   DELETE /api/newsletter/admin/campaigns/:id
// @access  Private/Admin
router.delete('/admin/campaigns/:id', protect, admin, async (req, res) => {
  try {
    const campaign = await Campaign.findById(req.params.id)

    if (!campaign) {
      return res.status(404).json({
        success: false,
        error: 'Campaign not found'
      })
    }

    if (campaign.status === 'sent') {
      return res.status(400).json({
        success: false,
        error: 'Cannot delete sent campaigns'
      })
    }

    await Campaign.findByIdAndDelete(req.params.id)

    res.json({
      success: true,
      message: 'Campaign deleted'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to delete campaign'
    })
  }
})

export default router
