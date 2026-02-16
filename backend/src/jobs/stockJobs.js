import cron from 'node-cron'
import * as stockService from '../services/stockService.js'
import * as pointsService from '../services/pointsService.js'
import Order from '../models/Order.js'
import StockReservation from '../models/StockReservation.js'
import { sendEmail, emailTemplates } from '../utils/emailService.js'

/**
 * Stock Management Scheduled Jobs
 * Handles automated stock cleanup, monitoring, and reconciliation
 */

/**
 * Clean up expired stock reservations every 15 minutes
 */
const scheduleReservationCleanup = () => {
  cron.schedule('*/15 * * * *', async () => {
    try {
      console.log('🧹 Starting scheduled reservation cleanup...')
      
      const result = await stockService.cleanupExpiredReservations()
      
      if (result.updated > 0) {
        console.log(`✅ Cleaned up ${result.updated} expired reservations`)
        
        // Send admin notification for significant cleanup
        if (result.updated > 10) {
          await sendAdminNotification('Stock Reservation Cleanup', 
            `Cleaned up ${result.updated} expired stock reservations`)
        }
      } else {
        console.log('ℹ️ No expired reservations to clean up')
      }
    } catch (error) {
      console.error('❌ Error in scheduled reservation cleanup:', error)
    }
  })
}

/**
 * Daily stock reconciliation for failed orders
 */
const scheduleDailyReconciliation = () => {
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🔄 Starting daily stock reconciliation...')
      
      // Find failed orders from the last 24 hours that might need reconciliation
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      
      const failedOrders = await Order.find({
        status: 'payment_failed',
        createdAt: { $gte: yesterday }
      })
      
      let reconciledCount = 0
      
      for (const order of failedOrders) {
        try {
          const result = await stockService.reconcileStockForOrder(order._id)
          if (result.success) {
            reconciledCount++
          }
        } catch (error) {
          console.error(`Error reconciling order ${order._id}:`, error)
        }
      }
      
      if (reconciledCount > 0) {
        console.log(`✅ Reconciled stock for ${reconciledCount} failed orders`)
        
        await sendAdminNotification('Daily Stock Reconciliation',
          `Reconciled stock for ${reconciledCount} failed orders`)
      } else {
        console.log('ℹ️ No failed orders to reconcile')
      }
    } catch (error) {
      console.error('❌ Error in daily stock reconciliation:', error)
    }
  })
}

/**
 * Weekly points expiry cleanup
 */
const scheduleWeeklyPointsCleanup = () => {
  cron.schedule('0 3 * * 0', async () => {
    try {
      console.log('📅 Starting weekly points expiry cleanup...')
      
      const result = await pointsService.cleanupExpiredPoints()
      
      if (result.totalPointsExpired > 0) {
        console.log(`✅ Expired ${result.totalPointsExpired} points for ${result.processed} transactions`)
        
        await sendAdminNotification('Weekly Points Cleanup',
          `Expired ${result.totalPointsExpired} points across ${result.processed} transactions`)
      } else {
        console.log('ℹ️ No points to expire this week')
      }
    } catch (error) {
      console.error('❌ Error in weekly points cleanup:', error)
    }
  })
}

/**
 * Daily low stock report
 */
const scheduleDailyLowStockReport = () => {
  cron.schedule('0 9 * * *', async () => {
    try {
      console.log('📊 Generating daily low stock report...')
      
      const Product = require('../models/Product.js')
      const lowStockProducts = await Product.find({
        isActive: true,
        $or: [
          { stockStatus: 'low_stock' },
          { stockStatus: 'out_of_stock' }
        ]
      })
      .populate('category', 'name')
      .sort({ stockStatus: 1, totalInventory: 1 })
      
      if (lowStockProducts.length > 0) {
        const report = generateLowStockReport(lowStockProducts)
        
        await sendAdminNotification('Daily Low Stock Report',
          report,
          'low_stock_report')
      } else {
        console.log('ℹ️ No low stock products today')
      }
    } catch (error) {
      console.error('❌ Error generating low stock report:', error)
    }
  })
}

/**
 * Monthly stock audit and reconciliation
 */
const scheduleMonthlyStockAudit = () => {
  cron.schedule('0 4 1 * *', async () => {
    try {
      console.log('🔍 Starting monthly stock audit...')
      
      const Product = require('../models/Product.js')
      const products = await Product.find({ isActive: true })
      
      let discrepancies = []
      let totalDiscrepancies = 0
      
      for (const product of products) {
        // Calculate expected vs actual stock
        const expectedStock = product.variations.reduce((sum, v) => sum + v.inventory.quantity, 0)
        
        // This is a simplified check - in a real system you'd compare against
        // actual physical inventory or more detailed transaction logs
        if (expectedStock < 0) {
          discrepancies.push({
            productId: product._id,
            name: product.name,
            issue: 'Negative stock detected'
          })
          totalDiscrepancies++
        }
      }
      
      if (discrepancies.length > 0) {
        const report = generateStockAuditReport(discrepancies, totalDiscrepancies)
        
        await sendAdminNotification('Monthly Stock Audit',
          report,
          'stock_audit')
      } else {
        console.log('✅ No stock discrepancies detected this month')
      }
    } catch (error) {
      console.error('❌ Error in monthly stock audit:', error)
    }
  })
}

