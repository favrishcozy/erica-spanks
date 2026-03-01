/**
 * Reset Admin Account
 * Removes existing admin and creates new one with fresh credentials
 */

import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './src/models/User.js'

dotenv.config()

const resetAdmin = async () => {
  try {
    console.log('🔄 Connecting to MongoDB...')
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/erica-spanks')
    console.log('✅ Connected to MongoDB')

    // Delete any existing admin users
    const deleteResult = await User.deleteMany({ role: 'admin' })
    console.log(`🗑️  Deleted ${deleteResult.deletedCount} existing admin user(s)`)

    // Create new admin with fresh credentials
    const newAdmin = new User({
      firstName: 'AYILE',
      lastName: 'YEBOVI',
      email: 'hello@ericaspanks.com',
      password: '09027ES4581',
      role: 'admin',
      isVerified: true,
      isActive: true
    })
    
    await newAdmin.save()
    console.log('✅ Created new admin user: hello@ericaspanks.com')

    // Verify password
    const verify = await User.findOne({ email: 'hello@ericaspanks.com' }).select('+password')
    const matches = await verify.comparePassword('09027ES4581')
    console.log(`✅ Password verification: ${matches ? 'PASS ✓' : 'FAIL ✗'}`)

    console.log('\n📋 Admin Account Details:')
    console.log(`   Name: AYILE YEBOVI`)
    console.log(`   Email: hello@ericaspanks.com`)
    console.log(`   Password: 09027ES4581`)
    console.log(`   Role: admin`)

    process.exit(0)
  } catch (error) {
    console.error('❌ Error resetting admin:', error.message)
    process.exit(1)
  }
}

resetAdmin()
