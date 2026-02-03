import PointsBalance from '../models/PointsBalance.js'
import PointsTransaction from '../models/PointsTransaction.js'
import RedemptionTier from '../models/RedemptionTier.js'
import PointsConfig from '../models/PointsConfig.js'

/**
 * Points Service
 * Core business logic for Discount Points system
 */

// ============ CONFIG HELPERS ============

export const getConfig = async (key) => {
  try {
    const config = await PointsConfig.findOne({ config_key: key })
    return config ? config.value : null
  } catch (error) {
    console.error(`Error fetching config ${key}:`, error)
    return null
  }
}

export const getPointsConversionRate = async () => {
  const rate = await getConfig('points_conversion_rate')
  return rate || 500 // Default: ₦500 = 1 point
}

export const getPointsExpiryDays = async () => {
  const days = await getConfig('points_expiry_days')
  return days || 180 // Default: 180 days
}

export const isSystemEnabled = async () => {
  const enabled = await getConfig('system_enabled')
  return enabled !== false // Default: true
}

export const canStackWithCoupons = async () => {
  const allowed = await getConfig('allow_stacking_with_coupons')
  return allowed === true // Default: false
}

// ============ BALANCE MANAGEMENT ============

/**
 * Get or create user points balance
 */
export const getOrCreateBalance = async (userId) => {
  try {
    let balance = await PointsBalance.findOne({ userId })
    if (!balance) {
      balance = await PointsBalance.create({ userId })
    }
    return balance
  } catch (error) {
    console.error('Error getting/creating balance:', error)
    throw error
  }
}

/**
 * Get user's current points balance
 */
export const getUserBalance = async (userId) => {
  try {
    const balance = await PointsBalance.findOne({ userId })
    if (!balance) return 0
    return balance.current_balance
  } catch (error) {
    console.error('Error fetching user balance:', error)
    throw error
  }
}

/**
 * Get detailed balance info including totals
 */
export const getBalanceDetails = async (userId) => {
  try {
    const balance = await PointsBalance.findOne({ userId })
    if (!balance) return null

    // Check for expiring points (within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const expiringPoints = await PointsTransaction.aggregate([
      {
        $match: {
          userId: balance.userId,
          type: 'earned',
          expiry_date: {
            $lte: thirtyDaysFromNow,
            $gt: new Date()
          }
        }
      },
      {
        $group: {
          _id: null,
          total: { $sum: '$amount' }
        }
      }
    ])

    return {
      current_balance: balance.current_balance,
      total_earned: balance.total_earned,
      total_redeemed: balance.total_redeemed,
      is_frozen: balance.is_frozen,
      freeze_reason: balance.freeze_reason,
      expiring_soon: expiringPoints.length > 0 ? expiringPoints[0].total : 0,
      createdAt: balance.createdAt,
      updatedAt: balance.updatedAt
    }
  } catch (error) {
    console.error('Error fetching balance details:', error)
    throw error
  }
}

/**
 * Check if account is frozen (fraud protection)
 */
export const isAccountFrozen = async (userId) => {
  try {
    const balance = await PointsBalance.findOne({ userId })
    return balance ? balance.is_frozen : false
  } catch (error) {
    console.error('Error checking if account frozen:', error)
    return false
  }
}

// ============ POINTS EARNING ============

/**
 * Award points on successful order completion
 * Called when order status changes to 'completed' or 'delivered'
 * 
 * @param {ObjectId} userId - User ID
 * @param {number} orderSubtotal - Order subtotal (before tax/shipping)
 * @param {ObjectId} orderId - Reference to order
 * @returns {number} points earned
 */
