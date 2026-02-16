/**
 * Seed Delivery Fees Script
 * Run this once to populate the database with delivery fee matrix
 * 
 * Usage: node backend/scripts/seedDeliveryFees.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import DeliveryFee from '../src/models/DeliveryFee.js'
import { deliveryMatrix } from '../src/data/deliveryZones.js'

dotenv.config()

const seedDeliveryFees = async () => {
  try {
    // Connect to MongoDB
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erica-spanks', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')

    // Convert matrix to fee records
    const fees = []
    Object.entries(deliveryMatrix).forEach(([fromZone, destinations]) => {
      Object.entries(destinations).forEach(([toZone, price]) => {
        fees.push({
          fromZone,
          toZone,
          price,
          isActive: true,
          currency: 'NGN'
        })
      })
    })

    console.log(`📦 Preparing to seed ${fees.length} delivery fees...`)

    // Insert with duplicate key handling
    const result = await DeliveryFee.insertMany(fees, { ordered: false }).catch((error) => {
      if (error.code === 11000) {
        console.log('⚠️  Some fees already exist, skipping duplicates')
        return error.insertedDocs || []
      }
      throw error
    })

    const insertedCount = Array.isArray(result) ? result.length : (result?.insertedIds?.length || 0)
    console.log(`✅ Successfully seeded ${insertedCount} delivery fees`)

    // Verify seeding
    const totalFees = await DeliveryFee.countDocuments({ isActive: true })
    console.log(`📊 Total delivery fees in database: ${totalFees}`)

    // Show some examples
    const examples = await DeliveryFee.find({ fromZone: 'MAINLAND_A' }).limit(5).lean()
    console.log('\n📋 Example fees (from MAINLAND_A):')
    examples.forEach((fee) => {
      console.log(`   ${fee.fromZone} → ${fee.toZone}: ₦${fee.price}`)
    })

    console.log('\n✨ Delivery fees seeded successfully!')
    process.exit(0)
  } catch (error) {
    console.error('❌ Error seeding delivery fees:', error.message)
    process.exit(1)
  }
}

seedDeliveryFees()
