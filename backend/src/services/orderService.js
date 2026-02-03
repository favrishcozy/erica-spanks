import Order from '../models/Order.js'
import RedemptionTier from '../models/RedemptionTier.js'
import * as pointsService from './pointsService.js'

/**
 * Order Service
 * Handles order operations with integration to points system
 */

/**
 * Update order status
 * Automatically awards points when order is completed/delivered
 */
export const updateOrderStatus = async (orderId, newStatus, note = '', updatedBy = null) => {
  try {
    const order = await Order.findById(orderId).populate('user')

    if (!order) {
      throw new Error('Order not found')
    }

    const oldStatus = order.status
    order.status = newStatus

    // Add to status history
    order.statusHistory.push({
      status: newStatus,
      note,
      updatedBy
    })

    // Check if this is a completed/delivered order and points haven't been awarded yet
    const isCompletion = ['delivered', 'completed'].includes(newStatus)
    const wasNotCompleted = !['delivered', 'completed'].includes(oldStatus)
    const noPointsTransaction = !order.pointsAwarded // Assuming we'll add this field

    if (isCompletion && wasNotCompleted) {
      // Award points based on order subtotal
      const pointsEarned = await pointsService.awardPointsForOrder(
        order.user._id,
        order.pricing.subtotal,
        orderId
      )

      if (pointsEarned > 0) {
        // Mark that points have been awarded
        order.pointsAwarded = true
        order.pointsEarned = pointsEarned
      }
    }

    // Handle refunds - reverse points if order is refunded
    if (newStatus === 'refunded' && oldStatus !== 'refunded' && order.pointsAwarded) {
      const reversedPoints = await pointsService.reversePointsForOrder(order.user._id, orderId)
      order.pointsAwarded = false
      order.pointsEarned = 0
    }

    await order.save()
    return order
  } catch (error) {
    console.error('Error updating order status:', error)
    throw error
  }
}

/**
 * Confirm redemption for an order
 * Called during order creation to finalize point redemptions
 */
export const confirmOrderPointRedemption = async (orderId, userId, reservationId) => {
  try {
    const order = await Order.findById(orderId)
    if (!order) throw new Error('Order not found')

    const redemptionResult = await pointsService.confirmRedemption(userId, reservationId, orderId)

    // Store redemption info in order
    order.pointsRedemption = {
      reservation_id: reservationId,
      points_redeemed: redemptionResult.points_deducted,
      discount_applied: true,
      appliedAt: new Date()
    }

    await order.save()
    return redemptionResult
  } catch (error) {
    console.error('Error confirming order point redemption:', error)
    throw error
  }
}

/**
 * Cancel order and handle point refunds
 */
export const cancelOrder = async (orderId, reason = '', cancelledBy = null) => {
  try {
    const order = await Order.findById(orderId).populate('user')

    if (!order) {
      throw new Error('Order not found')
    }

    if (['cancelled', 'refunded'].includes(order.status)) {
      throw new Error('Order is already cancelled or refunded')
    }

    // Update status
    order.status = 'cancelled'
    order.statusHistory.push({
      status: 'cancelled',
      note: reason,
      updatedBy: cancelledBy
    })

    // Reverse points if order was completed and points were awarded
    if (order.pointsAwarded) {
      const reversedPoints = await pointsService.reversePointsForOrder(order.user._id, orderId)
      order.pointsAwarded = false
      order.pointsEarned = 0
    }

    await order.save()
    return order
  } catch (error) {
    console.error('Error cancelling order:', error)
    throw error
  }
}

/**
 * Get orders for a specific user
 */
export const getOrdersByUser = async (userId) => {
  try {
    const orders = await Order.find({ user: userId })
      .populate('items.product', 'name images price')
      .sort({ createdAt: -1 })
      .lean()

    return orders
  } catch (error) {
    console.error('Error fetching orders for user:', error)
    throw new Error(`Failed to fetch orders: ${error.message}`)
  }
}

/**
 * Get all orders (admin only)
 */
export const getAllOrders = async () => {
  try {
    const orders = await Order.find({})
      .populate('user', 'email firstName lastName')
      .populate('items.product', 'name image price')
      .sort({ createdAt: -1 })

    return orders
  } catch (error) {
    console.error('Error fetching all orders:', error)
    throw error
  }
}

/**
 * Get order details with computed field for applied points discount
 */
export const getOrderDetails = async (orderId) => {
  try {
    const order = await Order.findById(orderId)
      .populate('user', 'email firstName lastName')
      .populate('items.product', 'name image price')

    if (!order) {
      return null
    }

    // Calculate applied points discount if any
    let pointsDiscountValue = 0
    if (order.pointsRedemption && order.pointsRedemption.discount_applied) {
      // Get tier details to calculate discount value
      const tier = await RedemptionTier.findOne({
        points_required: order.pointsRedemption.points_redeemed
      })
      if (tier) {
        pointsDiscountValue = tier.discount_type === 'fixed' ? tier.discount_value : (order.pricing.subtotal * tier.discount_value) / 100
      }
    }

    return {
      ...order.toObject(),
      pointsDiscountApplied: pointsDiscountValue
    }
  } catch (error) {
    console.error('Error fetching order details:', error)
    throw error
  }
}

export default {
  updateOrderStatus,
  confirmOrderPointRedemption,
  cancelOrder,
  getOrdersByUser,
  getAllOrders,
  getOrderDetails
}
