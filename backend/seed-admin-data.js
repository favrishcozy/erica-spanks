import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './src/models/User.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || ''
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'hello@ericaspanks.com'
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '09027ES4581'
const ADMIN_FIRST = process.env.ADMIN_FIRST || 'AYILE'
const ADMIN_LAST = process.env.ADMIN_LAST || 'YEBOVI'

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set. Set it in your environment before running this script.')
  process.exit(1)
}

const connectDB = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')
  } catch (err) {
    console.error('❌ MongoDB connection error', err)
    process.exit(1)
  }
}

const seedAdmin = async () => {
  await connectDB()

  try {
    // Check if admin user already exists
    let admin = await User.findOne({ email: ADMIN_EMAIL })

    if (admin) {
      console.log(`⚠️ Admin user ${ADMIN_EMAIL} already exists. Updating role and credentials.`)
      admin.firstName = ADMIN_FIRST
      admin.lastName = ADMIN_LAST
      admin.role = 'admin'
      admin.isActive = true
      admin.isVerified = true
      // Pass plain password; pre-save hook will hash it
      admin.password = ADMIN_PASSWORD
      await admin.save()
      console.log(`✅ Updated existing admin user: ${ADMIN_EMAIL}`)
      
      // Verify password was saved by fetching with password
      const verify = await User.findOne({ email: ADMIN_EMAIL }).select('+password')
      console.log(`🔍 Password stored (first 20 chars): ${verify.password.substring(0, 20)}...`)
      const matches = await verify.comparePassword(ADMIN_PASSWORD)
      console.log(`✅ Password verification test: ${matches ? 'PASS' : 'FAIL'}`)
    } else {
      const newAdmin = new User({
        firstName: ADMIN_FIRST,
        lastName: ADMIN_LAST,
        email: ADMIN_EMAIL,
        password: ADMIN_PASSWORD,
        role: 'admin',
        isVerified: true,
        isActive: true
      })
      await newAdmin.save()
      console.log(`✅ Created new admin user: ${ADMIN_EMAIL}`)
      
      // Verify password was saved by fetching with password
      const verify = await User.findOne({ email: ADMIN_EMAIL }).select('+password')
      console.log(`🔍 Password stored (first 20 chars): ${verify.password.substring(0, 20)}...`)
      const matches = await verify.comparePassword(ADMIN_PASSWORD)
      console.log(`✅ Password verification test: ${matches ? 'PASS' : 'FAIL'}`)
    }
  } catch (err) {
    console.error('❌ Error seeding admin user', err)
  } finally {
    try { await mongoose.connection.close() } catch (e) {}
    console.log('🔌 MongoDB connection closed')
  }
}

seedAdmin()
