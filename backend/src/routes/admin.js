import express from 'express'
import { protect, admin } from '../middleware/auth.js'
import User from '../models/User.js'
import Product from '../models/Product.js'
import Order from '../models/Order.js'

const router = express.Router()

// All admin routes require authentication and admin role
router.use(protect, admin)

// GET /api/admin/stats - Get admin dashboard stats
router.get('/stats', async (req, res) => {
  try {
    const userCount = await User.countDocuments()
    const productCount = await Product.countDocuments()
    const orderCount = await Order.countDocuments()
    
    res.json({
      success: true,
      data: {
        users: userCount,
        products: productCount,
        orders: orderCount
      }
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error fetching stats'
    })
  }
})

// GET /api/admin/users - Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const users = await User.find({}).select('-password')
    res.json({
      success: true,
      data: users
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Server error fetching users'
    })
  }
})

export default router