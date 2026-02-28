/**
 * Shipping Service - Calculate delivery fees and validate areas
 */

import DeliveryFee from '../models/DeliveryFee.js'
import { areaToZone, deliveryMatrix, pickupLocations } from '../data/deliveryZones.js'

/**
 * Convert delivery area to zone
 * @param {string} deliveryArea - Area name or zone code
 * @returns {string} Zone code (e.g., 'MAINLAND_A')
 */
export const getZoneFromArea = (deliveryArea) => {
  if (!deliveryArea) throw new Error('Delivery area is required')

  const normalizedArea = deliveryArea.trim()

  // Direct zone mapping with exact match
  if (areaToZone[normalizedArea]) {
    return areaToZone[normalizedArea]
  }

  // Try case-insensitive match
  const lowerNormalized = normalizedArea.toLowerCase()
  const foundEntry = Object.entries(areaToZone).find(([area]) =>
    area.toLowerCase() === lowerNormalized
  )

  if (foundEntry) {
    return foundEntry[1]
  }

  // Try partial matches (case-insensitive)
  const foundZone = Object.entries(areaToZone).find(([area]) =>
    area.toLowerCase().includes(lowerNormalized) || lowerNormalized.includes(area.toLowerCase())
  )

  if (foundZone) {
    return foundZone[1]
  }

  throw new Error(`Delivery area "${deliveryArea}" is not supported. Only Lagos delivery available for now.`)
}

/**
 * Check if area has pickup available
 * @param {string} deliveryArea - Area name
 * @returns {boolean}
 */
export const isPickupArea = (deliveryArea) => {
  if (!deliveryArea) return false
  const normalizedArea = deliveryArea.toLowerCase().trim()
  return pickupLocations.some(location => location.toLowerCase() === normalizedArea)
}

/**
 * Calculate delivery fee for a given area
 * Priority: 1. Database, 2. Default matrix
 * @param {string} deliveryArea - Delivery area name
 * @param {string} pickupZone - Pickup zone (defaults to 'MAINLAND_A' - main warehouse)
 * @returns {Promise<{fee: number, zone: string}>}
 */
export const calculateDeliveryFee = async (deliveryArea, pickupZone = 'MAINLAND_A') => {
  try {
    const deliveryZone = getZoneFromArea(deliveryArea)

    // Try to get fee from database first (allows dynamic updates via admin)
    let deliveryFeeRecord = await DeliveryFee.findOne({
      fromZone: pickupZone,
      toZone: deliveryZone,
      isActive: true
    }).lean()

    if (deliveryFeeRecord) {
      return {
        fee: deliveryFeeRecord.price,
        zone: deliveryZone,
        source: 'database'
      }
    }

    // Fallback to matrix
    const matrixPrice = deliveryMatrix[pickupZone]?.[deliveryZone]

    if (matrixPrice === undefined) {
      throw new Error(
        `Delivery route from ${pickupZone} to ${deliveryZone} is not available`
      )
    }

    return {
      fee: matrixPrice,
      zone: deliveryZone,
      source: 'matrix'
    }
  } catch (error) {
    throw new Error(error.message || 'Failed to calculate delivery fee')
  }
}

/**
 * Validate delivery area and method
 * @param {string} deliveryArea - Area name
 * @param {string} deliveryMethod - 'delivery' or 'pickup'
 * @returns {Promise<{isValid: boolean, zone: string, message: string}>}
 */
export const validateDeliveryArea = async (deliveryArea, deliveryMethod = 'delivery') => {
  try {
    if (!deliveryArea) {
      return {
        isValid: false,
        zone: null,
        message: 'Delivery area is required'
      }
    }

    const zone = getZoneFromArea(deliveryArea)

    if (deliveryMethod === 'pickup') {
      if (!isPickupArea(deliveryArea)) {
        return {
          isValid: false,
          zone,
          message: 'Pickup is only available at Chevron or Orchid Road (Island Zone C)'
        }
      }
    }

    return {
      isValid: true,
      zone,
      message: 'Delivery area is valid'
    }
  } catch (error) {
    return {
      isValid: false,
      zone: null,
      message: error.message
    }
  }
}

/**
 * Get all delivery zones and their details
 * @returns {Promise<Array>}
 */
export const getAllDeliveryZones = async () => {
  try {
    const zones = {}

    // Group areas by zone
    Object.entries(areaToZone).forEach(([area, zone]) => {
      if (!zones[zone]) {
        zones[zone] = []
      }
      zones[zone].push(area)
    })

    return zones
  } catch (error) {
    throw new Error('Failed to fetch delivery zones')
  }
}

/**
 * Get delivery fees from database (for admin display)
 * @param {Object} filters - Optional filters
 * @returns {Promise<Array>}
 */
export const getDeliveryFees = async (filters = {}) => {
  try {
    const query = { ...filters }
    const fees = await DeliveryFee.find(query)
      .sort({ fromZone: 1, toZone: 1 })
      .lean()

    return fees
  } catch (error) {
    throw new Error('Failed to fetch delivery fees')
  }
}

/**
 * Update delivery fee (admin only)
 * @param {string} fromZone
 * @param {string} toZone
 * @param {number} newPrice
 * @param {string} adminId
 * @returns {Promise<Object>}
 */
export const updateDeliveryFee = async (fromZone, toZone, newPrice, adminId) => {
  try {
    if (!fromZone || !toZone) {
      throw new Error('Both fromZone and toZone are required')
    }

    if (typeof newPrice !== 'number' || newPrice < 0) {
      throw new Error('Price must be a non-negative number')
    }

    const updated = await DeliveryFee.findOneAndUpdate(
      { fromZone, toZone },
      {
        price: newPrice,
        updatedBy: adminId,
        updatedAt: new Date()
      },
      { new: true, runValidators: true }
    )

    if (!updated) {
      throw new Error(`Delivery fee for ${fromZone} → ${toZone} not found`)
    }

    return updated
  } catch (error) {
    throw new Error(error.message || 'Failed to update delivery fee')
  }
}

/**
 * Seed default delivery fees from matrix (one-time setup)
 * @returns {Promise<number>} Count of created records
 */
export const seedDeliveryFees = async () => {
  try {
    const fees = []

    // Flatten the matrix into individual records
    Object.entries(deliveryMatrix).forEach(([fromZone, destinations]) => {
      Object.entries(destinations).forEach(([toZone, price]) => {
        fees.push({
          fromZone,
          toZone,
          price,
          isActive: true
        })
      })
    })

    // Use insertMany with options to skip duplicates
    const result = await DeliveryFee.insertMany(fees, { ordered: false }).catch(
      (error) => {
        // Ignore duplicate key errors, continue with successful inserts
        if (error.code === 11000) {
          console.log('Some delivery fees already exist, skipping duplicates')
          return error.insertedDocs || []
        }
        throw error
      }
    )

    return Array.isArray(result) ? result.length : 0
  } catch (error) {
    console.error('Error seeding delivery fees:', error)
    throw new Error('Failed to seed delivery fees')
  }
}
