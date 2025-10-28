import dotenv from 'dotenv'
import mongoose from 'mongoose'
import Product from './src/models/Product.js'
import path from 'path'

dotenv.config({ path: path.resolve(process.cwd(), './.env') })

const run = async () => {
  if (!process.env.MONGODB_URI) {
    console.error('MONGODB_URI not set')
    process.exit(1)
  }
  await mongoose.connect(process.env.MONGODB_URI)
  const products = await Product.find().limit(5).lean()
  console.log('First products (count:', products.length, ')')
  products.forEach((p, i) => {
    console.log(`--- Product ${i+1} ---`)
    console.log('name:', p.name)
    console.log('slug:', p.slug)
    console.log('media:', p.media && p.media.slice(0,3))
    console.log('variations:', p.variations && p.variations.slice(0,2).map(v => ({ size: v.size, color: v.color, sku: v.sku, price: v.price })))
  })
  await mongoose.connection.close()
}

run().catch(err => { console.error(err); process.exit(1) })
