/**
 * Shipping/Delivery Routes
 * Calculate delivery fees, manage delivery zones, and admin delivery fee management
 */

import express from 'express'
import { protect, admin } from '../middleware/auth.js'
import * as shippingService from '../services/shippingService.js'

const router = express.Router()

/**
 * PUBLIC ENDPOINTS
 */

/**
 * POST /api/shipping/calculate
 * Calculate delivery fee for given area
 * Body: { deliveryArea, deliveryMethod?, pickupZone? }
 * @returns { success, deliveryFee, zone, message }
 */
router.post('/calculate', async (req, res, next) => {
  try {
    const { deliveryArea, deliveryMethod = 'delivery' } = req.body
    // Enforce origin: all shipments originate from MAINLAND_A (store address)
    const pickupZone = 'MAINLAND_A'

    if (!deliveryArea) {
      return res.status(400).json({
        success: false,
        error: 'Delivery area is required'
      })
    }

    // Validate delivery area and method
    const validation = await shippingService.validateDeliveryArea(deliveryArea, deliveryMethod)

    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: validation.message
      })
    }

    // Calculate fee using service (DB first, then matrix). Only override with flat fee
    // when origin MAINLAND_A -> destination MAINLAND_A (Zone A to Zone A).
    const feeData = await shippingService.calculateDeliveryFee(deliveryArea, pickupZone)
    let deliveryFee = feeData.fee

    // Override for MAINLAND_A -> MAINLAND_A (Zone A to Zone A)
    if (pickupZone === 'MAINLAND_A' && feeData.zone === 'MAINLAND_A') {
      deliveryFee = 2500
    }

    res.json({
      success: true,
      deliveryFee,
      zone: validation.zone,
      deliveryMethod,
      message: 'Delivery fee calculated successfully'
    })
  } catch (error) {
    next(error)
  }
})

/**
 * GET /api/shipping/zones
 * Get all delivery zones and areas
 * @returns { success, zones }
 */
router.get('/zones', async (req, res, next) => {
  try {
    const zones = await shippingService.getAllDeliveryZones()

    res.json({
      success: true,
      zones
    })
  } catch (error) {
    next(error)
  }
})

/**
 * ADMIN ENDPOINTS
 */

/**
 * GET /api/shipping/fees
 * Get all delivery fees (admin only)
 * Query: ?fromZone=MAINLAND_A&toZone=ISLAND_C
 * @returns { success, fees }
 */
router.get('/fees', protect, admin, async (req, res, next) => {
  try {
    const filters = {}

    if (req.query.fromZone) filters.fromZone = req.query.fromZone
    if (req.query.toZone) filters.toZone = req.query.toZone

    const fees = await shippingService.getDeliveryFees(filters)

    res.json({
      success: true,
      count: fees.length,
      fees
    })
  } catch (error) {
    next(error)
  }
})

/**
 * PUT /api/shipping/fees/:fromZone/:toZone
 * Update delivery fee (admin only)
 * Body: { price, notes? }
 * @returns { success, data }
 */
router.put('/fees/:fromZone/:toZone', protect, admin, async (req, res, next) => {
  try {
    const { fromZone, toZone } = req.params
    const { price, notes } = req.body

    if (typeof price !== 'number' || price < 0) {
      return res.status(400).json({
        success: false,
        error: 'Price must be a non-negative number'
      })
    }

    // Create or update fee record
    const DeliveryFee = require('../models/DeliveryFee.js')

    let fee = await DeliveryFee.findOne({ fromZone, toZone })

    if (!fee) {
      fee = new DeliveryFee({
        fromZone,
        toZone,
        price,
        notes,
        updatedBy: req.user._id
      })
    } else {
      fee.previousPrice = fee.price
      fee.price = price
      fee.notes = notes
      fee.updatedBy = req.user._id
      fee.priceUpdatedAt = new Date()
    }

    await fee.save()

    res.json({
      success: true,
      data: fee,
      message: `Delivery fee from ${fromZone} to ${toZone} updated successfully`
    })
  } catch (error) {
    next(error)
  }
})

/**
 * POST /api/shipping/seed-defaults
 * Seed default delivery fees from matrix (one-time setup)
 * Admin only
 * @returns { success, count, message }
 */
router.post('/seed-defaults', protect, admin, async (req, res, next) => {
  try {
    const count = await shippingService.seedDeliveryFees()

    res.json({
      success: true,
      count,
      message: `${count} delivery fees seeded successfully`
    })
  } catch (error) {
    next(error)
  }
})

export default router
