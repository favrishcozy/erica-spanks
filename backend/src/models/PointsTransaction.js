import mongoose from 'mongoose'

const pointsTransactionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true
    },
    type: {
      type: String,
      enum: ['earned', 'redeemed', 'refunded', 'expired', 'admin_adjustment', 'reversal'],
      required: true,
      index: true
    },
    amount: {
      type: Number,
      required: true
    },
    reason: {
      type: String,
      required: true
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      default: null,
      index: true
    },
    reference_id: {
      type: String,
      default: null
    },
    // For earned/redeemed: track expiry
    expiry_date: {
      type: Date,
      default: null,
      index: true
    },
    // For reversal: track original transaction
    reversed_transaction_id: {
      type: mongoose.Schema.Types.ObjectId,
      default: null
    },
    // Admin notes
    admin_notes: {
      type: String,
      default: null
    },
    admin_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      default: null
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {}
    }
  },
  {
    timestamps: true
  }
)

// Indexes for efficient querying
pointsTransactionSchema.index({ userId: 1, createdAt: -1 })
pointsTransactionSchema.index({ userId: 1, type: 1 })
pointsTransactionSchema.index({ orderId: 1 })
pointsTransactionSchema.index({ expiry_date: 1 })
pointsTransactionSchema.index({ type: 1, createdAt: -1 })

export default mongoose.model('PointsTransaction', pointsTransactionSchema)
