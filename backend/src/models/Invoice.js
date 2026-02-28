import mongoose from 'mongoose'

const invoiceItemSchema = new mongoose.Schema({
  product: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product',
    required: true
  },
  productName: {
    type: String,
    required: true,
    trim: true
  },
  sku: {
    type: String,
    trim: true
  },
  variation: {
    size: String,
    color: String
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
  }
}, {
  _id: true
})

const invoiceSchema = new mongoose.Schema({
  // Invoice number (unique, human-readable)
  invoiceNumber: {
    type: String,
    unique: true,
    required: true,
    index: true,
    // Format: INV-2024-0001, INV-2024-0002, etc.
    trim: true
  },

  // Reference to order
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order',
    required: true,
    index: true
  },

  // Reference to customer
  customer: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },

  // Business Details
  business: {
    name: {
      type: String,
      default: 'Erica Spanks'
    },
    logo: {
      type: String,
      default: null // URL to logo image
    },
    address: {
      type: String,
      default: ''
    },
    phone: {
      type: String,
      default: ''
    },
    email: {
      type: String,
      default: 'info@ericaspanks.com'
    },
    website: {
      type: String,
      default: 'https://ericaspanks.com'
    },
    taxId: {
      type: String,
      default: null // VAT/Tax ID
    }
  },

  // Customer Billing Details
  billingDetails: {
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
    email: {
      type: String,
      required: true,
      lowercase: true
    },
    phone: {
      type: String,
      trim: true
    },
    address: {
      type: String,
      required: true,
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
      trim: true
    }
  },

  // Order Breakdown
  items: [invoiceItemSchema],

  subtotal: {
    type: Number,
    required: true,
    min: 0
  },

  discount: {
    type: Number,
    default: 0,
    min: 0
  },

  discountDescription: {
    type: String,
    default: null
  },

  tax: {
    type: Number,
    default: 0,
    min: 0
  },

  taxRate: {
    type: Number,
    default: 0, // e.g., 7.5 for 7.5%
    min: 0
  },

  shippingFee: {
    type: Number,
    default: 0,
    min: 0
  },

  shippingMethod: {
    type: String,
    enum: ['delivery', 'pickup'],
    default: 'delivery'
  },

  shippingAddress: {
    area: String,
    zone: String,
    fullAddress: String
  },

  total: {
    type: Number,
    required: true,
    min: 0
  },

  currency: {
    type: String,
    default: 'NGN',
    uppercase: true
  },

  // Payment Info
  paymentMethod: {
    type: String,
    enum: ['paystack', 'stripe', 'transfer', 'cash', 'card'],
    default: 'paystack'
  },

  paymentStatus: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending'
  },

  transactionId: {
    type: String,
    trim: true,
    default: null
  },

  // Additional Notes
  notes: {
    type: String,
    trim: true,
    default: null
  },

  terms: {
    type: String,
    default: 'Thank you for your purchase!'
  },

  // File URLs
  pdfUrl: {
    type: String,
    default: null
  },

  // Status
  status: {
    type: String,
    enum: ['draft', 'sent', 'viewed', 'paid', 'cancelled'],
    default: 'draft',
    index: true
  },

  sentAt: {
    type: Date,
    default: null
  },

  viewedAt: {
    type: Date,
    default: null
  },

  // Timestamps
  createdAt: {
    type: Date,
    default: Date.now,
    index: true
  },

  updatedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
})

// Auto-populate references
invoiceSchema.pre('findOne', function() {
  this.populate('order customer')
})

invoiceSchema.pre('findOneAndUpdate', function() {
  this.populate('order customer')
})

export default mongoose.model('Invoice', invoiceSchema)
