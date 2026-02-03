import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

import PointsConfig from '../src/models/PointsConfig.js'
import RedemptionTier from '../src/models/RedemptionTier.js'
import PointsBalance from '../src/models/PointsBalance.js'
import PointsTransaction from '../src/models/PointsTransaction.js'
import User from '../src/models/User.js'

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/erica-spanks'

const configs = [
  { config_key: 'points_conversion_rate', value: 500, data_type: 'number', description: 'Amount in ₦ that equals 1 point' },
  { config_key: 'points_expiry_days', value: 180, data_type: 'number', description: 'Days after which earned points expire' },
  { config_key: 'allow_stacking_with_coupons', value: false, data_type: 'boolean', description: 'Whether points can be combined with coupon codes' },
  { config_key: 'system_enabled', value: true, data_type: 'boolean', description: 'Enable or disable the entire points system' },
  { config_key: 'min_points_per_transaction', value: 100, data_type: 'number', description: 'Minimum order amount (₦) to earn points' }
]

const tiers = [
  {
    name: 'Tier 1',
    points_required: 200,
    discount_value: 2000,
    discount_type: 'fixed',
    minimum_order_value: 5000,
    maximum_redemptions_per_user_per_month: 0,
    applicable_on_discounted_items: true,
    is_active: true,
    tier_rank: 1,
    description: '₦2,000 off for 200 points'
  },
  {
    name: 'Tier 2',
    points_required: 500,
    discount_value: 6000,
    discount_type: 'fixed',
    minimum_order_value: 10000,
    maximum_redemptions_per_user_per_month: 0,
    applicable_on_discounted_items: true,
    is_active: true,
    tier_rank: 2,
    description: '₦6,000 off for 500 points'
  },
  {
    name: 'Tier 3',
    points_required: 1000,
    discount_value: 15,
    discount_type: 'percentage',
    minimum_order_value: 15000,
    maximum_redemptions_per_user_per_month: 2,
    applicable_on_discounted_items: true,
    is_active: true,
    tier_rank: 3,
    description: '15% off for 1,000 points'
  },
  {
    name: 'Tier 4',
    points_required: 2000,
    discount_value: 25,
    discount_type: 'percentage',
    minimum_order_value: 25000,
    maximum_redemptions_per_user_per_month: 1,
    applicable_on_discounted_items: true,
    is_active: true,
    tier_rank: 4,
    description: '25% off for 2,000 points'
  }
]

const demoUsers = [
  { firstName: 'Demo', lastName: 'User1', email: 'demo1@example.com', password: 'password' },
  { firstName: 'Demo', lastName: 'User2', email: 'demo2@example.com', password: 'password' }
]

async function upsertConfigs() {
  for (const cfg of configs) {
    await PointsConfig.updateOne(
      { config_key: cfg.config_key },
      { $set: cfg },
      { upsert: true }
    )
    console.log('Upserted config', cfg.config_key)
  }
}

async function upsertTiers() {
  for (const tier of tiers) {
    await RedemptionTier.findOneAndUpdate(
      { points_required: tier.points_required },
      { $set: tier },
      { upsert: true, new: true }
    )
    console.log('Upserted tier', tier.name)
  }
}

async function createDemoUsersAndBalances() {
  for (const u of demoUsers) {
    let user = await User.findOne({ email: u.email }).exec()
    if (!user) {
      user = await User.create(u)
      console.log('Created demo user', u.email)
    } else {
      console.log('Demo user exists', u.email)
    }

    // Ensure a PointsBalance exists
    let balance = await PointsBalance.findOne({ userId: user._id }).exec()
    if (!balance) {
      balance = await PointsBalance.create({ userId: user._id, current_balance: 500, total_earned: 500, total_redeemed: 0 })
      console.log('Created PointsBalance for', u.email)

      // Create a sample transaction
      await PointsTransaction.create({
        userId: user._id,
        type: 'earned',
        amount: 500,
        reason: 'Demo: initial points',
        orderId: null,
        expiry_date: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000),
        metadata: { demo: true }
      })
      console.log('Created demo PointsTransaction for', u.email)
    } else {
      console.log('PointsBalance exists for', u.email)
    }
  }
}

async function main() {
  try {
    console.log('Connecting to', MONGODB_URI)
    await mongoose.connect(MONGODB_URI, { useNewUrlParser: true, useUnifiedTopology: true })
    console.log('Connected')

    await upsertConfigs()
    await upsertTiers()
    await createDemoUsersAndBalances()

    console.log('Seeding complete')
  } catch (err) {
    console.error('Seeding failed', err)
    process.exitCode = 1
  } finally {
    await mongoose.disconnect()
    console.log('Disconnected')
  }
}

main()
