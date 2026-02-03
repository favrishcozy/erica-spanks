import mongoose from 'mongoose'

const redemptionTierSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
      index: true
    },
    points_required: {
      type: Number,
      required: true,
      min: 1,
      unique: true,
      index: true
    },
    discount_value: {
      type: Number,
      required: true,
      min: 0
    },
    discount_type: {
      type: String,
      enum: ['fixed', 'percentage'],
      default: 'fixed'
    },
    minimum_order_value: {
      type: Number,
      required: true,
      min: 0,
      description: 'Minimum cart subtotal required to redeem this tier'
    },
    maximum_redemptions_per_user_per_month: {
      type: Number,
      default: 1,
      min: 0,
      description: '0 = unlimited'
    },
    applicable_on_discounted_items: {
      type: Boolean,
      default: false,
      description: 'Whether points can be redeemed if cart already has discounts'
    },
    is_active: {
      type: Boolean,
      default: true,
      index: true
    },
    tier_rank: {
      type: Number,
      required: true,
      unique: true,
      index: true,
      description: 'Lower rank = better value (shown first)'
    },
    description: {
      type: String,
      default: ''
    }
  },
  {
    timestamps: true
  }
)

redemptionTierSchema.index({ is_active: 1, tier_rank: 1 })

export default mongoose.model('RedemptionTier', redemptionTierSchema)
