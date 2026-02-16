import mongoose from 'mongoose';
import StockReservation from '../models/StockReservation.js';
import Product from '../models/Product.js';

/**
 * Stock Service
 * Handles stock reservations, validation, and reconciliation
 */

/**
 * Reserve stock for a user
 * @param {string} productId - Product ID
 * @param {string} variationSku - Variation SKU
 * @param {string} userId - User ID
 * @param {number} quantity - Quantity to reserve
 * @param {object} options - Additional options
 * @returns {object} Reservation result
 */
export const reserveStock = async (productId, variationSku, userId, quantity, options = {}) => {
  try {
    const result = await StockReservation.reserveStock(productId, variationSku, userId, quantity, options);
    return result;
  } catch (error) {
    console.error('Error reserving stock:', error);
    return {
      success: false,
      error: error.message || 'Failed to reserve stock'
    };
  }
};

/**
 * Confirm stock reservation (when order is completed)
 * @param {string} reservationId - Reservation ID
 * @param {string} orderId - Order ID
 * @returns {object} Confirmation result
 */
export const confirmStockReservation = async (reservationId, orderId) => {
  try {
    const reservation = await StockReservation.confirmReservation(reservationId, orderId);
    return {
      success: true,
      reservation
    };
  } catch (error) {
    console.error('Error confirming stock reservation:', error);
    return {
      success: false,
      error: error.message || 'Failed to confirm reservation'
    };
  }
};

/**
 * Cancel stock reservation
 * @param {string} reservationId - Reservation ID
 * @param {string} reason - Cancellation reason
 * @returns {object} Cancellation result
 */
export const cancelStockReservation = async (reservationId, reason = 'cancelled') => {
  try {
    const reservation = await StockReservation.cancelReservation(reservationId, reason);
    return {
      success: true,
      reservation
    };
  } catch (error) {
    console.error('Error cancelling stock reservation:', error);
    return {
      success: false,
      error: error.message || 'Failed to cancel reservation'
    };
  }
};

/**
 * Get user's active stock reservations
 * @param {string} userId - User ID
 * @param {string} status - Reservation status (optional)
 * @returns {array} User reservations
 */
export const getUserReservations = async (userId, status = null) => {
  try {
    const reservations = await StockReservation.getUserReservations(userId, status);
    return reservations;
  } catch (error) {
    console.error('Error getting user reservations:', error);
    throw error;
  }
};

/**
 * Release expired reservations and update stock
 * @returns {object} Cleanup result
 */
export const cleanupExpiredReservations = async () => {
  try {
    const result = await StockReservation.cleanupExpiredReservations();
    return result;
  } catch (error) {
    console.error('Error cleaning up expired reservations:', error);
    throw error;
  }
};

/**
 * Get available stock for a product variation
 * @param {string} productId - Product ID
 * @param {string} variationSku - Variation SKU
 * @param {string} size - Size (optional fallback)
 * @param {string} color - Color (optional fallback)
 * @returns {object} Stock availability
 */
export const getAvailableStock = async (productId, variationSku, size, color) => {
  try {
    const product = await Product.findById(productId);
    if (!product) {
      throw new Error('Product not found');
    }

    console.log('🔍 Debug getAvailableStock:', {
      productId,
      variationSku,
      size,
      color,
      availableVariations: product.variations.map(v => ({ sku: v.sku, size: v.size, color: v.color, quantity: v.inventory?.quantity }))
    });

    let variation = null;

    // First try to find by SKU
    if (variationSku) {
      variation = product.variations.find(v => v.sku === variationSku);
      console.log('🔍 Found by SKU:', variationSku, 'Result:', !!variation);
    }

    // If not found and we have size/color, try to find by size and color
    if (!variation && size && color) {
      variation = product.variations.find(v => v.size === size && v.color === color);
      console.log('🔍 Found by size/color:', size, color, 'Result:', !!variation);
    }

    // If still not found, try to find by constructed SKU (size-color format)
    if (!variation && size && color) {
      const constructedSku = `${size}-${color}`;
      variation = product.variations.find(v => v.sku === constructedSku);
      console.log('🔍 Found by constructed SKU:', constructedSku, 'Result:', !!variation);
    }

    if (!variation) {
      throw new Error('Variation not found');
    }

    // Calculate reserved stock
    const currentReservations = await StockReservation.aggregate([
      {
        $match: {
          productId: new mongoose.Types.ObjectId(productId),
          variationSku,
          status: { $in: ['reserved', 'confirmed'] },
          expiresAt: { $gt: new Date() }
        }
      },
      {
        $group: {
          _id: null,
          totalReserved: { $sum: '$quantity' }
        }
      }
    ]);

    const reservedQuantity = currentReservations[0]?.totalReserved || 0;
    const availableStock = variation.inventory.quantity - reservedQuantity;

    return {
      productId,
      variationSku,
      totalStock: variation.inventory.quantity,
      reservedStock: reservedQuantity,
      availableStock,
      lowStockThreshold: variation.inventory.lowStockThreshold,
      isLowStock: availableStock <= variation.inventory.lowStockThreshold,
      isOutOfStock: availableStock <= 0
    };
  } catch (error) {
    console.error('Error getting available stock:', error);
    throw error;
  }
};

/**
 * Validate stock availability for multiple items
 * @param {array} items - Array of items to validate
 * @returns {object} Validation result
 */
