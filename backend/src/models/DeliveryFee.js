import mongoose from 'mongoose'

const deliveryFeeSchema = new mongoose.Schema({
  fromZone: {
    type: String,
    enum: [
      'MAINLAND_A', 'MAINLAND_B', 'MAINLAND_C', 'MAINLAND_D',
      'MAINLAND_E', 'MAINLAND_F', 'MAINLAND_G',
      'ISLAND_A', 'ISLAND_B', 'ISLAND_C'
    ],
    required: true,
    index: true
  },

  toZone: {
    type: String,
    enum: [
      'MAINLAND_A', 'MAINLAND_B', 'MAINLAND_C', 'MAINLAND_D',
      'MAINLAND_E', 'MAINLAND_F', 'MAINLAND_G',
      'ISLAND_A', 'ISLAND_B', 'ISLAND_C'
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

  // Track price changes
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

// Unique compound index for zone-to-zone pair
deliveryFeeSchema.index({ fromZone: 1, toZone: 1 }, { unique: true })

// Pre-save hook to update priceUpdatedAt if price changed
deliveryFeeSchema.pre('save', function(next) {
  if (this.isModified('price') && this.price !== this.previousPrice) {
    this.previousPrice = this.price
    this.priceUpdatedAt = new Date()
  }
  next()
})

export default mongoose.model('DeliveryFee', deliveryFeeSchema)
