/**
 * Remove Test Shipping Location
 * Deletes the temporary Test Location zone
 * 
 * Usage: node backend/remove-test-location.js
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

const removeTestLocation = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erica-spanks', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')

    // Delete test location
    const result = await DeliveryFee.deleteOne({ 
      fromZone: 'MAINLAND_A', 
      toZone: 'TEST_LOCATION' 
    })

    if (result.deletedCount > 0) {
      console.log('✅ Test location removed successfully!')
    } else {
      console.log('ℹ️  Test location not found (may have already been deleted)')
    }

    process.exit(0)
  } catch (error) {
    console.error('❌ Error removing test location:', error.message)
    process.exit(1)
  }
}

removeTestLocation()
