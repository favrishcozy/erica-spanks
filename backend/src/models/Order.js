import mongoose from 'mongoose'

const orderItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  variation: {
    size: {
      type: String,
      required: true
    },
    color: {
      type: String,
      required: true
    },
    sku: {
      type: String,
      required: true
    }
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  unitPrice: {
    type: Number,
    required: true,
    min: 0
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0
  },
  // Snapshot of product info at time of order
  productSnapshot: {
    name: String,
    image: String,
    description: String
  }
}, {
  _id: true
})

const shippingAddressSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
    trim: true
  },
  lastName: {
    type: String,
    required: true,
    trim: true
  },
  company: {
    type: String,
    trim: true
  },
  address1: {
    type: String,
    required: true,
    trim: true
  },
  address2: {
    type: String,
    trim: true
  },
  city: {
    type: String,
    required: true,
    trim: true
  },
  state: {
    type: String,
    required: true,
    trim: true
  },
  zipCode: {
    type: String,
    required: true,
    trim: true
  },
  country: {
    type: String,
    required: true,
    default: 'US',
    trim: true
  },
  phone: {
    type: String,
    trim: true
  }
}, {
  _id: false
})

const paymentInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    enum: ['stripe', 'paypal', 'apple_pay', 'google_pay', 'card', 'paystack', 'bank', 'cash'],
    required: true
  },
  transactionId: {
    type: String,
    required: true
  },
  paymentIntentId: String,
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'partially_refunded'],
    default: 'pending'
  },
  amountPaid: {
    type: Number,
    required: true,
    min: 0
  },
  currency: {
    type: String,
    default: 'USD',
    uppercase: true
  },
  paymentDate: {
    type: Date,
    default: Date.now
  },
  refunds: [{
    amount: {
      type: Number,
      required: true,
      min: 0
    },
    reason: {
      type: String,
      required: true,
      trim: true
    },
    refundId: {
      type: String,
      required: true
    },
    processedAt: {
      type: Date,
      default: Date.now
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }]
}, {
  _id: false
})

const shippingInfoSchema = new mongoose.Schema({
  method: {
    type: String,
    required: true,
    enum: ['standard', 'express', 'overnight', 'free']
  },
  carrier: {
    type: String,
    enum: ['usps', 'ups', 'fedex', 'dhl']
  },
  cost: {
    type: Number,
    required: true,
    min: 0
  },
  estimatedDelivery: {
    min: {
      type: Number,
      required: true
    },
    max: {
      type: Number,
      required: true
    }
  },
  trackingNumber: String,
  trackingUrl: String,
  shippedAt: Date,
  deliveredAt: Date
}, {
  _id: false
})

