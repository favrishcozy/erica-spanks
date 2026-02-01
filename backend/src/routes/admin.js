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
    console.log('='.repeat(50))
    console.log('Admin stats endpoint called')
    console.log('User email:', req.user?.email)
    console.log('User role:', req.user?.role)
    console.log('User ID:', req.user?._id)
    console.log('='.repeat(50))
    
    // Verify models are loaded
    if (!User || !Product || !Order) {
      console.error('Models not loaded properly!')
      return res.status(500).json({
        success: false,
        error: 'Database models not initialized'
      })
    }
    
    console.log('✓ Models loaded: User, Product, Order')
    
    // Count users
    let userCount = 0
    try {
      userCount = await User.countDocuments()
      console.log('✓ User count:', userCount)
    } catch (err) {
      console.error('✗ Error counting users:', err.message)
      throw err
    }
    
    // Count products
    let productCount = 0
    try {
      productCount = await Product.countDocuments()
      console.log('✓ Product count:', productCount)
    } catch (err) {
      console.error('✗ Error counting products:', err.message)
      throw err
    }
    
    // Count orders
    let orderCount = 0
    try {
      orderCount = await Order.countDocuments()
      console.log('✓ Order count:', orderCount)
    } catch (err) {
      console.error('✗ Error counting orders:', err.message)
      throw err
    }
    
    // Get revenue - handle null/undefined pricing
    let totalRevenue = 0
    try {
      const confirmedOrders = await Order.find({ status: 'confirmed' }).lean()
      console.log('✓ Confirmed orders found:', confirmedOrders.length)
      
      totalRevenue = confirmedOrders.reduce((sum, order) => {
        const amount = order?.pricing?.total || 0
        return sum + amount
      }, 0)
      console.log('✓ Total revenue:', totalRevenue)
    } catch (err) {
      console.warn('⚠ Warning calculating revenue:', err.message)
      totalRevenue = 0
    }
    
    // Get recent orders
    let recentOrders = []
    try {
      recentOrders = await Order.find()
        .populate('user', 'firstName lastName email')
        .sort({ createdAt: -1 })
        .limit(5)
      console.log('✓ Recent orders fetched:', recentOrders.length)
    } catch (err) {
      console.warn('⚠ Warning fetching recent orders:', err.message)
      recentOrders = []
    }
    
    console.log('✓ Successfully compiled admin stats')
    res.json({
      success: true,
      data: {
        users: userCount,
        products: productCount,
        orders: orderCount,
        totalRevenue,
        recentOrders
      }
    })
  } catch (error) {
    console.error('✗ Error fetching admin stats:', error.message)
    console.error('Stack:', error.stack)
    res.status(500).json({
      success: false,
      error: error.message || 'Server error fetching stats'
    })
  }
})

// GET /api/admin/users - Get all users (admin only)
router.get('/users', async (req, res) => {
  try {
    const { page = 1, limit = 50 } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const users = await User.find({})
      .select('-password')
      .skip(skip)
      .limit(limitNum)
      .sort({ createdAt: -1 })

    const total = await User.countDocuments()

    res.json({
      success: true,
      data: users,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching users:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching users'
    })
  }
})

// GET /api/admin/users/:userId - Get single user details
router.get('/users/:userId', async (req, res) => {
  try {
    const user = await User.findById(req.params.userId)
      .select('-password')
      .populate('orders')

    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      })
    }

    res.json({
      success: true,
      data: user
    })
  } catch (error) {
    console.error('Error fetching user details:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching user'
    })
  }
})

// GET /api/admin/orders - Get all orders (admin only)
router.get('/orders', async (req, res) => {
  try {
    const { page = 1, limit = 50, status } = req.query
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    let query = {}
    if (status) {
      query.status = status
    }

    const orders = await Order.find(query)
      .populate('user', 'firstName lastName email phone')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)

    const total = await Order.countDocuments(query)

    res.json({
      success: true,
      data: orders,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching admin orders:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching orders'
    })
  }
})

// GET /api/admin/orders/:orderId - Get order details (admin only)
router.get('/orders/:orderId', async (req, res) => {
  try {
    const order = await Order.findById(req.params.orderId)
      .populate('user', 'firstName lastName email phone')
      .populate('items.product', 'name slug')

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    res.json({
      success: true,
      data: order
    })
  } catch (error) {
    console.error('Error fetching order details:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching order'
    })
  }
})

export default router