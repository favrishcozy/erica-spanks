import mongoose from 'mongoose';

/**
 * Cart Service
 * Handles cart operations with stock reservation integration
 */

// In-memory cart storage (can be replaced with database storage)
const carts = new Map();

/**
 * Get user's cart
 * @param {string} userId - User ID
 * @returns {object} Cart data
 */
export const getCart = async (userId) => {
  try {
    const cart = carts.get(userId.toString()) || {
      userId,
      items: [],
      createdAt: new Date(),
      updatedAt: new Date()
    };

    return cart;
  } catch (error) {
    console.error('Error getting cart:', error);
    throw error;
  }
};

/**
 * Add item to cart
 * @param {string} userId - User ID
 * @param {object} item - Item to add
 * @returns {object} Updated cart item
 */
export const addToCart = async (userId, item) => {
  try {
    const cart = await getCart(userId);
    
    // Check if item already exists (same product, size, color)
    const existingItemIndex = cart.items.findIndex(
      cartItem => 
        cartItem.productId === item.productId &&
        cartItem.size === item.size &&
        cartItem.color === item.color
    );

    if (existingItemIndex >= 0) {
      // Update existing item quantity
      cart.items[existingItemIndex].quantity += item.quantity;
      cart.items[existingItemIndex].reservationId = item.reservationId;
    } else {
      // Add new item
      cart.items.push({
        id: new mongoose.Types.ObjectId().toString(),
        productId: item.productId,
        size: item.size,
        color: item.color,
        quantity: item.quantity,
        reservationId: item.reservationId,
        addedAt: new Date()
      });
    }

    cart.updatedAt = new Date();
    carts.set(userId.toString(), cart);

    return cart.items[existingItemIndex >= 0 ? existingItemIndex : cart.items.length - 1];
  } catch (error) {
    console.error('Error adding to cart:', error);
    throw error;
  }
};

/**
 * Update cart item quantity
 * @param {string} userId - User ID
 * @param {string} itemId - Item ID
 * @param {object} updates - Updates to apply
 * @returns {object|null} Updated item or null if not found
 */
export const updateCartItem = async (userId, itemId, updates) => {
  try {
    const cart = await getCart(userId);
    const itemIndex = cart.items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return null;
    }

    // Update item
    cart.items[itemIndex] = {
      ...cart.items[itemIndex],
      ...updates,
      updatedAt: new Date()
    };

    cart.updatedAt = new Date();
    carts.set(userId.toString(), cart);

    return cart.items[itemIndex];
  } catch (error) {
    console.error('Error updating cart item:', error);
    throw error;
  }
};

/**
 * Remove item from cart
 * @param {string} userId - User ID
 * @param {string} itemId - Item ID
 * @returns {boolean} True if removed, false if not found
 */
export const removeFromCart = async (userId, itemId) => {
  try {
    const cart = await getCart(userId);
    const itemIndex = cart.items.findIndex(item => item.id === itemId);

    if (itemIndex === -1) {
      return false;
    }

    // Remove item
    cart.items.splice(itemIndex, 1);
    cart.updatedAt = new Date();
    carts.set(userId.toString(), cart);

    return true;
  } catch (error) {
    console.error('Error removing from cart:', error);
    throw error;
  }
};

/**
 * Clear cart
 * @param {string} userId - User ID
 * @returns {boolean} True if cleared
 */
export const clearCart = async (userId) => {
  try {
    carts.delete(userId.toString());
    return true;
  } catch (error) {
    console.error('Error clearing cart:', error);
    throw error;
  }
};

/**
 * Get cart total
 * @param {string} userId - User ID
 * @returns {object} Cart totals
 */
export const getCartTotals = async (userId) => {
  try {
    const cart = await getCart(userId);
    const totalItems = cart.items.reduce((sum, item) => sum + item.quantity, 0);
    const totalValue = cart.items.reduce((sum, item) => sum + (item.price || 0) * item.quantity, 0);

    return {
      totalItems,
      totalValue,
      itemCount: cart.items.length
    };
  } catch (error) {
    console.error('Error getting cart totals:', error);
    throw error;
  }
};

/**
 * Convert cart to order items
 * @param {string} userId - User ID
 * @returns {array} Order items
 */
