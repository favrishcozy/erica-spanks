import mongoose from 'mongoose'
import dotenv from 'dotenv'
import User from './src/models/User.js'
import { generateToken } from './src/utils/jwt.js'

dotenv.config()

const run = async () => {
  await mongoose.connect(process.env.MONGODB_URI)
  const admin = await User.findOne({ email: process.env.ADMIN_EMAIL })
  if (!admin) {
    console.error('Admin user not found')
    process.exit(1)
  }
  const token = generateToken(admin._id)
  console.log(token)
  process.exit(0)
}

run()
