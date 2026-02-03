import cron from 'node-cron'
import * as pointsService from '../services/pointsService.js'

/**
 * Background Jobs
 * Scheduled tasks that run periodically
 */

export const initializeScheduledJobs = () => {
  // Run points cleanup at 2 AM daily
  // Schedule: 0 2 * * * (2 AM every day)
  cron.schedule('0 2 * * *', async () => {
    try {
      console.log('🧹 Starting scheduled cleanup of expired points...')
      const result = await pointsService.cleanupExpiredPoints()
      console.log(`✅ Points cleanup completed: ${result.processed} transactions processed, ${result.totalPointsExpired} points expired`)
    } catch (error) {
      console.error('❌ Error in scheduled points cleanup:', error)
    }
  })

  console.log('⏰ Scheduled jobs initialized')
}

export default {
  initializeScheduledJobs
}
