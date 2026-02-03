import nodemailer from 'nodemailer'

// Centralized email transporter factory
let transporter = null

export const getEmailTransporter = () => {
  if (transporter) return transporter

  transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: process.env.SMTP_PORT || 587,
    secure: process.env.SMTP_SECURE === 'true' || false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS
    }
  })

  return transporter
}

// Email templates
export const emailTemplates = {
  orderConfirmation: (order) => ({
    subject: `Order Confirmation #${order.orderId}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #FF1493; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 28px;">Thank You for Your Order!</h1>
        </div>
        
        <div style="padding: 30px; border: 1px solid #eee; border-top: none;">
          <p>Hi ${order.shipping?.firstName || 'Valued Customer'},</p>
          
          <p>Your order has been successfully placed. Here are your order details:</p>
          
          <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p><strong>Order Number:</strong> #${order.orderId || 'N/A'}</p>
            <p><strong>Order Date:</strong> ${order.createdAt ? new Date(order.createdAt).toLocaleDateString() : 'N/A'}</p>
            <p><strong>Status:</strong> ${order.status || 'Pending'}</p>
          </div>
          
          <h3>Order Items</h3>
          <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
            <tr style="border-bottom: 2px solid #eee;">
              <th style="text-align: left; padding: 10px;">Product</th>
              <th style="text-align: center; padding: 10px;">Size/Color</th>
              <th style="text-align: right; padding: 10px;">Qty</th>
              <th style="text-align: right; padding: 10px;">Price</th>
            </tr>
            ${order.items && order.items.length > 0 ? order.items.map(item => `
              <tr style="border-bottom: 1px solid #eee;">
                <td style="padding: 10px;">${item.productSnapshot?.name || item.name || 'Product'}</td>
                <td style="text-align: center; padding: 10px;">${item.variation?.size || 'N/A'} / ${item.variation?.color || 'N/A'}</td>
                <td style="text-align: right; padding: 10px;">${item.quantity || 0}</td>
                <td style="text-align: right; padding: 10px;">N${(item.unitPrice || 0).toLocaleString()}</td>
              </tr>
              ${item.productSnapshot?.image ? `
              <tr style="border-bottom: 1px solid #eee;">
                <td colspan="4" style="padding: 10px; text-align: center;">
                  <img src="${item.productSnapshot.image}" alt="${item.productSnapshot.name}" style="max-width: 200px; height: auto; border-radius: 4px;">
                </td>
              </tr>
              ` : ''}
            `).join('') : '<tr><td colspan="4" style="padding: 10px; text-align: center;">No items</td></tr>'}
          </table>
          
          <div style="background: #f0f0f0; padding: 15px; border-radius: 6px; margin: 20px 0;">
            <p style="margin: 5px 0;"><strong>Subtotal:</strong> N${(order.pricing?.subtotal || 0).toLocaleString()}</p>
            ${order.pricing?.discount ? `<p style="margin: 5px 0;"><strong>Discount:</strong> -N${order.pricing.discount.toLocaleString()}</p>` : ''}
            <p style="margin: 5px 0;"><strong>Shipping:</strong> N${(order.pricing?.shippingFee || 0).toLocaleString()}</p>
            <p style="margin: 5px 0; font-size: 18px; color: #FF1493;"><strong>Total: N${(order.pricing?.total || 0).toLocaleString()}</strong></p>
          </div>
          
          <h3>Shipping Address</h3>
          <p style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
            ${order.shipping?.firstName || 'N/A'} ${order.shipping?.lastName || ''}<br>
            ${order.shipping?.address1 || 'N/A'}<br>
            ${order.shipping?.address2 ? order.shipping.address2 + '<br>' : ''}
            ${order.shipping?.city || 'N/A'}, ${order.shipping?.state || 'N/A'} ${order.shipping?.zipCode || ''}<br>
            ${order.shipping?.country || 'Nigeria'}<br>
            ${order.shipping?.phone || 'N/A'}
          </p>
          
          <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            We will send you tracking information as soon as your order ships!
          </p>
          
          <p>If you have any questions, please contact us at info@ericaspanks.com</p>
          
          <p style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
            Copyright 2026 Erica Spanks. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  newsletterWelcome: (email) => ({
    subject: 'Welcome to Erica Spanks Newsletter!',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #FF1493; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Welcome to Our Newsletter!</h1>
        </div>
        
        <div style="padding: 30px; border: 1px solid #eee; border-top: none;">
          <p>Hi there,</p>
          
          <p>Thank you for subscribing to the Erica Spanks newsletter! You are now part of our exclusive community and will be the first to know about:</p>
          
          <ul style="margin: 20px 0;">
            <li>New collection launches</li>
            <li>Exclusive promotions and discounts</li>
            <li>Style tips and fashion inspiration</li>
            <li>Special member-only offers</li>
          </ul>
          
          <p>Stay tuned for amazing content and exclusive deals!</p>
          
          <p style="margin-top: 30px; border-top: 1px solid #eee; padding-top: 20px;">
            If you wish to unsubscribe, you can do so at any time by clicking the unsubscribe link in future emails.
          </p>
          
          <p>Happy shopping!</p>
          <p><strong>The Erica Spanks Team</strong></p>
          
          <p style="margin-top: 20px; text-align: center; color: #999; font-size: 12px;">
            © 2026 Erica Spanks. All rights reserved.
          </p>
        </div>
      </div>
    `
  }),

  orderStatusUpdate: (order, newStatus) => ({
    subject: `Order Update: Your Order #${order.orderId || 'N/A'} is ${newStatus || 'Updated'}`,
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; color: #333;">
        <div style="background: #FF1493; color: white; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 24px;">Order Status Update</h1>
        </div>
        
        <div style="padding: 30px; border: 1px solid #eee; border-top: none;">
          <p>Hi ${order.shipping?.firstName || 'Valued Customer'},</p>
          
          <p>Your order #${order.orderId || 'N/A'} status has been updated!</p>
          
          <div style="background: #f0f0f0; padding: 20px; border-radius: 6px; margin: 20px 0; text-align: center;">
            <p style="margin: 0; font-size: 14px; color: #999;">Current Status</p>
            <p style="margin: 10px 0; font-size: 24px; color: #FF1493; font-weight: bold; text-transform: capitalize;">
              ${newStatus || 'Updated'}
            </p>
          </div>
          
          <p>Thank you for your order! We appreciate your business.</p>
          
          <p style="margin-top: 20px; border-top: 1px solid #eee; padding-top: 20px;">
            If you have any questions about your order, please do not hesitate to contact us at info@ericaspanks.com
          </p>
          
          <p style="text-align: center; color: #999; font-size: 12px; margin-top: 20px;">
            Copyright 2026 Erica Spanks. All rights reserved.
          </p>
        </div>
      </div>
    `
  })
}

// Send email helper
export const sendEmail = async (to, template) => {
  try {
    console.log(`[EMAIL] Attempting to send email to: ${to}`)
    console.log(`[EMAIL] Subject: ${template.subject}`)
    
    const transporter = getEmailTransporter()
    
    if (!transporter) {
      console.warn('[EMAIL] ❌ Email transporter not configured. Email not sent to:', to)
      return false
    }

    console.log('[EMAIL] ✅ Transporter initialized')

    const mailOptions = {
      from: process.env.SMTP_FROM || `"Erica Spanks" <${process.env.SMTP_USER}>`,
      to,
      ...template
    }

    const result = await transporter.sendMail(mailOptions)
    console.log(`[EMAIL] ✅ Email sent successfully to ${to}. Message ID: ${result.messageId}`)
    return true
  } catch (error) {
    console.error(`[EMAIL] ❌ Failed to send email to ${to}:`, error.message)
    return false
  }
}
