/**
 * Add Test Shipping Location
 * Creates a temporary Test Location zone with ₦1 delivery fee for testing
 * 
 * Usage: node backend/add-test-location.js
 * To clean up: node backend/remove-test-location.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

// Modified schema allowing TEST_LOCATION for testing
const deliveryFeeSchema = new mongoose.Schema({
  fromZone: {
    type: String,
    enum: [
      'MAINLAND_A', 'MAINLAND_B', 'MAINLAND_C', 'MAINLAND_D',
      'MAINLAND_E', 'MAINLAND_F', 'MAINLAND_G',
      'ISLAND_A', 'ISLAND_B', 'ISLAND_C', 'TEST_LOCATION'
    ],
    required: true,
    index: true
  },

  toZone: {
    type: String,
    enum: [
      'MAINLAND_A', 'MAINLAND_B', 'MAINLAND_C', 'MAINLAND_D',
      'MAINLAND_E', 'MAINLAND_F', 'MAINLAND_G',
      'ISLAND_A', 'ISLAND_B', 'ISLAND_C', 'TEST_LOCATION'
    ],
    required: true,
    index: true
  },

  price: {
    type: Number,
    required: true,
    min: 0,
    default: 0
  },

  currency: {
    type: String,
    default: 'NGN',
    uppercase: true
  },

  isActive: {
    type: Boolean,
    default: true,
    index: true
  },

  previousPrice: {
    type: Number,
    default: null
  },

  priceUpdatedAt: {
    type: Date,
    default: Date.now
  },

  updatedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: false
  },

  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  notes: {
    type: String,
    trim: true,
    default: null
  }
}, {
  timestamps: true
})

deliveryFeeSchema.index({ fromZone: 1, toZone: 1 }, { unique: true })

const DeliveryFee = mongoose.model('DeliveryFee', deliveryFeeSchema)

const addTestLocation = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erica-spanks', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')

    // Create test location fee
    const testFee = {
      fromZone: 'MAINLAND_A',
      toZone: 'TEST_LOCATION',
      price: 1,
      currency: 'NGN',
      isActive: true,
      notes: 'TEMPORARY - Test location for testing. Delete after testing is complete.'
    }

    // Check if it already exists
    const existing = await DeliveryFee.findOne({ 
      fromZone: testFee.fromZone, 
      toZone: testFee.toZone 
    })

    if (existing) {
      console.log('ℹ️  Test location already exists')
      console.log(`   From: ${existing.fromZone}`)
      console.log(`   To: ${existing.toZone}`)
      console.log(`   Fee: ₦${existing.price}`)
    } else {
      const newFee = new DeliveryFee(testFee)
      await newFee.save()
      console.log('✅ Test location created successfully!')
      console.log(`   From: ${newFee.fromZone}`)
      console.log(`   To: ${newFee.toZone}`)
      console.log(`   Fee: ₦${newFee.price}`)
      console.log(`   Notes: ${newFee.notes}`)
    }

    // Display instructions
    console.log('\n📋 To use in testing:')
    console.log('   - Delivery area: "Test Location"')
    console.log('   - Delivery fee: ₦1')
    console.log('\n🧹 To clean up after testing:')
    console.log('   - Run: node backend/remove-test-location.js')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error adding test location:', error.message)
    process.exit(1)
  }
}

addTestLocation()
