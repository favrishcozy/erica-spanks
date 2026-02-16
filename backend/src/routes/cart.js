import express from 'express'
import { protect, customer } from '../middleware/auth.js'
import * as cartService from '../services/cartService.js'
import * as stockService from '../services/stockService.js'

const router = express.Router()

// All cart routes require authentication and customer role
router.use(protect, customer)

// GET /api/cart - Get user's cart
router.get('/', async (req, res) => {
  try {
    const cart = await cartService.getCart(req.user._id)
    res.json({
      success: true,
      data: cart,
      message: 'Cart retrieved successfully'
    })
  } catch (error) {
    console.error('Error fetching cart:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching cart'
    })
  }
})

// POST /api/cart/items - Add item to cart with stock validation
router.post('/items', async (req, res) => {
  try {
    const { productId, size, color, quantity = 1 } = req.body
    
    // Validate required fields
    if (!productId || !size || !color) {
      return res.status(400).json({
        success: false,
        error: 'Product ID, size, and color are required'
      })
    }

    if (quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0'
      })
    }

    // Validate stock availability
    const Product = require('../models/Product.js')
    const product = await Product.findById(productId)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    const variation = product.variations.find(v => v.size === size && v.color === color)
    if (!variation) {
      return res.status(400).json({
        success: false,
        error: `Product not available in ${size} / ${color}`
      })
    }

    // Check stock availability
    const stockInfo = await stockService.getAvailableStock(productId, variation.sku)
    if (stockInfo.availableStock < quantity) {
      return res.status(400).json({
        success: false,
        error: `Only ${stockInfo.availableStock} item(s) available in ${size} / ${color}`
      })
    }

    // Reserve stock for 15 minutes
    const reservationResult = await stockService.reserveStock(
      productId, 
      variation.sku, 
      req.user._id, 
      quantity,
      {
        expiryMinutes: 15,
        metadata: {
          source: 'cart',
          sessionId: req.sessionID || 'unknown'
        }
      }
    )

    if (!reservationResult.success) {
      return res.status(400).json({
        success: false,
        error: reservationResult.error
      })
    }

    // Add item to cart
    const cartItem = await cartService.addToCart(req.user._id, {
      productId,
      size,
      color,
      quantity,
      reservationId: reservationResult.reservation._id
    })

    res.status(201).json({
      success: true,
      data: cartItem,
      message: 'Item added to cart successfully'
    })
  } catch (error) {
    console.error('Error adding item to cart:', error)
    res.status(500).json({
      success: false,
      error: 'Server error adding item to cart'
    })
  }
})

// PUT /api/cart/items/:itemId - Update cart item quantity
router.put('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params
    const { quantity } = req.body

    if (!quantity || quantity <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Quantity must be greater than 0'
      })
    }

    const updatedItem = await cartService.updateCartItem(req.user._id, itemId, { quantity })
    
    if (!updatedItem) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      })
    }

    res.json({
      success: true,
      data: updatedItem,
      message: 'Cart item updated successfully'
    })
  } catch (error) {
    console.error('Error updating cart item:', error)
    res.status(500).json({
      success: false,
      error: 'Server error updating cart item'
    })
  }
})

// DELETE /api/cart/items/:itemId - Remove item from cart
router.delete('/items/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params
    
    const result = await cartService.removeFromCart(req.user._id, itemId)
    
    if (!result) {
      return res.status(404).json({
        success: false,
        error: 'Cart item not found'
      })
    }

    res.json({
      success: true,
      message: 'Item removed from cart successfully'
    })
  } catch (error) {
    console.error('Error removing cart item:', error)
    res.status(500).json({
      success: false,
      error: 'Server error removing cart item'
    })
  }
})

// DELETE /api/cart - Clear cart
router.delete('/', async (req, res) => {
  try {
    await cartService.clearCart(req.user._id)
    
    res.json({
      success: true,
      message: 'Cart cleared successfully'
    })
  } catch (error) {
    console.error('Error clearing cart:', error)
    res.status(500).json({
      success: false,
      error: 'Server error clearing cart'
    })
  }
})

// POST /api/cart/validate - Validate cart stock availability
router.post('/validate', async (req, res) => {
  try {
    const { items } = req.body
    
    if (!items || !Array.isArray(items)) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required'
      })
    }

    const validation = await stockService.validateStockAvailability(items)
    
    res.json({
      success: validation.success,
      results: validation.results
    })
  } catch (error) {
    console.error('Error validating cart:', error)
    res.status(500).json({
      success: false,
      error: 'Server error validating cart'
    })
  }
})

// GET /api/cart/reservations - Get user's active stock reservations
router.get('/reservations', async (req, res) => {
  try {
    const reservations = await stockService.getUserReservations(req.user._id, 'reserved')
    
    res.json({
      success: true,
      data: reservations,
      message: 'Reservations retrieved successfully'
    })
  } catch (error) {
    console.error('Error getting reservations:', error)
    res.status(500).json({
      success: false,
      error: 'Server error retrieving reservations'
    })
  }
})

export default router
