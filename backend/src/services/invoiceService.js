/**
 * Invoice Service - Generate invoices, PDFs, and manage invoice records
 */

import Invoice from '../models/Invoice.js'
import Order from '../models/Order.js'
import User from '../models/User.js'

/**
 * Generate unique invoice number
 * Format: INV-YYYY-XXXXX (e.g., INV-2024-00001)
 * @returns {Promise<string>}
 */
export const generateInvoiceNumber = async () => {
  try {
    const now = new Date()
    const year = now.getFullYear()
    const month = String(now.getMonth() + 1).padStart(2, '0')
    const day = String(now.getDate()).padStart(2, '0')

    // Get count of invoices created today
    const startOfDay = new Date(now)
    startOfDay.setHours(0, 0, 0, 0)

    const endOfDay = new Date(now)
    endOfDay.setHours(23, 59, 59, 999)

    const countToday = await Invoice.countDocuments({
      createdAt: { $gte: startOfDay, $lte: endOfDay }
    })

    const sequence = String(countToday + 1).padStart(5, '0')

    // Format: INV-YYYYMMDD-XXXXX
    const invoiceNumber = `INV-${year}${month}${day}-${sequence}`

    return invoiceNumber
  } catch (error) {
    throw new Error('Failed to generate invoice number')
  }
}

/**
 * Create invoice from order
 * @param {Object} orderData - Order object
 * @param {Object} options - Additional options
 * @returns {Promise<Object>} Created invoice
 */
export const createInvoiceFromOrder = async (order, options = {}) => {
  try {
    if (!order) {
      throw new Error('Order is required to create invoice')
    }

    // Get customer details - Order has 'user' field, not 'customer'
    const customerId = order.user || order.customer || order.userId
    const customer = await User.findById(customerId).lean()
    if (!customer) {
      throw new Error('Customer not found')
    }

    // Get shipping address
    const shippingAddress = order.shippingAddress || {}

    // Prepare invoice items
    const items = (order.items || []).map((item) => ({
      product: item.product,
      productName: item.productSnapshot?.name || 'Product',
      sku: item.variation?.sku,
      variation: {
        size: item.variation?.size,
        color: item.variation?.color
      },
      quantity: item.quantity,
      unitPrice: item.unitPrice,
      totalPrice: item.totalPrice
    }))

    // Generate invoice number
    const invoiceNumber = await generateInvoiceNumber()

    // Extract pricing data - Order uses pricing object
    const pricing = order.pricing || {}
    const subtotal = pricing.subtotal || 0
    const discount = pricing.discount || 0
    const tax = pricing.tax || 0
    const shippingFee = pricing.shippingCost || 0
    const total = pricing.total || 0

    // Create invoice
    const invoice = new Invoice({
      invoiceNumber,
      order: order._id,
      customer: customer._id,

      business: {
        name: options.businessName || 'Erica Spanks',
        logo: options.businessLogo || null,
        address: options.businessAddress || '',
        phone: options.businessPhone || '',
        email: options.businessEmail || 'orders@ericaspanks.com',
        website: options.businessWebsite || 'https://ericaspanks.com',
        taxId: options.businessTaxId || null
      },

      billingDetails: {
        firstName: customer.firstName || 'N/A',
        lastName: customer.lastName || 'N/A',
        email: customer.email,
        phone: customer.phone || '',
        address: shippingAddress.address1 || '',
        city: shippingAddress.city || '',
        state: shippingAddress.state || 'Lagos',
        zipCode: shippingAddress.zipCode || ''
      },

      items,
      subtotal: subtotal,
      discount: discount,
      discountDescription: order.discountDescription,
      tax: tax,
      taxRate: order.taxRate || 0,
      shippingFee: shippingFee,
      shippingMethod: order.deliveryMethod || 'delivery',
      shippingAddress: {
        area: order.deliveryArea || '',
        zone: order.deliveryZone || '',
        fullAddress: shippingAddress.address1 || ''
      },

      total: total,
      paymentMethod: order.paymentInfo?.method || 'paystack',
      paymentStatus: order.paymentInfo?.status || order.status,
      transactionId: order.paymentInfo?.transactionId,

      status: options.status || 'draft',
      notes: options.notes || null,
      terms: options.terms || 'Thank you for your purchase!'
    })

    await invoice.save()

    return invoice
  } catch (error) {
    throw new Error(error.message || 'Failed to create invoice')
  }
}

/**
 * Get invoice by ID
 * @param {string} invoiceId
 * @returns {Promise<Object>}
 */
export const getInvoiceById = async (invoiceId) => {
  try {
    const invoice = await Invoice.findById(invoiceId)
      .populate('order customer')
      .lean()

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    return invoice
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch invoice')
  }
}

/**
 * Get invoice by invoice number
 * @param {string} invoiceNumber
 * @returns {Promise<Object>}
 */