export const validateStockAvailability = async (items) => {
  try {
    const validationResults = [];
    let hasErrors = false;

    for (const item of items) {
      const { productId, variationSku, quantity, size, color } = item;
      
      const stockInfo = await getAvailableStock(productId, variationSku, size, color);
      
      if (stockInfo.availableStock < quantity) {
        validationResults.push({
          productId,
          variationSku,
          requestedQuantity: quantity,
          availableQuantity: stockInfo.availableStock,
          error: `Only ${stockInfo.availableStock} item(s) available`
        });
        hasErrors = true;
      } else {
        validationResults.push({
          productId,
          variationSku,
          requestedQuantity: quantity,
          availableQuantity: stockInfo.availableStock,
          success: true
        });
      }
    }

    return {
      success: !hasErrors,
      results: validationResults
    };
  } catch (error) {
    console.error('Error validating stock availability:', error);
    return {
      success: false,
      error: error.message || 'Failed to validate stock availability'
    };
  }
};

/**
 * Deduct stock after order confirmation
 * Uses database transactions for atomicity
 * @param {string} orderId - Order ID
 * @returns {object} Deduction result
 */
export const deductStockForOrder = async (orderId) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const Order = mongoose.model('Order');
    const order = await Order.findById(orderId).session(session);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Process each item in the order
    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }

      const variation = product.variations.find(v => v.sku === item.variation.sku);
      if (!variation) {
        throw new Error(`Variation ${item.variation.sku} not found`);
      }

      // Check if stock is sufficient
      if (variation.inventory.quantity < item.quantity) {
        throw new Error(`Insufficient stock for ${product.name} (${item.variation.size}, ${item.variation.color})`);
      }

      // Deduct stock
      variation.inventory.quantity -= item.quantity;
      
      // Update product stock status
      await product.updateStockStatus();
      await product.save({ session });
    }

    // Mark reservations as confirmed
    const reservations = await StockReservation.find({
      orderId,
      status: 'reserved'
    }).session(session);

    for (const reservation of reservations) {
      reservation.status = 'confirmed';
      await reservation.save({ session });
    }

    await session.commitTransaction();
    
    return {
      success: true,
      orderId,
      itemsProcessed: order.items.length
    };
  } catch (error) {
    await session.abortTransaction();
    console.error('Error deducting stock for order:', error);
    return {
      success: false,
      error: error.message || 'Failed to deduct stock'
    };
  } finally {
    session.endSession();
  }
};

/**
 * Reconcile stock for failed/cancelled orders
 * @param {string} orderId - Order ID
 * @returns {object} Reconciliation result
 */
export const reconcileStockForOrder = async (orderId) => {
  const session = await mongoose.startSession();
  
  try {
    session.startTransaction();

    const Order = mongoose.model('Order');
    const order = await Order.findById(orderId).session(session);
    
    if (!order) {
      throw new Error('Order not found');
    }

    // Only reconcile if order was confirmed (stock was deducted)
    if (order.status !== 'confirmed') {
      throw new Error('Order was not confirmed, no stock to reconcile');
    }

    // Restore stock for each item
    for (const item of order.items) {
      const product = await Product.findById(item.product).session(session);
      if (!product) {
        throw new Error(`Product ${item.product} not found`);
      }

      const variation = product.variations.find(v => v.sku === item.variation.sku);
      if (!variation) {
        throw new Error(`Variation ${item.variation.sku} not found`);
      }

      // Restore stock
      variation.inventory.quantity += item.quantity;
      
      // Update product stock status
      await product.updateStockStatus();
      await product.save({ session });
    }

    // Cancel any associated reservations
    await StockReservation.updateMany(
      { orderId, status: 'reserved' },
      { status: 'cancelled', updatedAt: new Date() },
      { session }
    );

    await session.commitTransaction();
    
    return {
      success: true,
      orderId,
      itemsRestored: order.items.length
    };
  } catch (error) {
    await session.abortTransaction();
    console.error('Error reconciling stock for order:', error);
    return {
      success: false,
      error: error.message || 'Failed to reconcile stock'
    };
  } finally {
    session.endSession();
  }
};

/**
 * Get stock audit log for a product
 * @param {string} productId - Product ID
 * @param {number} limit - Limit results
 * @returns {array} Audit log entries
 */
export const getStockAuditLog = async (productId, limit = 50) => {
  try {
    // This would require implementing audit logging
    // For now, return basic stock history from reservations
    const reservations = await StockReservation.find({
      productId,
      status: { $in: ['confirmed', 'cancelled', 'expired'] }
    })
    .sort({ createdAt: -1 })
    .limit(limit)
    .populate('userId', 'email firstName lastName');

    return reservations;
  } catch (error) {
    console.error('Error getting stock audit log:', error);
    throw error;
  }
};

/**
 * Schedule regular cleanup of expired reservations
 * Should be called by cron job
 */
export const scheduleReservationCleanup = async () => {
  try {
    const result = await cleanupExpiredReservations();
    console.log(`Cleaned up ${result.updated} expired reservations`);
    return result;
  } catch (error) {
    console.error('Error in scheduled reservation cleanup:', error);
    throw error;
  }
};

export default {
  reserveStock,
  confirmStockReservation,
  cancelStockReservation,
  getUserReservations,
  cleanupExpiredReservations,
  getAvailableStock,
  validateStockAvailability,
  deductStockForOrder,
  reconcileStockForOrder,
  getStockAuditLog,
  scheduleReservationCleanup
};