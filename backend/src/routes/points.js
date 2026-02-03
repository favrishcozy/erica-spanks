import express from 'express'
import * as pointsService from '../services/pointsService.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

/**
 * PUBLIC ENDPOINTS
 */

/**
 * GET /api/points/balance
 * Get current user's points balance and details
 */
router.get('/balance', protect, async (req, res, next) => {
  try {
    const balance = await pointsService.getBalanceDetails(req.user._id)
    res.json({
      success: true,
      balance
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/points/history
 * Get current user's transaction history
 * Query: ?limit=20&skip=0
 */
router.get('/history', protect, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const skip = parseInt(req.query.skip) || 0

    const history = await pointsService.getUserTransactionHistory(req.user._id, limit, skip)
    res.json({
      success: true,
      ...history
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/points/available-tiers
 * Get redemption tiers eligible for current user
 * Query: ?cart_subtotal=5000
 */
router.get('/available-tiers', protect, async (req, res, next) => {
  try {
    const cartSubtotal = parseFloat(req.query.cart_subtotal) || 0

    const tiers = await pointsService.getEligibleTiers(req.user._id, cartSubtotal)
    res.json({
      success: true,
      tiers
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/points/reserve
 * Reserve points for redemption (before checkout)
 * Body: { tier_id }
 */
router.post('/reserve', protect, async (req, res, next) => {
  try {
    const { tier_id } = req.body

    if (!tier_id) {
      return res.status(400).json({
        success: false,
        message: 'tier_id is required'
      })
    }

    const reservation = await pointsService.reservePoints(req.user._id, tier_id)
    res.json({
      success: true,
      reservation
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/points/redeem
 * Confirm points redemption (after successful payment)
 * Body: { reservation_id, order_id }
 * This should be called from order completion handler
 */
router.post('/redeem', protect, async (req, res, next) => {
  try {
    const { reservation_id, order_id } = req.body

    if (!reservation_id || !order_id) {
      return res.status(400).json({
        success: false,
        message: 'reservation_id and order_id are required'
      })
    }

    const result = await pointsService.confirmRedemption(
      req.user._id,
      reservation_id,
      order_id
    )

    res.json({
      success: true,
      result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/points/cancel-reservation
 * Release reserved points if checkout fails
 * Body: { reservation_id }
 */
router.post('/cancel-reservation', protect, async (req, res, next) => {
  try {
    const { reservation_id } = req.body

    if (!reservation_id) {
      return res.status(400).json({
        success: false,
        message: 'reservation_id is required'
      })
    }

    const result = await pointsService.releaseReservedPoints(req.user._id, reservation_id)
    res.json({
      success: true,
      released: result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * ADMIN ENDPOINTS
 */

/**
 * GET /api/points/admin/users/:userId/balance
 * Get any user's points balance (admin only)
 */
router.get('/admin/users/:userId/balance', protect, admin, async (req, res, next) => {
  try {
    const balance = await pointsService.getBalanceDetails(req.params.userId)
    res.json({
      success: true,
      balance
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/points/admin/users/:userId/history
 * Get any user's transaction history (admin only)
 */
router.get('/admin/users/:userId/history', protect, admin, async (req, res, next) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100)
    const skip = parseInt(req.query.skip) || 0

    const history = await pointsService.getUserTransactionHistory(
      req.params.userId,
      limit,
      skip
    )
    res.json({
      success: true,
      ...history
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/points/admin/adjust
 * Adjust user's points (admin only)
 * Body: { user_id, amount, reason }
 */
router.post('/admin/adjust', protect, admin, async (req, res, next) => {
  try {
    const { user_id, amount, reason } = req.body

    if (!user_id || amount === undefined || !reason) {
      return res.status(400).json({
        success: false,
        message: 'user_id, amount, and reason are required'
      })
    }

    if (typeof amount !== 'number') {
      return res.status(400).json({
        success: false,
        message: 'amount must be a number'
      })
    }

    const newBalance = await pointsService.adminAdjustPoints(
      user_id,
      amount,
      reason,
      req.user._id
    )

    res.json({
      success: true,
      new_balance: newBalance
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/points/admin/freeze
 * Freeze user's points account (admin only)
 * Body: { user_id, reason }
 */
router.post('/admin/freeze', protect, admin, async (req, res, next) => {
  try {
    const { user_id, reason } = req.body

    if (!user_id || !reason) {
      return res.status(400).json({
        success: false,
        message: 'user_id and reason are required'
      })
    }

    const result = await pointsService.freezeAccount(user_id, reason)
    res.json({
      success: true,
      frozen: result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/points/admin/unfreeze
 * Unfreeze user's points account (admin only)
 * Body: { user_id }
 */
router.post('/admin/unfreeze', protect, admin, async (req, res, next) => {
  try {
    const { user_id } = req.body

    if (!user_id) {
      return res.status(400).json({
        success: false,
        message: 'user_id is required'
      })
    }

    const result = await pointsService.unfreezeAccount(user_id)
    res.json({
      success: true,
      unfrozen: result
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/points/admin/cleanup-expired
 * Run cleanup for expired points (admin only)
 * Should be called by scheduled job
 */
router.get('/admin/cleanup-expired', protect, admin, async (req, res, next) => {
  try {
    const result = await pointsService.cleanupExpiredPoints()
    res.json({
      success: true,
      ...result
    })
  } catch (error) {
    next(error)
  }
})

export default router
