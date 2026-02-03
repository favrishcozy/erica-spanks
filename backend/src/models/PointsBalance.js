import mongoose from 'mongoose'

const pointsBalanceSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true
    },
    current_balance: {
      type: Number,
      default: 0,
      min: 0
    },
    total_earned: {
      type: Number,
      default: 0,
      min: 0
    },
    total_redeemed: {
      type: Number,
      default: 0,
      min: 0
    },
    is_frozen: {
      type: Boolean,
      default: false,
      index: true
    },
    freeze_reason: {
      type: String,
      default: null
    },
    frozen_at: {
      type: Date,
      default: null
    }
  },
  {
    timestamps: true
  }
)

// Index for efficient queries
pointsBalanceSchema.index({ userId: 1, current_balance: 1 })
pointsBalanceSchema.index({ is_frozen: 1 })

export default mongoose.model('PointsBalance', pointsBalanceSchema)
