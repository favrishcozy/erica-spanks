import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './src/models/User.js'

dotenv.config()

const MONGODB_URI = process.env.MONGODB_URI || process.env.DATABASE_URL || ''

if (!MONGODB_URI) {
  console.error('MONGODB_URI not set.')
  process.exit(1)
}

const deleteAndReseed = async () => {
  try {
    await mongoose.connect(MONGODB_URI)
    console.log('✅ Connected to MongoDB')

    // Delete the existing admin user
    const result = await User.deleteOne({ email: 'admin@ericaspanks.com' })
    console.log(`🗑️ Deleted admin user. Matched: ${result.deletedCount}`)

    // Create fresh admin user with plain password
    const newAdmin = new User({
      firstName: 'Admin',
      lastName: 'User',
      email: 'admin@ericaspanks.com',
      password: 'erica123',  // Plain password - pre-save hook will hash it
      role: 'admin',
      isVerified: true,
      isActive: true
    })

    await newAdmin.save()
    console.log('✅ Created fresh admin user')

    // Fetch it back with password and verify
    const verify = await User.findOne({ email: 'admin@ericaspanks.com' }).select('+password')
    console.log('✅ Fetched user from DB')
    
    const matches = await verify.comparePassword('erica123')
    console.log(`✅ Password verification: ${matches ? 'PASS ✓' : 'FAIL ✗'}`)

    if (matches) {
      console.log('\n✅ Admin user ready to login!')
      console.log('Email: admin@ericaspanks.com')
      console.log('Password: erica123')
    } else {
      console.log('\n❌ Password still not matching. Something is wrong with the pre-save hook.')
    }

  } catch (err) {
    console.error('❌ Error:', err.message)
  } finally {
    try { await mongoose.connection.close() } catch (e) {}
    console.log('\n🔌 Connection closed')
  }
}

deleteAndReseed()
