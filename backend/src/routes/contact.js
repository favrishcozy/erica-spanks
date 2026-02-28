import express from 'express'
import { Resend } from 'resend'

const router = express.Router()
const resend = new Resend(process.env.RESEND_API_KEY)

// @desc    Submit contact form
// @route   POST /api/contact
// @access  Public
router.post('/', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body

    // Basic validation
    if (!name || !email || !subject || !message) {
      return res.status(400).json({
        success: false,
        error: 'Please provide all required fields'
      })
    }

    // Email config - using Resend service

    // Email content formatted with Resend styling
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #C9A876; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">New Contact Form Submission</h1>
        </div>

        <div style="padding: 30px; border: 1px solid #eee; border-top: none;">
          <p><strong>Name:</strong> ${name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Subject:</strong> ${subject}</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Message:</strong></p>
            <p style="white-space: pre-wrap; word-wrap: break-word;">${message}</p>
          </div>

          <p style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
            This is an automated message from your contact form. Reply directly to ${email}
          </p>
        </div>
      </div>
    `

    // Send email via Resend
    const response = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'Erica Spanks <noreply@ericaspanks.com>',
      to: 'info@ericaspanks.com',
      subject: `Contact Form: ${subject}`,
      html: html,
      replyTo: email
    })

    const { data, error } = response

    if (error) {
      console.error('❌ Contact form Resend error:', error)
      return res.status(500).json({
        success: false,
        error: 'Failed to send message. Please try again.'
      })
    }

    console.log('✅ Contact form email sent. ID:', data.id)

    res.json({
      success: true,
      message: 'Message sent successfully'
    })
  } catch (error) {
    console.error('❌ Contact form error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to send message. Please try again.'
    })
  }
})

export default router
