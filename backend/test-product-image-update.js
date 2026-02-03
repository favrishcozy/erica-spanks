import mongoose from 'mongoose'
import dotenv from 'dotenv'
import Product from './src/models/Product.js'

dotenv.config()

const productId = process.argv[2] || '695f782460fb0da0bea0a2a4'
const imageUrl = process.argv[3] || 'https://res.cloudinary.com/dtnyez4fk/image/upload/v1767864563/erica-spanks/test/occtw4pz7rtina07mody.png'

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI)
    console.log('Connected to DB')

    const product = await Product.findById(productId)
    if (!product) {
      console.error('Product not found')
      process.exit(1)
    }

    if (!product.media) product.media = []
    product.media.unshift(imageUrl)

    if (product.variations && product.variations.length > 0) {
      if (!product.variations[0].images) product.variations[0].images = []
      product.variations[0].images.unshift({ url: imageUrl, alt: product.name, isPrimary: true })
    }

    await product.save()
    console.log('Product updated successfully')
    process.exit(0)
  } catch (err) {
    console.error('Update failed:', err)
    if (err && err.errors) console.error('Validation errors:', err.errors)
    process.exit(1)
  }
}

run()
