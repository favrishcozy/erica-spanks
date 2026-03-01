/**
 * Clear Test Data
 * Removes all test users, orders, and products from the database
 * Keeps: Categories, Occasions, Points Config, Settings, etc.
 * 
 * Usage: node backend/clear-test-data.js
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const clearTestData = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erica-spanks', {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    console.log('✅ Connected to MongoDB')

    // Import models
    const { default: User } = await import('./src/models/User.js')
    const { default: Product } = await import('./src/models/Product.js')
    const { default: Order } = await import('./src/models/Order.js')
    const { default: StockReservation } = await import('./src/models/StockReservation.js')
    const { default: PointsBalance } = await import('./src/models/PointsBalance.js')
    const { default: PointsTransaction } = await import('./src/models/PointsTransaction.js')
    const { default: Invoice } = await import('./src/models/Invoice.js')

    console.log('\n🗑️  Clearing test data...\n')

    // Clear products (and their stock reservations will cascade)
    const productsDeleted = await Product.deleteMany({})
    console.log(`📦 Products deleted: ${productsDeleted.deletedCount}`)

    // Clear stock reservations
    const reservationsDeleted = await StockReservation.deleteMany({})
    console.log(`📋 Stock reservations deleted: ${reservationsDeleted.deletedCount}`)

    // Clear orders
    const ordersDeleted = await Order.deleteMany({})
    console.log(`🛒 Orders deleted: ${ordersDeleted.deletedCount}`)

    // Clear invoices
    const invoicesDeleted = await Invoice.deleteMany({})
    console.log(`📄 Invoices deleted: ${invoicesDeleted.deletedCount}`)

    // Clear non-admin users and their related data
    const adminUser = await User.findOne({ role: 'admin' })
    
    if (adminUser) {
      // Delete all non-admin users
      const usersDeleted = await User.deleteMany({ role: { $ne: 'admin' } })
      console.log(`👥 Non-admin users deleted: ${usersDeleted.deletedCount}`)

      // Delete points data for non-admin users
      const pointsBalancesDeleted = await PointsBalance.deleteMany({ 
        user: { $ne: adminUser._id } 
      })
      console.log(`💰 Points balances deleted: ${pointsBalancesDeleted.deletedCount}`)

      const pointsTransactionsDeleted = await PointsTransaction.deleteMany({
        user: { $ne: adminUser._id }
      })
      console.log(`💸 Points transactions deleted: ${pointsTransactionsDeleted.deletedCount}`)
    } else {
      // No admin user found, delete all users
      const usersDeleted = await User.deleteMany({})
      console.log(`👥 All users deleted: ${usersDeleted.deletedCount}`)

      const pointsBalancesDeleted = await PointsBalance.deleteMany({})
      console.log(`💰 Points balances deleted: ${pointsBalancesDeleted.deletedCount}`)

      const pointsTransactionsDeleted = await PointsTransaction.deleteMany({})
      console.log(`💸 Points transactions deleted: ${pointsTransactionsDeleted.deletedCount}`)
    }

    // Verify remaining data
    console.log('\n📊 Remaining data:')
    const userCount = await User.countDocuments({})
    const productCount = await Product.countDocuments({})
    const orderCount = await Order.countDocuments({})
    
    console.log(`   Users: ${userCount}`)
    console.log(`   Products: ${productCount}`)
    console.log(`   Orders: ${orderCount}`)

    console.log('\n✨ Test data cleared successfully!')
    console.log('💡 Next step: Run seed-admin-data.js to create fresh admin account')

    process.exit(0)
  } catch (error) {
    console.error('❌ Error clearing test data:', error.message)
    process.exit(1)
  }
}

clearTestData()