export const convertCartToOrderItems = async (userId) => {
  try {
    const cart = await getCart(userId);
    const Product = mongoose.model('Product');
    
    const orderItems = [];
    
    for (const cartItem of cart.items) {
      const product = await Product.findById(cartItem.productId);
      if (!product) continue;

      const variation = product.variations.find(
        v => v.size === cartItem.size && v.color === cartItem.color
      );
      
      if (variation) {
        orderItems.push({
          product: product._id,
          variation: {
            size: cartItem.size,
            color: cartItem.color,
            sku: variation.sku
          },
          quantity: cartItem.quantity,
          unitPrice: variation.price,
          totalPrice: variation.price * cartItem.quantity,
          productSnapshot: {
            name: product.name,
            image: variation.images?.[0]?.url || product.images?.[0]?.url
          }
        });
      }
    }

    return orderItems;
  } catch (error) {
    console.error('Error converting cart to order items:', error);
    throw error;
  }
};

/**
 * Reserve stock for entire cart
 * @param {string} userId - User ID
 * @param {string} reservationExpiryMinutes - Reservation expiry in minutes
 * @returns {object} Reservation results
 */
export const reserveCartStock = async (userId, reservationExpiryMinutes = 15) => {
  try {
    const cart = await getCart(userId);
    const stockService = await import('./stockService.js');
    
    const reservationResults = [];
    let totalReserved = 0;
    let hasErrors = false;

    for (const item of cart.items) {
      const Product = mongoose.model('Product');
      const product = await Product.findById(item.productId);
      
      if (!product) {
        reservationResults.push({
          productId: item.productId,
          success: false,
          error: 'Product not found'
        });
        hasErrors = true;
        continue;
      }

      const variation = product.variations.find(
        v => v.size === item.size && v.color === item.color
      );

      if (!variation) {
        reservationResults.push({
          productId: item.productId,
          success: false,
          error: 'Variation not found'
        });
        hasErrors = true;
        continue;
      }

      const reservationResult = await stockService.reserveStock(
        item.productId,
        variation.sku,
        userId,
        item.quantity,
        {
          expiryMinutes: reservationExpiryMinutes,
          metadata: {
            source: 'cart',
            cartId: cart.id || 'unknown'
          }
        }
      );

      reservationResults.push({
        productId: item.productId,
        variationSku: variation.sku,
        quantity: item.quantity,
        success: reservationResult.success,
        error: reservationResult.error,
        reservationId: reservationResult.success ? reservationResult.reservation._id : null
      });

      if (reservationResult.success) {
        totalReserved += item.quantity;
        // Update cart item with reservation ID
        await updateCartItem(userId, item.id, {
          reservationId: reservationResult.reservation._id
        });
      } else {
        hasErrors = true;
      }
    }

    return {
      success: !hasErrors,
      results: reservationResults,
      totalReserved,
      cartItems: cart.items.length
    };
  } catch (error) {
    console.error('Error reserving cart stock:', error);
    throw error;
  }
};

/**
 * Release cart stock reservations
 * @param {string} userId - User ID
 * @param {string} reason - Release reason
 * @returns {object} Release results
 */
export const releaseCartReservations = async (userId, reason = 'cancelled') => {
  try {
    const cart = await getCart(userId);
    const stockService = await import('./stockService.js');
    
    const releaseResults = [];
    let releasedCount = 0;

    for (const item of cart.items) {
      if (item.reservationId) {
        const result = await stockService.cancelStockReservation(item.reservationId, reason);
        releaseResults.push({
          itemId: item.id,
          reservationId: item.reservationId,
          success: !!result.success,
          reason
        });
        
        if (result.success) {
          releasedCount++;
        }
      }
    }

    return {
      success: true,
      releasedCount,
      results: releaseResults
    };
  } catch (error) {
    console.error('Error releasing cart reservations:', error);
    throw error;
  }
};

/**
 * Clear expired reservations for user
 * @param {string} userId - User ID
 * @returns {object} Cleanup results
 */
export const cleanupExpiredReservations = async (userId) => {
  try {
    const StockReservation = mongoose.model('StockReservation');
    
    const expiredReservations = await StockReservation.find({
      userId,
      status: 'reserved',
      expiresAt: { $lt: new Date() }
    });

    if (expiredReservations.length === 0) {
      return { processed: 0, updated: 0 };
    }

    const result = await StockReservation.updateMany(
      {
        userId,
        status: 'reserved',
        expiresAt: { $lt: new Date() }
      },
      {
        status: 'expired',
        updatedAt: new Date()
      }
    );

    return {
      processed: expiredReservations.length,
      updated: result.modifiedCount
    };
  } catch (error) {
    console.error('Error cleaning up expired reservations:', error);
    throw error;
  }
};

export default {
  getCart,
  addToCart,
  updateCartItem,
  removeFromCart,
  clearCart,
  getCartTotals,
  convertCartToOrderItems,
  reserveCartStock,
  releaseCartReservations,
  cleanupExpiredReservations
};