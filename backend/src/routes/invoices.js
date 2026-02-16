/**
 * Invoice Routes
 * Generate invoices, download PDFs, manage invoice records
 */

import express from 'express'
import { protect, admin } from '../middleware/auth.js'
import * as invoiceService from '../services/invoiceService.js'
import * as pdfService from '../services/pdfService.js'
import Order from '../models/Order.js'
import fs from 'fs'
import path from 'path'

const router = express.Router()

/**
 * POST /api/invoices/create-from-order/:orderId
 * Create invoice from order
 * Protected - customer who owns order or admin
 */
router.post('/create-from-order/:orderId', protect, async (req, res, next) => {
  try {
    const { orderId } = req.params
    const Order = require('../models/Order.js').default

    // Check if user owns order or is admin
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    if (order.customer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to create invoice for this order'
      })
    }

    // Check if invoice already exists
    const existingInvoice = await invoiceService.getOrderInvoice(orderId).catch(() => null)

    if (existingInvoice) {
      return res.status(400).json({
        success: false,
        error: 'Invoice already exists for this order'
      })
    }

    // Create invoice
    const invoice = await invoiceService.createInvoiceFromOrder(order, req.body.options || {})

    res.status(201).json({
      success: true,
      data: invoice,
      message: 'Invoice created successfully'
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/invoices
 * Get customer's invoice history
 * Protected
 * Query: ?page=1&limit=10
 */
router.get('/', protect, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 10, 100)

    const result = await invoiceService.getCustomerInvoices(req.user._id, { page, limit })

    res.json({
      success: true,
      data: result.invoices,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/invoices/order/:orderId
 * Get invoice for specific order
 * Protected
 */
router.get('/order/:orderId', protect, async (req, res, next) => {
  try {
    const { orderId } = req.params

    // Check if user owns order or is admin
    const order = await Order.findById(orderId)

    if (!order) {
      return res.status(404).json({
        success: false,
        error: 'Order not found'
      })
    }

    if (order.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this invoice'
      })
    }

    const invoice = await invoiceService.getOrderInvoice(orderId)

    res.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      })
    }
    next(error)
  }
})

/**
 * GET /api/invoices/:invoiceId/pdf
 * Download invoice as PDF
 * Protected
 */
router.get('/:invoiceId/pdf', protect, async (req, res, next) => {
  try {
    const { invoiceId } = req.params
    const invoice = await invoiceService.getInvoiceById(invoiceId)

    // Check authorization
    if (invoice.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to download this invoice'
      })
    }

    // Generate or get PDF
    let pdfPath = pdfService.getInvoicePDFPath(invoice.invoiceNumber)

    // Generate PDF if it doesn't exist
    if (!fs.existsSync(pdfPath)) {
      pdfPath = await pdfService.generateInvoicePDF(invoice, pdfPath)
    }

    // Mark as viewed
    await invoiceService.markInvoiceAsViewed(invoiceId)

    // Send file
    res.download(pdfPath, `${invoice.invoiceNumber}.pdf`, (err) => {
      if (err) {
        console.error('Download error:', err)
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/invoices/:invoiceId
 * Get invoice by ID
 * Protected
 */
router.get('/:invoiceId', protect, async (req, res, next) => {
  try {
    const { invoiceId } = req.params
    const invoice = await invoiceService.getInvoiceById(invoiceId)

    // Check authorization
    if (invoice.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this invoice'
      })
    }

    res.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      })
    }
    next(error)
  }
})

/**
 * GET /api/invoices/number/:invoiceNumber
 * Get invoice by invoice number
 * Protected
 */
router.get('/number/:invoiceNumber', protect, async (req, res, next) => {
  try {
    const { invoiceNumber } = req.params
    const invoice = await invoiceService.getInvoiceByNumber(invoiceNumber)

    // Check authorization
    if (invoice.customer._id.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Not authorized to view this invoice'
      })
    }

    res.json({
      success: true,
      data: invoice
    })
  } catch (error) {
    if (error.message.includes('not found')) {
      return res.status(404).json({
        success: false,
        error: error.message
      })
    }
    next(error)
  }
})

/**
 * GET /api/invoices
 * Get customer's invoice history
 * Protected
 * Query: ?page=1&limit=10
 */
router.get('/', protect, async (req, res, next) => {
  try {
    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 10, 100)

    const result = await invoiceService.getCustomerInvoices(req.user._id, { page, limit })

    res.json({
      success: true,
      data: result.invoices,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * ADMIN ENDPOINTS
 */

/**
 * GET /api/invoices/admin/all
 * Get all invoices (admin only)
 * Query: ?status=paid&page=1&limit=20&startDate=...&endDate=...
 */
router.get('/admin/all', protect, admin, async (req, res, next) => {
  try {
    const filters = {}
    if (req.query.status) filters.status = req.query.status
    if (req.query.paymentStatus) filters.paymentStatus = req.query.paymentStatus
    if (req.query.customerId) filters.customerId = req.query.customerId

    const page = parseInt(req.query.page) || 1
    const limit = Math.min(parseInt(req.query.limit) || 20, 100)

    const result = await invoiceService.getInvoices(filters, { page, limit })

    res.json({
      success: true,
      data: result.invoices,
      pagination: {
        total: result.total,
        page: result.page,
        limit: result.limit,
        pages: result.pages
      }
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/invoices/:invoiceId/status
 * Update invoice status (admin only)
 * Body: { status: 'sent'|'viewed'|'paid'|'cancelled' }
 */
router.put('/:invoiceId/status', protect, admin, async (req, res, next) => {
  try {
    const { invoiceId } = req.params
    const { status } = req.body

    if (!status) {
      return res.status(400).json({
        success: false,
        error: 'Status is required'
      })
    }

    const invoice = await invoiceService.updateInvoiceStatus(invoiceId, status)

    res.json({
      success: true,
      data: invoice,
      message: 'Invoice status updated successfully'
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/invoices/admin/stats
 * Get invoice statistics (admin only)
 */
router.get('/admin/stats', protect, admin, async (req, res, next) => {
  try {
    const stats = await invoiceService.getInvoiceStats()

    res.json({
      success: true,
      data: stats
    })
  } catch (error) {
    next(error)
  }
})

export default router
