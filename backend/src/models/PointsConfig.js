import mongoose from 'mongoose'

const pointsConfigSchema = new mongoose.Schema(
  {
    config_key: {
      type: String,
      required: true,
      unique: true,
      index: true,
      enum: [
        'points_conversion_rate',
        'points_expiry_days',
        'allow_stacking_with_coupons',
        'system_enabled',
        'min_points_per_transaction'
      ]
    },
    value: {
      type: mongoose.Schema.Types.Mixed,
      required: true
    },
    description: {
      type: String,
      default: ''
    },
    data_type: {
      type: String,
      enum: ['number', 'boolean', 'string', 'array'],
      default: 'string'
    }
  },
  {
    timestamps: true
  }
)

export default mongoose.model('PointsConfig', pointsConfigSchema)
