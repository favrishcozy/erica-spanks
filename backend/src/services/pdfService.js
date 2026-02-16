/**
 * PDF Invoice Generation Service
 * Generates professional PDF invoices for orders
 */

import PDFDocument from 'pdfkit'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/**
 * Format currency (NGN)
 * @param {number} amount
 * @returns {string}
 */
const formatCurrency = (amount) => {
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount)
}

/**
 * Format date
 * @param {Date} date
 * @returns {string}
 */
const formatDate = (date) => {
  return new Intl.DateTimeFormat('en-NG', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date))
}

/**
 * Check if we need a new page - reads current page height dynamically
 * @param {Object} doc - PDFDocument instance
 * @param {number} requiredHeight - Required height for content
 * @param {number} bottomMargin - Bottom margin to reserve
 */
const checkPageBreak = (doc, requiredHeight, bottomMargin = 60) => {
  const currentPageHeight = doc.page.height
  if (doc.y + requiredHeight > currentPageHeight - bottomMargin) {
    doc.addPage()
    doc.y = doc.page.margins.top
    return true
  }
  return false
}

/**
 * Draw table header - can be called on first page and after page breaks
 * @param {Object} doc - PDFDocument instance
 * @param {number} tableTop - Y position for header
 * @param {number} descX - Description column X
 * @param {number} qtyX - Qty column X
 * @param {number} unitX - Unit price column X
 * @param {number} totalX - Total column X
 */
const drawTableHeader = (doc, tableTop, descX, qtyX, unitX, totalX) => {
  doc.moveTo(descX, tableTop)
    .lineTo(doc.page.width - doc.page.margins.right, tableTop)
    .strokeColor('#000')
    .stroke()

  doc.font('Helvetica-Bold').fontSize(9).fillColor('#000')
  doc.text('DESCRIPTION', descX, tableTop + 5)
  doc.text('QTY', qtyX, tableTop + 5, { width: 40, align: 'right' })
  doc.text('UNIT PRICE', unitX, tableTop + 5, { width: 60, align: 'right' })
  doc.text('TOTAL', totalX, tableTop + 5, { width: 60, align: 'right' })

  doc.moveDown(0.8)

  doc.moveTo(descX, doc.y)
    .lineTo(doc.page.width - doc.page.margins.right, doc.y)
    .strokeColor('#E5E5E5')
    .stroke()

  doc.moveDown(0.5)
}

/**
 * Format zone code to readable text
 * e.g., "MAINLAND_A" → "Mainland Zone A"
 * @param {string} zoneCode
 * @returns {string}
 */
const formatZone = (zoneCode) => {
  if (!zoneCode) return ''
  
  // Handle special cases like "MAINLAND_A" → "Mainland Zone A"
  const match = zoneCode.match(/^(MAINLAND|ISLAND)_([A-Z])$/)
  if (match) {
    const region = match[1] === 'MAINLAND' ? 'Mainland' : 'Island'
    return `${region} Zone ${match[2]}`
  }
  
  // Fallback: replace underscores with spaces and title case
  return zoneCode
    .split('_')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ')
}

/**
 * Format area name to title case
 * e.g., "festac" → "Festac"
 * @param {string} area
 * @returns {string}
 */
const formatArea = (area) => {
  if (!area) return ''
  return area.charAt(0).toUpperCase() + area.slice(1).toLowerCase()
}

/**
 * Safely map invoice to clean DTO
 * @param {Object} invoice - Raw invoice data
 */
const safeInvoice = (invoice) => ({
  invoiceNumber: invoice.invoiceNumber || 'N/A',
  createdAt: invoice.createdAt || new Date(),
  paymentStatus: invoice.paymentStatus || 'pending',
  order: invoice.order || {},
  business: {
    name: invoice.business?.name || 'Business Name',
    address: invoice.business?.address || '',
    phone: invoice.business?.phone || '',
    email: invoice.business?.email || '',
    website: invoice.business?.website || '',
    taxId: invoice.business?.taxId || '',
    logo: invoice.business?.logo || null
  },
  billingDetails: {
    firstName: invoice.billingDetails?.firstName || '',
    lastName: invoice.billingDetails?.lastName || '',
    address: invoice.billingDetails?.address || '',
    city: invoice.billingDetails?.city || '',
    state: invoice.billingDetails?.state || '',
    zipCode: invoice.billingDetails?.zipCode || '',
    email: invoice.billingDetails?.email || '',
    phone: invoice.billingDetails?.phone || ''
  },
  shippingMethod: invoice.shippingMethod || 'pickup',
  shippingAddress: invoice.shippingAddress || {},
  items: (invoice.items || []).map(item => ({
    productName: item.productName || 'Product',
    quantity: Number(item.quantity) || 0,
    unitPrice: Number(item.unitPrice) || 0,
    totalPrice: Number(item.totalPrice) || 0,
    variation: {
      color: item.variation?.color || '',
      size: item.variation?.size || ''
    }
  })),
  subtotal: Number(invoice.subtotal) || 0,
  discount: Number(invoice.discount) || 0,
  tax: Number(invoice.tax) || 0,
  taxRate: Number(invoice.taxRate) || 0,
  shippingFee: Number(invoice.shippingFee) || 0,
  total: Number(invoice.total) || 0,
  transactionId: invoice.transactionId || '',
  paymentMethod: invoice.paymentMethod || '',
  terms: invoice.terms || ''
})

