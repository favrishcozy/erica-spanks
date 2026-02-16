import express from 'express'
import { protect, admin } from '../../middleware/auth.js'
import * as stockService from '../../services/stockService.js'
import * as pointsService from '../../services/pointsService.js'
import Product from '../../models/Product.js'
import StockReservation from '../../models/StockReservation.js'

const router = express.Router()

// All admin stock routes require authentication and admin role
router.use(protect, admin)

/**
 * GET /api/admin/stock/overview
 * Get stock overview and analytics
 */
router.get('/overview', async (req, res) => {
  try {
    const products = await Product.find({ isActive: true })
    const totalProducts = products.length
    
    const outOfStockProducts = products.filter(p => p.stockStatus === 'out_of_stock').length
    const lowStockProducts = products.filter(p => p.stockStatus === 'low_stock').length
    const inStockProducts = products.filter(p => p.stockStatus === 'in_stock').length

    // Get reservation stats
    const activeReservations = await StockReservation.countDocuments({
      status: { $in: ['reserved', 'confirmed'] },
      expiresAt: { $gt: new Date() }
    })

    const expiredReservations = await StockReservation.countDocuments({
      status: 'expired'
    })

    res.json({
      success: true,
      data: {
        totalProducts,
        inStockProducts,
        lowStockProducts,
        outOfStockProducts,
        activeReservations,
        expiredReservations,
        stockHealth: {
          inStockPercentage: Math.round((inStockProducts / totalProducts) * 100),
          lowStockPercentage: Math.round((lowStockProducts / totalProducts) * 100),
          outOfStockPercentage: Math.round((outOfStockProducts / totalProducts) * 100)
        }
      }
    })
  } catch (error) {
    console.error('Error fetching stock overview:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching stock overview'
    })
  }
})

/**
 * GET /api/admin/stock/products
 * Get products with stock details
 * Query: ?status=in_stock&low_stock=true&out_of_stock=true&page=1&limit=20
 */
router.get('/products', async (req, res) => {
  try {
    const { status, low_stock, out_of_stock, page = 1, limit = 20 } = req.query
    
    const query = { isActive: true }
    
    if (status) {
      query.stockStatus = status
    } else {
      const statuses = []
      if (low_stock === 'true') statuses.push('low_stock')
      if (out_of_stock === 'true') statuses.push('out_of_stock')
      if (statuses.length > 0) query.stockStatus = { $in: statuses }
    }

    const products = await Product.find(query)
      .select('name slug category stockStatus totalInventory variations')
      .populate('category', 'name')
      .sort({ totalInventory: 1, name: 1 })
      .limit(parseInt(limit) * 1)
      .skip((parseInt(page) - 1) * parseInt(limit))

    const total = await Product.countDocuments(query)

    // Add detailed stock info for each product
    const productsWithDetails = await Promise.all(
      products.map(async (product) => {
        const stockDetails = product.variations.map(variation => ({
          sku: variation.sku,
          size: variation.size,
          color: variation.color,
          colorCode: variation.colorCode,
          quantity: variation.inventory.quantity,
          lowStockThreshold: variation.inventory.lowStockThreshold,
          isLowStock: variation.inventory.quantity <= variation.inventory.lowStockThreshold,
          isOutOfStock: variation.inventory.quantity === 0
        }))

        // Get reservation info for this product
        const reservationStats = await StockReservation.aggregate([
          {
            $match: {
              productId: product._id,
              status: { $in: ['reserved', 'confirmed'] },
              expiresAt: { $gt: new Date() }
            }
          },
          {
            $group: {
              _id: '$variationSku',
              totalReserved: { $sum: '$quantity' }
            }
          }
        ])

        const reservationMap = new Map(reservationStats.map(r => [r._id, r.totalReserved]))

        return {
          ...product.toObject(),
          variations: stockDetails.map(v => ({
            ...v,
            reservedQuantity: reservationMap.get(v.sku) || 0,
            availableQuantity: v.quantity - (reservationMap.get(v.sku) || 0)
          }))
        }
      })
    )

    res.json({
      success: true,
      data: {
        products: productsWithDetails,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    })
  } catch (error) {
    console.error('Error fetching products with stock details:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching products'
    })
  }
})

/**
 * GET /api/admin/stock/reservations
 * Get active stock reservations
 * Query: ?status=reserved&user_id=123&product_id=123&page=1&limit=20
 */
router.get('/reservations', async (req, res) => {
  try {
    const { status, user_id, product_id, page = 1, limit = 20 } = req.query
    
    const query = {}
    
    if (status) {
      query.status = status
    } else {
      query.status = { $in: ['reserved', 'confirmed'] }
    }
    
    if (user_id) query.userId = user_id
    if (product_id) query.productId = product_id
    
    query.expiresAt = { $gt: new Date() }

    const reservations = await StockReservation.find(query)
      .populate('productId', 'name')
      .populate('userId', 'email firstName lastName')
      .sort({ createdAt: -1 })
      .limit(parseInt(limit) * 1)
      .skip((parseInt(page) - 1) * parseInt(limit))

    const total = await StockReservation.countDocuments(query)

    res.json({
      success: true,
      data: {
        reservations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total,
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    })
  } catch (error) {
    console.error('Error fetching reservations:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching reservations'
    })
  }
})

