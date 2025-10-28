import express from 'express'
import { protect, customer } from '../middleware/auth.js'

const router = express.Router()

// All cart routes require authentication and customer role
router.use(protect, customer)

// GET /api/cart - Get user's cart
router.get('/', async (req, res) => {
  try {
    // req.user is available from protect middleware
    const userId = req.user._id
    // Your cart logic here
    res.json({
      success: true,
      data: [],
      message: 'Cart retrieved successfully'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error fetching cart'
    })
  }
})

// POST /api/cart - Add item to cart
router.post('/', async (req, res) => {
  try {
    // req.user is available
    console.log('User adding to cart:', req.user.email)
    // Your add to cart logic
    res.json({
      success: true,
      data: {},
      message: 'Item added to cart'
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error adding to cart'
    })
  }
})

export default router