/**
 * Generate PDF invoice
 * @param {Object} invoice - Invoice document from MongoDB
 * @param {string} outputPath - Path to save PDF
 * @returns {Promise<string>} Path to generated PDF
 */
export const generateInvoicePDF = async (invoice, outputPath) => {
  return new Promise((resolve, reject) => {
    try {
      // Ensure output directory exists
      const outputDir = path.dirname(outputPath)
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true })
      }

      // Create PDF document
      const doc = new PDFDocument({
        bufferPages: true,
        margin: 40,
        size: 'A4'
      })

      // Pipe to file
      const writeStream = fs.createWriteStream(outputPath)
      doc.pipe(writeStream)

      // Use safe DTO
      const inv = safeInvoice(invoice)
      const margins = doc.page.margins
      const pageWidth = doc.page.width

      // ===== HEADER =====
      doc.fillColor('#000')

      // Logo
      if (inv.business.logo && fs.existsSync(inv.business.logo)) {
        try {
          doc.image(inv.business.logo, margins.left, margins.top, { width: 45 })
        } catch {}
      }

      const brandX = margins.left + (inv.business.logo ? 60 : 0)

      // Brand Name
      doc.font('Helvetica-Bold')
        .fontSize(20)
        .text(inv.business.name, brandX, margins.top)

      // Business Info
      doc.font('Helvetica')
        .fontSize(9)
        .fillColor('#555')
        .text(inv.business.address, brandX, doc.y)
        .text('Tel: +234 811 332 2121', brandX, doc.y)
        .text(inv.business.email, brandX, doc.y)

      // INVOICE title on right
      doc.font('Helvetica-Bold')
        .fontSize(16)
        .fillColor('#D4A574')
        .text('INVOICE', margins.left, margins.top, { align: 'right' })

      doc.moveDown(2)

      // Thin divider line
      doc.moveTo(margins.left, doc.y)
        .lineTo(doc.page.width - margins.right, doc.y)
        .strokeColor('#E5E5E5')
        .stroke()

      doc.moveDown(1.5)

      // ===== INVOICE META =====
      doc.fontSize(9).fillColor('#333')

      doc.text(`Invoice #: ${inv.invoiceNumber}`, { align: 'right' })
      doc.text(`Date: ${formatDate(inv.createdAt)}`, { align: 'right' })
      doc.text(`Order #: ${inv.order.orderNumber || 'N/A'}`, { align: 'right' })
      doc.text(`Status: ${inv.paymentStatus.toUpperCase()}`, { align: 'right' })

      doc.moveDown(2)

      // ===== BILL TO + DELIVERY =====
      const infoTopY = doc.y

      // BILL TO
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#000')
      doc.text('BILL TO', margins.left, infoTopY)

      doc.font('Helvetica').fontSize(9).fillColor('#444')
      doc.text(`${inv.billingDetails.firstName} ${inv.billingDetails.lastName}`)
      doc.text(inv.billingDetails.address)
      doc.text(`${inv.billingDetails.city}, ${inv.billingDetails.state}`)
      doc.text(inv.billingDetails.email)
      if (inv.billingDetails.phone) doc.text(inv.billingDetails.phone)

      // DELIVERY RIGHT SIDE
      const rightColX = pageWidth / 2 + 20
      doc.font('Helvetica-Bold').fontSize(10).fillColor('#000')
      doc.text(inv.shippingMethod === 'delivery' ? 'DELIVERY' : 'PICKUP', rightColX, infoTopY)

      doc.font('Helvetica').fontSize(9).fillColor('#444')
      if (inv.shippingMethod === 'delivery') {
        doc.text('Home delivery', rightColX)
        if (inv.shippingAddress?.area) {
          doc.text(`Area: ${formatArea(inv.shippingAddress.area)}`, rightColX)
        }
        if (inv.shippingAddress?.zone) {
          doc.text(`Zone: ${formatZone(inv.shippingAddress.zone)}`, rightColX)
        }
      } else {
        doc.text('Store pickup location', rightColX)
      }

      doc.moveDown(5)

      // ===== ITEMS TABLE =====
      // Column positions
      const descX = margins.left
      const qtyX = pageWidth * 0.58
      const unitX = pageWidth * 0.68
      const totalX = pageWidth * 0.82

      // Check for page break before table
      checkPageBreak(doc, 100)

      const tableTop = doc.y

      // Header
      drawTableHeader(doc, tableTop, descX, qtyX, unitX, totalX)

      // Rows
      doc.font('Helvetica').fontSize(9).fillColor('#333')

      inv.items.forEach((item) => {
        // Check for page break before each item
        if (checkPageBreak(doc, 60)) {
          drawTableHeader(doc, doc.y, descX, qtyX, unitX, totalX)
        }

        const startY = doc.y

        const description = `${item.productName}${
          item.variation.color ? ` (${item.variation.color}` : ''
        }${item.variation.size ? `, ${item.variation.size}` : ''}${item.variation.color || item.variation.size ? ')' : ''}`

        doc.text(description, descX, startY, { width: qtyX - descX - 10 })
        doc.text(item.quantity.toString(), qtyX, startY, { width: 40, align: 'right' })
        doc.text(formatCurrency(item.unitPrice), unitX, startY, { width: 60, align: 'right' })
        doc.text(formatCurrency(item.totalPrice), totalX, startY, { width: 60, align: 'right' })

        doc.moveDown(0.8)
      })

      // Bottom line
      doc.moveTo(descX, doc.y)
        .lineTo(doc.page.width - margins.right, doc.y)
        .strokeColor('#000')
        .stroke()

      doc.moveDown(2)

      // ===== TOTALS SECTION =====
      const totalsX = pageWidth - margins.right - 200

      doc.font('Helvetica').fontSize(9).fillColor('#333')

      doc.text('Subtotal', totalsX, doc.y, { width: 100 })
      doc.text(formatCurrency(inv.subtotal), totalsX + 100, doc.y, { align: 'right' })

      if (inv.discount > 0) {
        doc.moveDown(0.5)
        doc.text('Discount', totalsX, doc.y, { width: 100 })
        doc.text(`- ${formatCurrency(inv.discount)}`, totalsX + 100, doc.y, { align: 'right' })
      }

      if (inv.tax > 0) {
        doc.moveDown(0.5)
        doc.text(`Tax (${inv.taxRate || 0}%)`, totalsX, doc.y, { width: 100 })
        doc.text(formatCurrency(inv.tax), totalsX + 100, doc.y, { align: 'right' })
      }

      if (inv.shippingFee > 0) {
        doc.moveDown(0.5)
        doc.text('Shipping', totalsX, doc.y, { width: 100 })
        doc.text(formatCurrency(inv.shippingFee), totalsX + 100, doc.y, { align: 'right' })
      }

      doc.moveDown(0.7)
      doc.moveTo(totalsX, doc.y)
        .lineTo(doc.page.width - margins.right, doc.y)
        .strokeColor('#000')
        .stroke()

      doc.moveDown(0.7)

      doc.font('Helvetica-Bold').fontSize(11).fillColor('#000')
      doc.text('TOTAL', totalsX, doc.y, { width: 100 })
      doc.fillColor('#D4A574')
      doc.text(formatCurrency(inv.total), totalsX + 100, doc.y, { align: 'right' })

      doc.fillColor('#000')
      doc.moveDown(2)

      // ===== FOOTER =====
      // Check if we need a new page for footer
      const currentPageHeight = doc.page.height
      if (doc.y > currentPageHeight - margins.bottom - 80) {
        doc.addPage()
      }

      const footerTop = doc.page.height - doc.page.margins.bottom - 50

      doc.moveTo(margins.left, footerTop)
        .lineTo(doc.page.width - margins.right, footerTop)
        .strokeColor('#E5E5E5')
        .stroke()

      doc.fontSize(9).fillColor('#666')
      doc.text(inv.terms || 'Thank you for your business!', margins.left, footerTop + 8, { align: 'center' })

      // Payment method details
      if (inv.transactionId) {
        doc.fontSize(8).fillColor('#D4A574')
        doc.text('Payment Verified', margins.left, footerTop + 20, { align: 'center' })

        doc.fontSize(8).fillColor('#666')
        doc.text(`${inv.paymentMethod?.toUpperCase() || 'N/A'} | Transaction: ${inv.transactionId}`, margins.left, footerTop + 32, { align: 'center' })
      }

      // Page numbers and generation time
      const range = doc.bufferedPageRange()
      for (let i = range.start; i < range.start + range.count; i++) {
        doc.switchToPage(i)
        doc.fontSize(7).fillColor('#999')
        doc.text(
          `Generated on ${formatDate(new Date())} | Page ${i + 1} of ${range.count}`,
          margins.left,
          doc.page.height - margins.bottom - 8,
          { align: 'center' }
        )
      }

      // End document
      doc.end()

      // Handle completion
      writeStream.on('finish', () => {
        resolve(outputPath)
      })

      writeStream.on('error', (error) => {
        reject(new Error(`Failed to write PDF: ${error.message}`))
      })
    } catch (error) {
      reject(new Error(`Failed to generate PDF: ${error.message}`))
    }
  })
}

/**
 * Get PDF path for invoice
 * @param {string} invoiceNumber
 * @returns {string}
 */
export const getInvoicePDFPath = (invoiceNumber) => {
  const pdfsDir = path.join(__dirname, '../../tmp/invoices')
  return path.join(pdfsDir, `${invoiceNumber}.pdf`)
}