/**
 * POST /api/admin/stock/reservations/cleanup
 * Clean up expired reservations
 */
router.post('/reservations/cleanup', async (req, res) => {
  try {
    const result = await stockService.cleanupExpiredReservations()
    
    res.json({
      success: true,
      data: result,
      message: `Cleaned up ${result.updated} expired reservations`
    })
  } catch (error) {
    console.error('Error cleaning up reservations:', error)
    res.status(500).json({
      success: false,
      error: 'Server error cleaning up reservations'
    })
  }
})

/**
 * POST /api/admin/stock/reconcile/:orderId
 * Reconcile stock for a specific order
 */
router.post('/reconcile/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params
    
    const result = await stockService.reconcileStockForOrder(orderId)
    
    if (!result.success) {
      return res.status(400).json({
        success: false,
        error: result.error
      })
    }

    res.json({
      success: true,
      data: result,
      message: `Stock reconciled for order ${orderId}`
    })
  } catch (error) {
    console.error('Error reconciling stock:', error)
    res.status(500).json({
      success: false,
      error: 'Server error reconciling stock'
    })
  }
})

/**
 * GET /api/admin/stock/audit/:productId
 * Get stock audit log for a product
 */
router.get('/audit/:productId', async (req, res) => {
  try {
    const { productId } = req.params
    const { limit = 50 } = req.query

    const auditLog = await stockService.getStockAuditLog(productId, parseInt(limit))
    
    res.json({
      success: true,
      data: auditLog
    })
  } catch (error) {
    console.error('Error fetching stock audit log:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching audit log'
    })
  }
})

/**
 * POST /api/admin/stock/adjust
 * Manually adjust stock for a product variation
 * Body: { productId, variationSku, adjustment, reason, adminId }
 */
router.post('/adjust', async (req, res) => {
  try {
    const { productId, variationSku, adjustment, reason } = req.body
    
    if (!productId || !variationSku || adjustment === undefined || !reason) {
      return res.status(400).json({
        success: false,
        error: 'Product ID, variation SKU, adjustment, and reason are required'
      })
    }

    if (typeof adjustment !== 'number') {
      return res.status(400).json({
        success: false,
        error: 'Adjustment must be a number'
      })
    }

    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    const variation = product.variations.find(v => v.sku === variationSku)
    if (!variation) {
      return res.status(404).json({
        success: false,
        error: 'Variation not found'
      })
    }

    // Apply adjustment
    const oldQuantity = variation.inventory.quantity
    const newQuantity = Math.max(0, oldQuantity + adjustment)
    
    variation.inventory.quantity = newQuantity
    
    // Update product stock status
    await product.updateStockStatus()
    await product.save()

    // Log the adjustment (you could create a separate audit model for this)
    console.log(`Stock adjustment: Product ${product.name}, Variation ${variationSku}, Old: ${oldQuantity}, New: ${newQuantity}, Adjustment: ${adjustment}, Reason: ${reason}, Admin: ${req.user.email}`)

    res.json({
      success: true,
      data: {
        productId,
        variationSku,
        oldQuantity,
        newQuantity,
        adjustment,
        stockStatus: product.stockStatus
      },
      message: `Stock adjusted for ${product.name} (${variationSku})`
    })
  } catch (error) {
    console.error('Error adjusting stock:', error)
    res.status(500).json({
      success: false,
      error: 'Server error adjusting stock'
    })
  }
})

/**
 * GET /api/admin/stock/low-stock-alerts
 * Get products that need restocking
 */
router.get('/low-stock-alerts', async (req, res) => {
  try {
    const products = await Product.find({
      isActive: true,
      $or: [
        { stockStatus: 'low_stock' },
        { stockStatus: 'out_of_stock' }
      ]
    })
    .populate('category', 'name')
    .sort({ stockStatus: 1, totalInventory: 1 })

    const alerts = products.map(product => ({
      productId: product._id,
      name: product.name,
      slug: product.slug,
      category: product.category.name,
      stockStatus: product.stockStatus,
      totalInventory: product.totalInventory,
      variations: product.variations
        .filter(v => v.inventory.quantity <= v.inventory.lowStockThreshold)
        .map(v => ({
          sku: v.sku,
          size: v.size,
          color: v.color,
          quantity: v.inventory.quantity,
          lowStockThreshold: v.inventory.lowStockThreshold,
          needsRestock: v.inventory.quantity === 0
        }))
    }))

    res.json({
      success: true,
      data: {
        alerts,
        summary: {
          totalAlerts: alerts.length,
          lowStock: alerts.filter(a => a.stockStatus === 'low_stock').length,
          outOfStock: alerts.filter(a => a.stockStatus === 'out_of_stock').length
        }
      }
    })
  } catch (error) {
    console.error('Error fetching low stock alerts:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching low stock alerts'
    })
  }
})

export default router