/**
 * Monitor and alert on high reservation rates
 */
const scheduleReservationMonitoring = () => {
  cron.schedule('*/30 * * * *', async () => {
    try {
      const now = new Date()
      const oneHourAgo = new Date(now.getTime() - 60 * 60 * 1000)
      
      // Count reservations in the last hour
      const recentReservations = await StockReservation.countDocuments({
        createdAt: { $gte: oneHourAgo },
        status: { $in: ['reserved', 'confirmed'] }
      })
      
      // Count expired reservations in the last hour
      const expiredReservations = await StockReservation.countDocuments({
        expiresAt: { $gte: oneHourAgo, $lte: now },
        status: 'expired'
      })
      
      // Calculate conversion rate
      const totalReservations = recentReservations + expiredReservations
      const conversionRate = totalReservations > 0 ? (recentReservations / totalReservations) * 100 : 0
      
      // Alert if conversion rate is too low (high abandonment)
      if (totalReservations > 20 && conversionRate < 50) {
        await sendAdminNotification('High Reservation Abandonment',
          `Low conversion rate: ${conversionRate.toFixed(1)}% (${recentReservations}/${totalReservations})`)
      }
      
      // Alert if too many reservations are expiring
      if (expiredReservations > 10) {
        await sendAdminNotification('High Reservation Expiry',
          `${expiredReservations} reservations expired in the last hour`)
      }
    } catch (error) {
      console.error('❌ Error in reservation monitoring:', error)
    }
  })
}

/**
 * Helper function to send admin notifications
 */
const sendAdminNotification = async (subject, message, type = 'general') => {
  try {
    // In a real implementation, you'd have admin email addresses configured
    const adminEmails = process.env.ADMIN_EMAILS?.split(',') || ['admin@erica-spanks.com']
    
    for (const email of adminEmails) {
      const template = emailTemplates.adminNotification({
        subject,
        message,
        type,
        timestamp: new Date().toISOString()
      })
      
      await sendEmail(email, template)
    }
    
    console.log(`📧 Admin notification sent: ${subject}`)
  } catch (error) {
    console.error('❌ Error sending admin notification:', error)
  }
}

/**
 * Generate low stock report
 */
const generateLowStockReport = (products) => {
  const lowStock = products.filter(p => p.stockStatus === 'low_stock')
  const outOfStock = products.filter(p => p.stockStatus === 'out_of_stock')
  
  let report = `Daily Low Stock Report - ${new Date().toLocaleDateString()}\n\n`
  report += `Total Products with Issues: ${products.length}\n`
  report += `Low Stock: ${lowStock.length}\n`
  report += `Out of Stock: ${outOfStock.length}\n\n`
  
  report += '=== OUT OF STOCK PRODUCTS ===\n'
  outOfStock.forEach(p => {
    report += `- ${p.name} (${p.category.name})\n`
  })
  
  report += '\n=== LOW STOCK PRODUCTS ===\n'
  lowStock.forEach(p => {
    report += `- ${p.name} (${p.category.name}) - ${p.totalInventory} units\n`
  })
  
  return report
}

/**
 * Generate stock audit report
 */
const generateStockAuditReport = (discrepancies, totalDiscrepancies) => {
  let report = `Monthly Stock Audit Report - ${new Date().toLocaleDateString()}\n\n`
  report += `Total Discrepancies: ${totalDiscrepancies}\n\n`
  
  discrepancies.forEach(d => {
    report += `- ${d.name}: ${d.issue}\n`
  })
  
  return report
}

/**
 * Start all stock management jobs
 */
export const startStockJobs = () => {
  console.log('🚀 Starting stock management scheduled jobs...')
  
  scheduleReservationCleanup()
  scheduleDailyReconciliation()
  scheduleWeeklyPointsCleanup()
  scheduleDailyLowStockReport()
  scheduleMonthlyStockAudit()
  scheduleReservationMonitoring()
  
  console.log('✅ All stock management jobs started')
}

/**
 * Stop all stock management jobs (for graceful shutdown)
 */
export const stopStockJobs = () => {
  console.log('🛑 Stopping stock management scheduled jobs...')
  cron.destroy()
  console.log('✅ All stock management jobs stopped')
}

export default {
  startStockJobs,
  stopStockJobs
}