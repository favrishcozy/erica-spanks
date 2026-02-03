import User from './src/models/User.js'
import Product from './src/models/Product.js'
import Order from './src/models/Order.js'
import mongoose from 'mongoose'
import dotenv from 'dotenv'

dotenv.config()

const testAdmin = async () => {
  try {
    console.log('Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('✓ Connected to MongoDB')
    
    console.log('Testing model operations...')
    
    const userCount = await User.countDocuments()
    console.log(`✓ Users: ${userCount}`)
    
    const productCount = await Product.countDocuments()
    console.log(`✓ Products: ${productCount}`)
    
    const orderCount = await Order.countDocuments()
    console.log(`✓ Orders: ${orderCount}`)
    
    const confirmedOrders = await Order.find({ status: 'confirmed' }).lean()
    console.log(`✓ Confirmed orders: ${confirmedOrders.length}`)
    
    const revenue = confirmedOrders.reduce((sum, order) => sum + (order?.pricing?.total || 0), 0)
    console.log(`✓ Total revenue: ${revenue}`)
    
    const recentOrders = await Order.find()
      .populate('user', 'firstName lastName email')
      .sort({ createdAt: -1 })
      .limit(5)
    console.log(`✓ Recent orders: ${recentOrders.length}`)
    
    console.log('\n✓ All tests passed!')
    process.exit(0)
  } catch (error) {
    console.error('✗ Error:', error.message)
    console.error(error.stack)
    process.exit(1)
  }
}

testAdmin()