const orderSchema = new mongoose.Schema({
  orderNumber: {
    type: String,
    unique: true
  },
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  items: [orderItemSchema],
  status: {
    type: String,
    enum: [
      'pending',
      'confirmed', 
      'processing',
      'shipped',
      'out_for_delivery',
      'delivered',
      'cancelled',
      'refunded',
      'returned'
    ],
    default: 'pending'
  },
  statusHistory: [{
    status: {
      type: String,
      required: true
    },
    updatedAt: {
      type: Date,
      default: Date.now
    },
    updatedBy: {
      type: String,
      required: true
    },
    note: String
  }],
  shippingAddress: shippingAddressSchema,
  billingAddress: shippingAddressSchema,
  paymentInfo: paymentInfoSchema,
  shippingInfo: shippingInfoSchema,
  pricing: {
    subtotal: {
      type: Number,
      required: true,
      min: 0
    },
    shippingCost: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    discount: {
      type: Number,
      min: 0,
      default: 0
    },
    total: {
      type: Number,
      required: true,
      min: 0
    }
  },
  coupon: {
    code: String,
    description: String,
    discountType: {
      type: String,
      enum: ['percentage', 'fixed']
    },
    discountValue: Number
  },
  pointsRedemption: {
    reservation_id: mongoose.Schema.Types.ObjectId,
    points_redeemed: {
      type: Number,
      min: 0
    },
    discount_applied: {
      type: Boolean,
      default: false
    },
    appliedAt: Date
  },
  pointsAwarded: {
    type: Boolean,
    default: false
  },
  pointsEarned: {
    type: Number,
    min: 0,
    default: 0
  },
  notes: {
    customer: {
      type: String,
      trim: true,
      maxlength: 500
    },
    internal: {
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  communication: [{
    type: {
      type: String,
      enum: ['email', 'sms', 'internal'],
      required: true
    },
    subject: String,
    message: {
      type: String,
      required: true
    },
    sentAt: {
      type: Date,
      default: Date.now
    },
    sentBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  }],
  fulfillment: {
    packingSlip: Boolean,
    giftMessage: String,
    specialInstructions: String
  },
  customerService: {
    priority: {
      type: String,
      enum: ['low', 'normal', 'high', 'urgent'],
      default: 'normal'
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    tags: [String]
  },

  // Delivery/Shipping Information (Lagos Delivery System)
  deliveryMethod: {
    type: String,
    enum: ['delivery', 'pickup'],
    default: 'delivery'
  },

  deliveryArea: {
    type: String,
    trim: true,
    default: null
  },

  deliveryZone: {
    type: String,
    enum: [
      'MAINLAND_A', 'MAINLAND_B', 'MAINLAND_C', 'MAINLAND_D',
      'MAINLAND_E', 'MAINLAND_F', 'MAINLAND_G',
      'ISLAND_A', 'ISLAND_B', 'ISLAND_C',
      null
    ],
    default: null
  },

  deliveryFee: {
    type: Number,
    default: 0,
    min: 0
  },

  // Reference to generated invoice
  invoice: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invoice',
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
})

// Virtuals
orderSchema.virtual('orderId').get(function() {
  // Return the order number as orderId for frontend compatibility
  return this.orderNumber || this._id.toString()
})

orderSchema.virtual('totalItems').get(function() {
  try {
    return this.items ? this.items.reduce((total, item) => total + (item.quantity || 0), 0) : 0
  } catch (err) {
    console.warn('Error in totalItems virtual:', err.message)
    return 0
  }
})

orderSchema.virtual('canBeCancelled').get(function() {
  return ['pending', 'confirmed'].includes(this.status)
})

orderSchema.virtual('canBeReturned').get(function() {
  try {
    if (this.status !== 'delivered') return false
    if (!this.deliveredAt) return false
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000
    return (Date.now() - this.deliveredAt.getTime()) < thirtyDaysMs
  } catch (err) {
    console.warn('Error in canBeReturned virtual:', err.message)
    return false
  }
})

orderSchema.virtual('isOverdue').get(function() {
  try {
    if (!this.shippingInfo || !this.shippingInfo.estimatedDelivery || !this.shippingInfo.estimatedDelivery.max || this.status === 'delivered') {
      return false
    }
    const maxDeliveryDate = new Date(this.createdAt)
    maxDeliveryDate.setDate(maxDeliveryDate.getDate() + this.shippingInfo.estimatedDelivery.max)
    return Date.now() > maxDeliveryDate.getTime()
  } catch (err) {
    console.warn('Error in isOverdue virtual:', err.message)
    return false
  }
})

// Indexes
orderSchema.index({ orderNumber: 1 })
orderSchema.index({ user: 1, createdAt: -1 })
orderSchema.index({ status: 1 })
orderSchema.index({ createdAt: -1 })
orderSchema.index({ 'paymentInfo.transactionId': 1 })
orderSchema.index({ 'shippingInfo.trackingNumber': 1 })

// Pre-save middleware to generate order number
orderSchema.pre('save', function(next) {
  if (!this.orderNumber) {
    const timestamp = Date.now().toString()
    const random = Math.random().toString(36).substring(2, 8).toUpperCase()
    this.orderNumber = `ES-${timestamp.slice(-6)}${random}`
  }
  
  // Add status to history if status changed
  if (this.isModified('status') && !this.isNew) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date()
    })
  }
  
  next()
})

// Calculate totals
orderSchema.methods.calculateTotals = function() {
  this.pricing.subtotal = this.items.reduce((sum, item) => sum + item.totalPrice, 0)
  this.pricing.total = this.pricing.subtotal + this.pricing.shippingCost + this.pricing.tax - this.pricing.discount
  return this.save()
}

// Update status
orderSchema.methods.updateStatus = function(newStatus, note, updatedBy) {
  this.status = newStatus
  this.statusHistory.push({
    status: newStatus,
    timestamp: new Date(),
    note,
    updatedBy
  })
  return this.save()
}

// Add communication
orderSchema.methods.addCommunication = function(type, subject, message, sentBy) {
  this.communication.push({
    type,
    subject,
    message,
    sentBy
  })
  return this.save()
}

// Check if order can be modified
orderSchema.methods.canBeModified = function() {
  return ['pending', 'confirmed'].includes(this.status)
}

// Calculate refund amount
orderSchema.methods.calculateRefundableAmount = function() {
  const totalRefunded = this.paymentInfo.refunds.reduce((sum, refund) => sum + refund.amount, 0)
  return this.pricing.total - totalRefunded
}

export default mongoose.model('Order', orderSchema)
