import mongoose from 'mongoose'
import dotenv from 'dotenv'
import bcrypt from 'bcryptjs'
import User from './src/models/User.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || ''
const ADMIN_EMAIL = 'admin@ericaspanks.com'
const TEST_PASSWORD = 'erica123'

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set.')
  process.exit(1)
}

const diagnose = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Fetch the admin user with password
    const admin = await User.findOne({ email: ADMIN_EMAIL }).select('+password')
    
    if (!admin) {
      console.log('❌ Admin user not found')
      process.exit(1)
    }

    console.log('\n=== DIAGNOSTIC INFO ===')
    console.log('Email:', admin.email)
    console.log('First Name:', admin.firstName)
    console.log('Role:', admin.role)
    console.log('Is Active:', admin.isActive)
    console.log('Stored Password Hash:', admin.password)
    console.log('Hash Length:', admin.password.length)
    
    // Test password comparison
    console.log('\n=== PASSWORD TEST ===')
    console.log('Testing password:', TEST_PASSWORD)
    
    try {
      const matches = await admin.comparePassword(TEST_PASSWORD)
      console.log('Does password match?', matches)
    } catch (err) {
      console.error('Error during password comparison:', err)
    }

    // Manual bcrypt test
    console.log('\n=== MANUAL BCRYPT TEST ===')
    try {
      const manualMatch = await bcrypt.compare(TEST_PASSWORD, admin.password)
      console.log('Manual bcrypt.compare result:', manualMatch)
    } catch (err) {
      console.error('Manual bcrypt error:', err.message)
    }

    // Try hashing the test password and comparing
    console.log('\n=== HASH INSPECTION ===')
    const newHash = await bcrypt.hash(TEST_PASSWORD, 12)
    console.log('Fresh hash of test password:', newHash)
    const freshMatch = await bcrypt.compare(TEST_PASSWORD, newHash)
    console.log('Fresh hash matches test password?', freshMatch)

  } catch (err) {
    console.error('❌ Error:', err)
  } finally {
    try { await mongoose.connection.close() } catch (e) {}
    console.log('\n🔌 Connection closed')
  }
}

diagnose()