export const getInvoiceByNumber = async (invoiceNumber) => {
  try {
    const invoice = await Invoice.findOne({ invoiceNumber })
      .populate('order customer')
      .lean()

    if (!invoice) {
      throw new Error(`Invoice ${invoiceNumber} not found`)
    }

    return invoice
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch invoice')
  }
}

/**
 * Get customer invoice history
 * @param {string} customerId
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>} { invoices, total, page, limit }
 */
export const getCustomerInvoices = async (customerId, options = {}) => {
  try {
    const limit = Math.min(options.limit || 10, 100)
    const page = options.page || 1
    const skip = (page - 1) * limit

    const invoices = await Invoice.find({ customer: customerId })
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('order', 'orderNumber totalAmount createdAt')
      .lean()

    const total = await Invoice.countDocuments({ customer: customerId })

    return {
      invoices,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  } catch (error) {
    throw new Error('Failed to fetch customer invoices')
  }
}

/**
 * Get order invoice
 * @param {string} orderId
 * @returns {Promise<Object>}
 */
export const getOrderInvoice = async (orderId) => {
  try {
    const invoice = await Invoice.findOne({ order: orderId })
      .populate('order customer')
      .lean()

    if (!invoice) {
      throw new Error('Invoice not found for this order')
    }

    return invoice
  } catch (error) {
    throw new Error(error.message || 'Failed to fetch order invoice')
  }
}

/**
 * Update invoice status
 * @param {string} invoiceId
 * @param {string} status - 'draft', 'sent', 'viewed', 'paid', 'cancelled'
 * @returns {Promise<Object>}
 */
export const updateInvoiceStatus = async (invoiceId, status) => {
  try {
    const validStatuses = ['draft', 'sent', 'viewed', 'paid', 'cancelled']

    if (!validStatuses.includes(status)) {
      throw new Error(`Invalid status. Must be one of: ${validStatuses.join(', ')}`)
    }

    const updateData = { status, updatedAt: new Date() }

    if (status === 'sent' && !await Invoice.findById(invoiceId).select('sentAt').lean().then(i => i?.sentAt)) {
      updateData.sentAt = new Date()
    }

    const invoice = await Invoice.findByIdAndUpdate(invoiceId, updateData, {
      new: true,
      runValidators: true
    })

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    return invoice
  } catch (error) {
    throw new Error(error.message || 'Failed to update invoice status')
  }
}

/**
 * Mark invoice as viewed
 * @param {string} invoiceId
 * @returns {Promise<Object>}
 */
export const markInvoiceAsViewed = async (invoiceId) => {
  try {
    const invoice = await Invoice.findByIdAndUpdate(
      invoiceId,
      {
        status: 'viewed',
        viewedAt: new Date(),
        updatedAt: new Date()
      },
      { new: true }
    )

    if (!invoice) {
      throw new Error('Invoice not found')
    }

    return invoice
  } catch (error) {
    throw new Error('Failed to mark invoice as viewed')
  }
}

/**
 * Get invoices for admin (with filters)
 * @param {Object} filters
 * @param {Object} options - Pagination options
 * @returns {Promise<Object>}
 */
export const getInvoices = async (filters = {}, options = {}) => {
  try {
    const limit = Math.min(options.limit || 20, 100)
    const page = options.page || 1
    const skip = (page - 1) * limit

    const query = {}

    if (filters.status) query.status = filters.status
    if (filters.paymentStatus) query.paymentStatus = filters.paymentStatus
    if (filters.customerId) query.customer = filters.customerId
    if (filters.startDate || filters.endDate) {
      query.createdAt = {}
      if (filters.startDate) query.createdAt.$gte = new Date(filters.startDate)
      if (filters.endDate) query.createdAt.$lte = new Date(filters.endDate)
    }

    const invoices = await Invoice.find(query)
      .sort({ createdAt: -1 })
      .limit(limit)
      .skip(skip)
      .populate('customer', 'firstName lastName email')
      .lean()

    const total = await Invoice.countDocuments(query)

    return {
      invoices,
      total,
      page,
      limit,
      pages: Math.ceil(total / limit)
    }
  } catch (error) {
    throw new Error('Failed to fetch invoices')
  }
}

/**
 * Get invoice statistics for dashboard
 * @returns {Promise<Object>}
 */
export const getInvoiceStats = async () => {
  try {
    const totalInvoices = await Invoice.countDocuments()
    const paidInvoices = await Invoice.countDocuments({ paymentStatus: 'completed' })
    const pendingInvoices = await Invoice.countDocuments({ paymentStatus: 'pending' })

    const totalRevenue = await Invoice.aggregate([
      { $group: { _id: null, total: { $sum: '$total' } } }
    ])

    return {
      totalInvoices,
      paidInvoices,
      pendingInvoices,
      totalRevenue: totalRevenue[0]?.total || 0
    }
  } catch (error) {
    throw new Error('Failed to fetch invoice statistics')
  }
}