export const awardPointsForOrder = async (userId, orderSubtotal, orderId) => {
  try {
    const systemEnabled = await isSystemEnabled()
    if (!systemEnabled) return 0

    const isFrozen = await isAccountFrozen(userId)
    if (isFrozen) {
      console.warn(`Account frozen for user ${userId}, skipping points award`)
      return 0
    }

    // Calculate points using conversion rate
    const conversionRate = await getPointsConversionRate()
    const pointsEarned = Math.floor(orderSubtotal / conversionRate)

    if (pointsEarned === 0) return 0

    // Get or create balance
    const balance = await getOrCreateBalance(userId)

    // Calculate expiry date
    const expiryDays = await getPointsExpiryDays()
    const expiryDate = new Date()
    expiryDate.setDate(expiryDate.getDate() + expiryDays)

    // Create transaction record
    await PointsTransaction.create({
      userId,
      type: 'earned',
      amount: pointsEarned,
      reason: `Points earned for order ${orderId}`,
      orderId,
      expiry_date: expiryDate,
      metadata: {
        order_subtotal: orderSubtotal,
        conversion_rate: conversionRate
      }
    })

    // Update balance
    balance.current_balance += pointsEarned
    balance.total_earned += pointsEarned
    await balance.save()

    return pointsEarned
  } catch (error) {
    console.error('Error awarding points:', error)
    throw error
  }
}

/**
 * Reverse points earned (on order cancellation/refund)
 */
export const reversePointsForOrder = async (userId, orderId) => {
  try {
    // Find earned points for this order
    const earnedTransaction = await PointsTransaction.findOne({
      userId,
      orderId,
      type: 'earned'
    })

    if (!earnedTransaction) return 0

    const balance = await getOrCreateBalance(userId)

    // Create reversal transaction
    await PointsTransaction.create({
      userId,
      type: 'reversal',
      amount: earnedTransaction.amount,
      reason: `Points reversal for cancelled/refunded order ${orderId}`,
      orderId,
      reversed_transaction_id: earnedTransaction._id
    })

    // Update balance (subtract reversed points)
    const reversalAmount = Math.min(earnedTransaction.amount, balance.current_balance)
    balance.current_balance -= reversalAmount
    balance.total_earned -= earnedTransaction.amount
    await balance.save()

    return reversalAmount
  } catch (error) {
    console.error('Error reversing points:', error)
    throw error
  }
}

// ============ POINTS EXPIRY ============

/**
 * Clean up expired points (run periodically)
 * Should be called via scheduled job (cron) daily
 */
export const cleanupExpiredPoints = async () => {
  try {
    const now = new Date()

    // Find all expired earned points
    const expiredTransactions = await PointsTransaction.find({
      type: 'earned',
      expiry_date: { $lt: now }
    }).select('_id userId amount')

    if (expiredTransactions.length === 0) {
      return { processed: 0, totalPointsExpired: 0 }
    }

    let totalExpired = 0
    const userUpdates = new Map()

    // Group by user
    for (const tx of expiredTransactions) {
      totalExpired += tx.amount
      if (!userUpdates.has(tx.userId.toString())) {
        userUpdates.set(tx.userId.toString(), 0)
      }
      userUpdates.set(tx.userId.toString(), userUpdates.get(tx.userId.toString()) + tx.amount)
    }

    // Update all affected user balances
    for (const [userId, amount] of userUpdates) {
      const balance = await PointsBalance.findOne({ userId })
      if (balance) {
        balance.current_balance = Math.max(0, balance.current_balance - amount)
        await balance.save()
      }

      // Create expiry transaction record
      await PointsTransaction.create({
        userId,
        type: 'expired',
        amount,
        reason: 'Points expired after retention period'
      })
    }

    // Mark transactions as expired (update type)
    await PointsTransaction.updateMany(
      { _id: { $in: expiredTransactions.map(t => t._id) } },
      { type: 'expired' }
    )

    return {
      processed: expiredTransactions.length,
      totalPointsExpired
    }
  } catch (error) {
    console.error('Error cleaning up expired points:', error)
    throw error
  }
}

// ============ POINTS REDEMPTION - TIERS ============

/**
 * Get all active redemption tiers
 */
export const getRedemptionTiers = async (sortByValue = true) => {
  try {
    const query = { is_active: true }
    const tiers = await RedemptionTier.find(query).sort({ tier_rank: 1 })
    return tiers
  } catch (error) {
    console.error('Error fetching redemption tiers:', error)
    throw error
  }
}

/**
 * Get eligible redemption tiers for a user
 * Checks: has enough points, cart meets minimum, within monthly limit
 */
export const getEligibleTiers = async (userId, cartSubtotal, currentMonth = new Date()) => {
  try {
    const balance = await getUserBalance(userId)
    const allTiers = await getRedemptionTiers()

    // Filter tiers where user has enough points and cart meets minimum
    const eligible = allTiers.filter(tier => {
      return balance >= tier.points_required && cartSubtotal >= tier.minimum_order_value
    })

    // Check redemption limits for this month
    const monthStart = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const monthEnd = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)

    const limitChecked = await Promise.all(
      eligible.map(async (tier) => {
        if (tier.maximum_redemptions_per_user_per_month === 0) {
          return tier // unlimited
        }

        const thisMonthRedemptions = await PointsTransaction.countDocuments({
          userId,
          type: 'redeemed',
          createdAt: { $gte: monthStart, $lte: monthEnd }
        })

        if (thisMonthRedemptions >= tier.maximum_redemptions_per_user_per_month) {
          return null // Not eligible this month
        }

        return tier
      })
    )

    return limitChecked.filter(t => t !== null)
  } catch (error) {
    console.error('Error checking eligible tiers:', error)
    throw error
  }
}

/**
 * Validate a redemption request before applying
 */
export const validateRedemption = async (userId, tierId, cartSubtotal, hasExistingDiscount = false) => {
  try {
    const tier = await RedemptionTier.findById(tierId)
    if (!tier) return { valid: false, reason: 'Tier not found' }
    if (!tier.is_active) return { valid: false, reason: 'This tier is no longer available' }

    const balance = await getUserBalance(userId)
    if (balance < tier.points_required) {
      return { valid: false, reason: `Insufficient points. You need ${tier.points_required} points` }
    }

    if (cartSubtotal < tier.minimum_order_value) {
      return {
        valid: false,
        reason: `Minimum order value not met. Cart must be at least ₦${tier.minimum_order_value}`
      }
    }

    const isFrozen = await isAccountFrozen(userId)
    if (isFrozen) return { valid: false, reason: 'Your points account is frozen' }

    if (hasExistingDiscount) {
      const canStack = await canStackWithCoupons()
      if (!canStack) {
        return { valid: false, reason: 'Points cannot be combined with other discounts' }
      }
    }

    return { valid: true }
  } catch (error) {
    console.error('Error validating redemption:', error)
    return { valid: false, reason: 'System error during validation' }
  }
}

// ============ POINTS REDEMPTION - APPLICATION ============

/**
 * Reserve points for redemption (before checkout)
 * Returns a reservation ID to confirm later
 */
export const reservePoints = async (userId, tierId) => {
  try {
    const tier = await RedemptionTier.findById(tierId)
    if (!tier) throw new Error('Tier not found')

    // Create a "reservation" transaction (not yet deducted)
    const reservation = await PointsTransaction.create({
      userId,
      type: 'redeemed',
      amount: tier.points_required,
      reason: `Points reserved for redemption (Tier: ${tier.name})`,
      metadata: {
        tier_id: tierId,
        status: 'reserved'
      }
    })

    return {
      reservation_id: reservation._id,
      tier_id: tierId,
      points_reserved: tier.points_required,
      discount_value: tier.discount_value
    }
  } catch (error) {
    console.error('Error reserving points:', error)
    throw error
  }
}

/**
 * Confirm points redemption (after successful payment)
 * Permanently deducts points from balance
 */
export const confirmRedemption = async (userId, reservationId, orderId) => {
  try {
    // Find the reservation
    const reservation = await PointsTransaction.findById(reservationId)
    if (!reservation) throw new Error('Reservation not found')
    if (reservation.userId.toString() !== userId.toString()) {
      throw new Error('Unauthorized')
    }

    const balance = await getOrCreateBalance(userId)
    if (balance.current_balance < reservation.amount) {
      throw new Error('Insufficient points balance')
    }

    // Update reservation to confirmed
    reservation.metadata.status = 'confirmed'
    reservation.metadata.order_id = orderId
    reservation.orderId = orderId
    await reservation.save()

    // Deduct from balance
    balance.current_balance -= reservation.amount
    balance.total_redeemed += reservation.amount
    await balance.save()

    return {
      confirmed: true,
      points_deducted: reservation.amount,
      new_balance: balance.current_balance
    }
  } catch (error) {
    console.error('Error confirming redemption:', error)
    throw error
  }
}

/**
 * Release reserved points (if checkout failed)
 */
export const releaseReservedPoints = async (userId, reservationId) => {
  try {
    const reservation = await PointsTransaction.findById(reservationId)
    if (!reservation) return false

    // Mark as cancelled
    reservation.metadata.status = 'cancelled'
    await reservation.save()

    return true
  } catch (error) {
    console.error('Error releasing reserved points:', error)
    throw error
  }
}

// ============ ADMIN FUNCTIONS ============

/**
 * Freeze user's points account (fraud protection)
 */
export const freezeAccount = async (userId, reason) => {
  try {
    const balance = await getOrCreateBalance(userId)
    balance.is_frozen = true
    balance.freeze_reason = reason
    balance.frozen_at = new Date()
    await balance.save()

    return true
  } catch (error) {
    console.error('Error freezing account:', error)
    throw error
  }
}

/**
 * Unfreeze user's points account
 */
export const unfreezeAccount = async (userId) => {
  try {
    const balance = await getOrCreateBalance(userId)
    balance.is_frozen = false
    balance.freeze_reason = null
    balance.frozen_at = null
    await balance.save()

    return true
  } catch (error) {
    console.error('Error unfreezing account:', error)
    throw error
  }
}

/**
 * Admin adjustment to user's points
 */
export const adminAdjustPoints = async (userId, amount, reason, adminId) => {
  try {
    const balance = await getOrCreateBalance(userId)
    const type = amount >= 0 ? 'admin_adjustment' : 'admin_adjustment'

    // Create transaction
    await PointsTransaction.create({
      userId,
      type,
      amount: Math.abs(amount),
      reason,
      admin_id: adminId,
      admin_notes: `Admin adjustment: ${reason}`
    })

    // Update balance
    const newBalance = Math.max(0, balance.current_balance + amount)
    if (amount >= 0) {
      balance.total_earned += amount
    } else {
      balance.total_redeemed += Math.abs(amount)
    }
    balance.current_balance = newBalance
    await balance.save()

    return newBalance
  } catch (error) {
    console.error('Error adjusting points:', error)
    throw error
  }
}

/**
 * Get user's points transaction history
 */
export const getUserTransactionHistory = async (userId, limit = 50, skip = 0) => {
  try {
    const transactions = await PointsTransaction.find({ userId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .lean()

    const total = await PointsTransaction.countDocuments({ userId })

    return {
      transactions,
      total,
      limit,
      skip,
      hasMore: skip + limit < total
    }
  } catch (error) {
    console.error('Error fetching transaction history:', error)
    throw error
  }
}

export default {
  // Config
  getConfig,
  getPointsConversionRate,
  getPointsExpiryDays,
  isSystemEnabled,
  canStackWithCoupons,

  // Balance
  getOrCreateBalance,
  getUserBalance,
  getBalanceDetails,
  isAccountFrozen,

  // Earning
  awardPointsForOrder,
  reversePointsForOrder,

  // Expiry
  cleanupExpiredPoints,

  // Redemption - Tiers
  getRedemptionTiers,
  getEligibleTiers,
  validateRedemption,

  // Redemption - Application
  reservePoints,
  confirmRedemption,
  releaseReservedPoints,

  // Admin
  freezeAccount,
  unfreezeAccount,
  adminAdjustPoints,
  getUserTransactionHistory
}
