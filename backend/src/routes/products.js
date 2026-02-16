import express from 'express'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import Occasion from '../models/Occasion.js'
import { protect, admin, optionalAuth } from '../middleware/auth.js'
import { query, check, param, validationResult } from 'express-validator'
import mongoose from 'mongoose'
import { validateRequest } from '../middleware/validate.js'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import cloudinary from '../config/cloudinary.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure tmp upload directory exists
const uploadTmpDir = path.join(__dirname, '../../tmp/uploads')
if (!fs.existsSync(uploadTmpDir)) {
  fs.mkdirSync(uploadTmpDir, { recursive: true })
}

// Multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadTmpDir),
  filename: (req, file, cb) => {
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, `${Date.now()}_${safeName}`)
  }
})

const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const uploadImage = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only images are allowed.'))
    }
    cb(null, true)
  }
})

// Helper: resolve category param (slug/name/ObjectId) to ObjectId string
const escapeRegExp = (str = '') => str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const resolveCategoryId = async (categoryParam) => {
  if (!categoryParam) return null

  // If it's already a valid ObjectId, return it
  if (mongoose.Types.ObjectId.isValid(categoryParam)) return categoryParam

  // Try slug match
  let cat = await Category.findOne({ slug: categoryParam }).select('_id').lean()
  if (cat && cat._id) return String(cat._id)

  // Try exact name match (case-insensitive)
  cat = await Category.findOne({ name: new RegExp(`^${escapeRegExp(categoryParam)}$`, 'i') }).select('_id').lean()
  if (cat && cat._id) return String(cat._id)

  return null
}

// Helper: resolve occasion param (slug/name/ObjectId) to ObjectId string
const resolveOccasionId = async (occasionParam) => {
  console.log(`[RESOLVE] Resolving occasion: ${occasionParam}`)
  
  if (!occasionParam) {
    console.log('[RESOLVE] Occasion param is null/empty')
    return null
  }

  // If it's already a valid ObjectId, return it
  if (mongoose.Types.ObjectId.isValid(occasionParam)) {
    console.log(`[RESOLVE] Occasion is already valid ObjectId: ${occasionParam}`)
    return occasionParam
  }

  // Try slug match
  console.log(`[RESOLVE] Trying slug match for: ${occasionParam}`)
  let occ = await Occasion.findOne({ slug: occasionParam }).select('_id').lean()
  if (occ && occ._id) {
    console.log(`[RESOLVE] Found occasion by slug: ${occ._id}`)
    return String(occ._id)
  }

  // Try exact name match (case-insensitive)
  console.log(`[RESOLVE] Trying name match for: ${occasionParam}`)
  occ = await Occasion.findOne({ name: new RegExp(`^${escapeRegExp(occasionParam)}$`, 'i') }).select('_id').lean()
  if (occ && occ._id) {
    console.log(`[RESOLVE] Found occasion by name: ${occ._id}`)
    return String(occ._id)
  }

  // Debug: Check what occasions exist in the database
  console.log('[RESOLVE] Checking all occasions in database...')
  const allOccasions = await Occasion.find({}).select('name slug _id').lean()
  console.log('[RESOLVE] All occasions:', allOccasions.map(o => ({ name: o.name, slug: o.slug, _id: o._id })))
  
  console.log(`[RESOLVE] Occasion not found: ${occasionParam}`)
  return null
}

// IMPORTANT: Specific routes must come BEFORE parameterized routes like /:id
// Otherwise Express will match 'featured' as an :id parameter

// @desc    Get featured products (enhanced version)
// @route   GET /api/products/featured
// @access  Public (with optional auth for personalization)
router.get('/featured', optionalAuth, async (req, res) => {
  try {
    console.log('Fetching featured products...')
    
    // Find products where featured is true
    let featuredProducts = await Product.find({ 
      isFeatured: true,
      isActive: true,
      visibility: 'public'
    })
      .populate('category', 'name slug').populate('occasions', 'name slug')
      .limit(8)
      .sort({ createdAt: -1 })
      .lean()
    
    // If no featured products found, get some sample products as fallback
    if (featuredProducts.length === 0) {
      console.log('No featured products found, fetching sample products...')
      featuredProducts = await Product.find({ 
        isActive: true,
        visibility: 'public'
      })
        .populate('category', 'name slug').populate('occasions', 'name slug')
        .limit(4)
        .sort({ createdAt: -1 })
        .lean()
    }
    
    console.log(`Found ${featuredProducts.length} featured products`)
    
    // Personalize for authenticated users
    if (req.user) {
      console.log(`Personalizing featured products for user: ${req.user.email}`)
    }
    
    res.json({
      success: true,
      data: featuredProducts,
      count: featuredProducts.length
    })
    
  } catch (error) {
    console.error('Error fetching featured products:', error)
    res.status(500).json({
      success: false,
      error: 'Server error while fetching featured products'
    })
  }
})


// @desc    Upload product image(s)
// @route   POST /api/products/:id/upload-image
// @access  Private/Admin
router.post('/:id/upload-image', protect, admin, (req, res, next) => {
  // Accept any file field names (supports 'images' array, single 'image', or other names)
  uploadImage.any()(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('[UPLOAD] Multer error:', err.message)
      return res.status(400).json({ 
        success: false, 
        error: `Upload error: ${err.message}` 
      })
    } else if (err) {
      console.error('[UPLOAD] File upload error:', err.message)
      return res.status(400).json({ 
        success: false, 
        error: `File error: ${err.message}` 
      })
    }
    next()
  })
}, async (req, res) => {
  try {
    // Either req.files (multiple) or req.file (single) may contain uploads
    const files = (req.files && req.files.length ? req.files : (req.file ? [req.file] : []))
    if (!files || files.length === 0) {
      return res.status(400).json({ success: false, error: 'No image file(s) provided' })
    }

    // Verify product exists
    const product = await Product.findById(req.params.id)
    if (!product) {
      // cleanup any uploaded temp files
      for (const f of files) {
        try { fs.unlinkSync(f.path) } catch (e) {}
      }
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    const uploadedUrls = []

    // Validate Cloudinary configuration
    console.log('[UPLOAD] Cloudinary config check:')
    console.log('[UPLOAD] CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ set' : '✗ missing')
    console.log('[UPLOAD] API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ set' : '✗ missing')
    console.log('[UPLOAD] API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ set' : '✗ missing')

    // Upload to Cloudinary if configured
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const uploadOptsBase = {
          folder: `erica-spanks/${req.params.id}`,
          unique_filename: true,
          timeout: 60000
        }

        for (const f of files) {
          console.log('[UPLOAD] Uploading to Cloudinary:', f.path)
          let cloudinaryResult = null
          let lastError = null
          const maxRetries = 2

          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              console.log(`[UPLOAD] Attempt ${attempt} of ${maxRetries}`)
              cloudinaryResult = await cloudinary.uploader.upload(f.path, uploadOptsBase)
              break
            } catch (retryError) {
              lastError = retryError
              console.error(`[UPLOAD] Attempt ${attempt} failed:`, retryError?.message || retryError)
              if (attempt < maxRetries) {
                const waitTime = 1000 * Math.pow(2, attempt - 1)
                await new Promise(r => setTimeout(r, waitTime))
              }
            }
          }

          if (!cloudinaryResult) {
            throw lastError || new Error('Cloudinary upload failed after retries')
          }

          const imageUrl = cloudinaryResult.secure_url
          uploadedUrls.push({ url: imageUrl, filePath: f.path })
          console.log('[UPLOAD] Upload successful:', imageUrl)
          try { fs.unlinkSync(f.path) } catch (e) {}
        }
      } catch (cloudinaryError) {
        let errorMessage = 'Unknown error'
        if (cloudinaryError?.error?.message) {
          errorMessage = cloudinaryError.error.message
        } else if (cloudinaryError?.message) {
          errorMessage = cloudinaryError.message
        } else if (typeof cloudinaryError === 'string') {
          errorMessage = cloudinaryError
        }
        
        console.error('[UPLOAD] Cloudinary error:', errorMessage)
        for (const f of files) {
          try { fs.unlinkSync(f.path) } catch (e) {}
        }
        return res.status(500).json({ 
          success: false, 
          error: `Cloudinary upload failed: ${errorMessage}`
        })
      }
    } else {
      // Fallback to local path storage
      console.log('[UPLOAD] Cloudinary not configured, using local path')
      for (const f of files) {
        uploadedUrls.push({ url: `/uploads/${f.filename}`, filePath: f.path })
      }
    }

    // Attach each uploaded URL to product.media and to variation (if specified)
    if (!product.media) product.media = []
    const variationSku = req.body && req.body.variationSku ? String(req.body.variationSku).trim() : null

    for (const u of uploadedUrls) {
      const imageUrl = u.url
      product.media.unshift(imageUrl)

      if (variationSku && product.variations && product.variations.length > 0) {
        const vIndex = product.variations.findIndex(v => String(v.sku) === variationSku)
        if (vIndex !== -1) {
          if (!product.variations[vIndex].images) product.variations[vIndex].images = []
          product.variations[vIndex].images.unshift({ url: imageUrl, alt: product.name, isPrimary: true })
        } else {
          if (!product.variations[0].images) product.variations[0].images = []
          product.variations[0].images.unshift({ url: imageUrl, alt: product.name, isPrimary: true })
        }
      } else {
        if (product.variations && product.variations.length > 0) {
          if (!product.variations[0].images) product.variations[0].images = []
          product.variations[0].images.unshift({ url: imageUrl, alt: product.name, isPrimary: true })
        }
      }
    }

    await product.save()

    res.json({
      success: true,
      data: {
        productId: product._id,
        imageUrls: uploadedUrls.map(u => u.url),
        message: 'Images uploaded successfully'
      }
    })
  } catch (error) {
    if (req.files) {
      for (const f of req.files) {
        try { fs.unlinkSync(f.path) } catch (e) {}
      }
    }
    if (req.file) {
      try { fs.unlinkSync(req.file.path) } catch (e) {}
    }

    console.error('[UPLOAD] Error:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to upload images'
    })
  }
})

// Search products
// @route   GET /api/products/search
// @access  Public (with optional auth for personalization)
router.get('/', optionalAuth, 
  [
    query('q').optional(),
    query('category').optional().trim(),
    query('occasion').optional().trim(),
    query('minPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('maxPrice').optional().isFloat({ min: 0 }).toFloat(),
    query('size').optional().trim(),
    query('color').optional().trim(),
    query('sort').optional().isIn(['newest', 'price-asc', 'price-desc', 'rating', 'relevance']),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  async (req, res) => {
    const errors = validationResult(req)
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() })
    }

    try {
      const { q: searchTerm, category, occasion, minPrice, maxPrice, size, color, sort = 'relevance', page = 1, limit = 20 } = req.query
      let query = { isActive: true, visibility: 'public' }

      // Text search if query term provided
      if (searchTerm && searchTerm.trim()) {
        query.$text = { $search: searchTerm.trim() }
      }

      // Category filter
      if (category && category !== 'all') {
        const resolved = await resolveCategoryId(category)
        if (resolved) {
          query.category = resolved
        } else {
          query.tags = { $in: [category.toString().toLowerCase()] }
        }
      }

      // Occasion filter
      if (occasion && occasion !== 'all') {
        const resolved = await resolveOccasionId(occasion)
        if (resolved) {
          query.occasions = { $in: [resolved] }
        } else {
          query.tags = { $in: [occasion.toString().toLowerCase()] }
        }
      }

      // Price range filter
      if (minPrice || maxPrice) {
        query['variations.price'] = {}
        if (minPrice) query['variations.price'].$gte = parseFloat(minPrice)
        if (maxPrice) query['variations.price'].$lte = parseFloat(maxPrice)
      }

      // Size and color filters
      if (size) {
        query['variations.size'] = size
      }

      if (color) {
        query['variations.color'] = color
      }

      // Sort options
      let sortOptions = {}
      // 'relevance' (text score) only makes sense when a text search is performed
      if (sort === 'relevance') {
        if (query.$text) {
          sortOptions = { score: { $meta: 'textScore' } }
        } else {
          // No text search present — fallback to newest
          sortOptions = { createdAt: -1 }
        }
      } else {
        switch (sort) {
          case 'price-asc':
            sortOptions = { 'variations.price': 1 }
            break
          case 'price-desc':
            sortOptions = { 'variations.price': -1 }
            break
          case 'newest':
            sortOptions = { createdAt: -1 }
            break
          case 'rating':
            sortOptions = { 'rating.average': -1 }
            break
          default:
            sortOptions = { createdAt: -1 }
        }
      }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const products = await Product.find(query)
      .populate('category', 'name slug').populate('occasions', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)

    const total = await Product.countDocuments(query)

    // Personalize search results for authenticated users
    if (req.user) {
      console.log(`Personalizing search results for user: ${req.user.email}, search: ${searchTerm}`)
    }

    res.json({
      success: true,
      data: products,
      searchTerm,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error searching products:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// @desc    Get products by category
// @route   GET /api/products/category/:category
// @access  Public (with optional auth for personalization)
router.get('/category/:category', optionalAuth,
  [
    param('category').trim().notEmpty().withMessage('Category is required'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  validateRequest,
  async (req, res) => {
  try {
    const { category } = req.params
    const {
      minPrice,
      maxPrice,
      size,
      color,
      sort,
      page = 1,
      limit = 12
    } = req.query

    let query = { 
      isActive: true, 
      visibility: 'public'
    }

    // Handle category - resolve slug/name to ObjectId
    if (category && category !== 'all') {
      console.log(`[CATEGORY] Resolving category: ${category}`)
      
      // Special handling for "new-in" - show latest products without category filter
      if (category === 'new-in') {
        console.log(`[CATEGORY] "new-in" detected - showing latest products across all categories`)
        // Don't add category filter, just sort by createdAt descending
      } else {
        const resolved = await resolveCategoryId(category)
        console.log(`[CATEGORY] Resolved to: ${resolved}`)
        if (resolved) {
          query.category = resolved
          console.log(`[CATEGORY] Using ObjectId filter`)
        } else {
          // Fallback to tag-based search if slug doesn't match a category
          query.tags = { $in: [category.toString().toLowerCase()] }
          console.log(`[CATEGORY] Using tag fallback`)
        }
      }
    }

    // Apply additional filters
    if (minPrice || maxPrice) {
      query['variations.price'] = {}
      if (minPrice) query['variations.price'].$gte = parseFloat(minPrice)
      if (maxPrice) query['variations.price'].$lte = parseFloat(maxPrice)
    }

    if (size) {
      query['variations.size'] = size
    }

    if (color) {
      query['variations.color'] = color
    }

    // Sorting
    let sortOptions = { createdAt: -1 }
    switch (sort) {
      case 'price-asc':
        sortOptions = { 'variations.price': 1 }
        break
      case 'price-desc':
        sortOptions = { 'variations.price': -1 }
        break
      case 'newest':
        sortOptions = { createdAt: -1 }
        break
      case 'rating':
        sortOptions = { 'rating.average': -1 }
        break
      case 'popular':
        sortOptions = { 'sales.totalSold': -1 }
        break
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const products = await Product.find(query)
      .populate('category', 'name slug').populate('occasions', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)

    const total = await Product.countDocuments(query)

    // Personalize for authenticated users
    let personalizedProducts = products
    if (req.user) {
      console.log(`Personalizing category results for user: ${req.user.email}`)
    }

    res.json({
      success: true,
      data: personalizedProducts,
      category,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching products by category:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// @desc    Get all products
// @route   GET /api/products
// @access  Public (with optional auth for personalization)
router.get('/', optionalAuth, async (req, res) => {
  try {
    const {
      category,
      occasion,
      minPrice,
      maxPrice,
      size,
      color,
      sort,
      page = 1,
      limit = 12,
      search,
      featured
    } = req.query

    let query = { isActive: true, visibility: 'public' }

    // Search filter
    if (search) {
      query.$text = { $search: search }
    }

    // Category filter
    if (category && category !== 'all') {
      console.log(`[FILTER] Category filter requested: ${category}`)
      const resolved = await resolveCategoryId(category)
      console.log(`[FILTER] Category resolved to: ${resolved}`)
      if (resolved) {
        query.category = resolved
        console.log(`[FILTER] Using ObjectId filter for category`)
      } else {
        query.tags = { $in: [category.toString().toLowerCase()] }
        console.log(`[FILTER] Using tag fallback for category`)
      }
    }

    // Occasion filter
    if (occasion && occasion !== 'all') {
      console.log(`[FILTER] Occasion filter requested: ${occasion}`)
      const resolved = await resolveOccasionId(occasion)
      console.log(`[FILTER] Occasion resolved to: ${resolved}`)
      if (resolved) {
        query.occasions = { $in: [resolved] }
        console.log(`[FILTER] Using ObjectId filter: ${JSON.stringify(query.occasions)}`)
      } else {
        query.tags = { $in: [occasion.toString().toLowerCase()] }
        console.log(`[FILTER] Using tag fallback: ${JSON.stringify(query.tags)}`)
      }
    }

    // Featured filter
    if (featured === 'true') {
      query.isFeatured = true
    }

    // Price range filter
    if (minPrice || maxPrice) {
      query['variations.price'] = {}
      if (minPrice) query['variations.price'].$gte = parseFloat(minPrice)
      if (maxPrice) query['variations.price'].$lte = parseFloat(maxPrice)
    }

    // Size filter
    if (size) {
      query['variations.size'] = size
    }

    // Color filter
    if (color) {
      query['variations.color'] = color
    }

    // Sorting
    let sortOptions = {}
    switch (sort) {
      case 'price-asc':
        sortOptions = { 'variations.price': 1 }
        break
      case 'price-desc':
        sortOptions = { 'variations.price': -1 }
        break
      case 'newest':
        sortOptions = { createdAt: -1 }
        break
      case 'rating':
        sortOptions = { 'rating.average': -1 }
        break
      case 'popular':
        sortOptions = { 'sales.totalSold': -1 }
        break
      default:
        sortOptions = { createdAt: -1 }
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const products = await Product.find(query)
      .populate('category', 'name slug').populate('occasions', 'name slug')
      .sort(sortOptions)
      .skip(skip)
      .limit(limitNum)

    const total = await Product.countDocuments(query)

    // Personalize response if user is authenticated
    let personalizedProducts = products
    if (req.user) {
      console.log('Personalizing products for user:', req.user.email)
      // Here you could add user-specific data like:
      // - Wishlist status
      // - Recently viewed
      // - Personalized recommendations
    }

    res.json({
      success: true,
      data: personalizedProducts,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching products:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// @desc    Validate stock for cart items
// @route   POST /api/products/validate-stock
// @access  Public
router.post('/validate-stock', async (req, res) => {
  try {
    const { items } = req.body
    
    if (!items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Items array is required'
      })
    }

    const validationResults = []
    let allAvailable = true

    for (const item of items) {
      const product = await Product.findById(item.productId)
      
      if (!product) {
        validationResults.push({
          productId: item.productId,
          available: false,
          error: 'Product not found'
        })
        allAvailable = false
        continue
      }

      // Find matching variation
      const variation = product.variations?.find(
        v => v.size === item.size && v.color === item.color
      )

      if (!variation) {
        validationResults.push({
          productId: item.productId,
          productName: product.name,
          size: item.size,
          color: item.color,
          available: false,
          error: 'Variation not found'
        })
        allAvailable = false
        continue
      }

      // Check if variation is out of stock
      if (!variation.inventory || variation.inventory.quantity === 0) {
        validationResults.push({
          productId: item.productId,
          productName: product.name,
          size: item.size,
          color: item.color,
          available: false,
          availableQuantity: 0,
          error: 'Out of stock'
        })
        allAvailable = false
        continue
      }

      // Check if requested quantity exceeds available stock
      const availableQty = variation.inventory.quantity
      if (availableQty < item.quantity) {
        validationResults.push({
          productId: item.productId,
          productName: product.name,
          size: item.size,
          color: item.color,
          available: false,
          availableQuantity: availableQty,
          requestedQuantity: item.quantity,
          error: `Only ${availableQty} item(s) available`
        })
        allAvailable = false
        continue
      }

      // Item is available
      validationResults.push({
        productId: item.productId,
        productName: product.name,
        size: item.size,
        color: item.color,
        available: true,
        availableQuantity: availableQty
      })
    }

    res.json({
      success: true,
      allAvailable,
      data: validationResults
    })
  } catch (error) {
    console.error('Error validating stock:', error)
    res.status(500).json({
      success: false,
      error: error.message || 'Server error validating stock'
    })
  }
})

// @desc    Get single product by ID or slug
// @route   GET /api/products/:id
// @access  Public (with optional auth for personalization)
router.get('/:id', optionalAuth, async (req, res) => {
  try {
    const product = await Product.findOne({
      $or: [
        { _id: req.params.id },
        { slug: req.params.id }
      ],
      isActive: true,
      visibility: 'public'
    })
      .populate('category', 'name slug').populate('occasions', 'name slug')
      .populate('relatedProducts', 'name slug variations images price')
      .populate('crossSellProducts', 'name slug variations images price')

    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Track product view for authenticated users (for recommendations)
    if (req.user) {
      console.log(`User ${req.user.email} viewed product: ${product.name}`)
      // You could add to user's recently viewed here
    }

    res.json({
      success: true,
      data: product
    })
  } catch (error) {
    console.error('Error fetching product:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})



// =========================================================================
// ADMIN ROUTES - PROTECTED
// =========================================================================

// @desc    Create new product
// @route   POST /api/products
// @access  Private/Admin
router.post('/', protect, admin,
  [
    check('name').trim().notEmpty().withMessage('Product name is required'),
    check('description').trim().notEmpty().withMessage('Product description is required'),
    check('category').trim().notEmpty().withMessage('Category is required'),
    check('variations').isArray({ min: 1 }).withMessage('At least one variation is required')
  ],
  validateRequest,
  async (req, res) => {
  try {
    // Convert occasion IDs to ObjectId references
    if (req.body.occasions && Array.isArray(req.body.occasions)) {
      req.body.occasions = req.body.occasions
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id))
    }

    const product = await Product.create(req.body)
    
    console.log(`Admin ${req.user.email} created product: ${product.name}`)
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    })
  } catch (error) {
    console.error('Error creating product:', error.message)
    // Extract validation errors from Mongoose
    let errorDetails = null
    if (error.errors) {
      errorDetails = Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`)
    }
    
    res.status(400).json({
      success: false,
      error: error.message || 'Server error creating product',
      details: errorDetails
    })
  }
})

// @desc    Update product
// @route   PUT /api/products/:id
// @access  Private/Admin
router.put('/:id', protect, admin,
  [
    param('id').trim().notEmpty().withMessage('Product id is required'),
    check('name').optional().trim(),
    check('variations').optional().isArray()
  ],
  validateRequest,
  async (req, res) => {
  try {
    // Convert occasion IDs to ObjectId references
    if (req.body.occasions && Array.isArray(req.body.occasions)) {
      req.body.occasions = req.body.occasions
        .filter(id => mongoose.Types.ObjectId.isValid(id))
        .map(id => new mongoose.Types.ObjectId(id))
    }

    const product = await Product.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    )
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    console.log(`Admin ${req.user.email} updated product: ${product.name}`)
    
    res.json({
      success: true,
      data: product,
      message: 'Product updated successfully'
    })
  } catch (error) {
    console.error('Error updating product:', error.message)
    res.status(400).json({
      success: false,
      error: error.message || 'Server error updating product',
      details: error.errors ? Object.keys(error.errors).map(key => `${key}: ${error.errors[key].message}`) : null
    })
  }
})

// @desc    Update product variation inventory
// @route   PATCH /api/products/:id/inventory
// @access  Private/Admin
router.patch('/:id/inventory', protect, admin,
  [
    param('id').trim().notEmpty().withMessage('Product id is required'),
    check('variationSku').trim().notEmpty().withMessage('Variation SKU is required'),
    check('quantity').isInt({ min: 0 }).withMessage('Quantity must be a non-negative integer')
  ],
  validateRequest,
  async (req, res) => {
  try {
    const { variationSku, quantity } = req.body
    const product = await Product.findById(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Find variation by SKU
    const variationIndex = product.variations.findIndex(v => v.sku === variationSku)
    
    if (variationIndex === -1) {
      return res.status(404).json({
        success: false,
        error: `Variation with SKU ${variationSku} not found`
      })
    }

    // Update inventory
    product.variations[variationIndex].inventory.quantity = quantity
    await product.save()

    console.log(`Admin ${req.user.email} updated inventory for ${product.name} SKU ${variationSku} to ${quantity}`)
    
    res.json({
      success: true,
      data: {
        product: product.name,
        sku: variationSku,
        size: product.variations[variationIndex].size,
        color: product.variations[variationIndex].color,
        quantity: quantity
      },
      message: 'Inventory updated successfully'
    })
  } catch (error) {
    console.error('Error updating inventory:', error.message)
    res.status(400).json({
      success: false,
      error: error.message || 'Server error updating inventory'
    })
  }
})

// @desc    Delete product (soft delete)
// @route   DELETE /api/products/:id
// @access  Private/Admin
router.delete('/:id', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndUpdate(
      req.params.id,
      { isActive: false },
      { new: true }
    )
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    console.log(`Admin ${req.user.email} soft-deleted product: ${product.name}`)
    
    res.json({
      success: true,
      message: 'Product deleted successfully',
      data: product
    })
  } catch (error) {
    console.error('Error deleting product:', error)
    res.status(500).json({
      success: false,
      error: 'Server error deleting product'
    })
  }
})

// @desc    Hard delete product (permanent)
// @route   DELETE /api/products/:id/hard
// @access  Private/Admin
router.delete('/:id/hard', protect, admin, async (req, res) => {
  try {
    const product = await Product.findByIdAndDelete(req.params.id)
    
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    console.log(`Admin ${req.user.email} hard-deleted product: ${product.name}`)
    
    res.json({
      success: true,
      message: 'Product permanently deleted'
    })
  } catch (error) {
    console.error('Error hard deleting product:', error)
    res.status(500).json({
      success: false,
      error: 'Server error deleting product'
    })
  }
})

// @desc    Get all products (including inactive - admin only)
// @route   GET /api/products/admin/all
// @access  Private/Admin
router.get('/admin/all', protect, admin, async (req, res) => {
  try {
    const { page = 1, limit = 50, includeInactive = 'false' } = req.query
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum
    
    // Build filter: by default only show active products, unless includeInactive=true
    const filter = includeInactive === 'true' ? {} : { isActive: true }

    const products = await Product.find(filter)
      .populate('category', 'name slug').populate('occasions', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)

    const total = await Product.countDocuments(filter)

    console.log(`Admin ${req.user.email} accessed all products (filter: ${JSON.stringify(filter)})`)

    res.json({
      success: true,
      data: products,
      pagination: {
        page: pageNum,
        limit: limitNum,
        total,
        pages: Math.ceil(total / limitNum)
      }
    })
  } catch (error) {
    console.error('Error fetching all products (admin):', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// @desc    Upload product image
// @route   POST /api/products/:id/upload-image
// @access  Private/Admin
router.post('/:id/upload-image', protect, admin, (req, res, next) => {
  // Use multer and handle errors
  uploadImage.single('image')(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      console.error('[UPLOAD] Multer error:', err.message)
      return res.status(400).json({ 
        success: false, 
        error: `Upload error: ${err.message}` 
      })
    } else if (err) {
      console.error('[UPLOAD] File upload error:', err.message)
      return res.status(400).json({ 
        success: false, 
        error: `File error: ${err.message}` 
      })
    }
    next()
  })
}, async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, error: 'No image file provided' })
    }

    // Verify product exists
    const product = await Product.findById(req.params.id)
    if (!product) {
      try { fs.unlinkSync(req.file.path) } catch (e) {}
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    const localPath = req.file.path
    let imageUrl = null

    // Validate Cloudinary configuration
    console.log('[UPLOAD] Cloudinary config check:')
    console.log('[UPLOAD] CLOUD_NAME:', process.env.CLOUDINARY_CLOUD_NAME ? '✓ set' : '✗ missing')
    console.log('[UPLOAD] API_KEY:', process.env.CLOUDINARY_API_KEY ? '✓ set' : '✗ missing')
    console.log('[UPLOAD] API_SECRET:', process.env.CLOUDINARY_API_SECRET ? '✓ set' : '✗ missing')

    // Upload to Cloudinary if configured; handle multiple files
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      try {
        const uploadOptsBase = {
          folder: `erica-spanks/${req.params.id}`,
          unique_filename: true,
          timeout: 60000 // 60 second timeout
        }

        for (const f of files) {
          console.log('[UPLOAD] Uploading to Cloudinary with options:', uploadOptsBase)
          console.log('[UPLOAD] File path:', f.path)
          console.log('[UPLOAD] File exists:', fs.existsSync(f.path))

          // retry logic per file
          let cloudinaryResult = null
          let lastError = null
          const maxRetries = 2
          for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
              console.log(`[UPLOAD] Attempt ${attempt} of ${maxRetries} for file ${f.path}`)
              cloudinaryResult = await cloudinary.uploader.upload(f.path, uploadOptsBase)
              break
            } catch (retryError) {
              lastError = retryError
              console.error(`[UPLOAD] Attempt ${attempt} failed for ${f.path}:`, retryError?.message || retryError)
              if (attempt < maxRetries) {
                const waitTime = 1000 * Math.pow(2, attempt - 1)
                console.log(`[UPLOAD] Waiting ${waitTime}ms before retry...`)
                await new Promise(r => setTimeout(r, waitTime))
              }
            }
          }

          if (!cloudinaryResult) {
            throw lastError || new Error('Cloudinary upload failed after retries')
          }

          const imageUrl = cloudinaryResult.secure_url
          uploadedUrls.push({ url: imageUrl, filePath: f.path })
          console.log('[UPLOAD] Cloudinary upload successful:', imageUrl)
          try { fs.unlinkSync(f.path) } catch (e) {}
        }
      } catch (cloudinaryError) {
        // Extract error message from various possible locations
        let errorMessage = 'Unknown error'
        
        if (cloudinaryError?.error?.message) {
          errorMessage = cloudinaryError.error.message
        } else if (cloudinaryError?.message) {
          errorMessage = cloudinaryError.message
        } else if (cloudinaryError?.http_code) {
          errorMessage = `HTTP ${cloudinaryError.http_code}: ${cloudinaryError.status || 'Request failed'}`
        } else if (typeof cloudinaryError === 'string') {
          errorMessage = cloudinaryError
        } else {
          errorMessage = JSON.stringify(cloudinaryError).substring(0, 200)
        }
        
        console.error('[UPLOAD] Cloudinary upload failed:', errorMessage)
        console.error('[UPLOAD] Full error object:', JSON.stringify(cloudinaryError, null, 2))
        
        try { fs.unlinkSync(localPath) } catch (e) {}
        return res.status(500).json({ 
          success: false, 
          error: `Cloudinary upload failed: ${errorMessage}`,
          details: process.env.NODE_ENV !== 'production' ? {
            message: errorMessage,
            code: cloudinaryError?.http_code || cloudinaryError?.code
          } : undefined
        })
      }
    } else {
      // Fallback to local path storage for each file
      console.log('[UPLOAD] Cloudinary not configured, using local path')
      for (const f of files) {
        uploadedUrls.push({ url: `/uploads/${f.filename}`, filePath: f.path })
      }
    }

    // Attach each uploaded URL to product.media and to variation specified (if any)
    if (!product.media) product.media = []
    const variationSku = req.body && req.body.variationSku ? String(req.body.variationSku).trim() : null

    for (const u of uploadedUrls) {
      const imageUrl = u.url
      product.media.unshift(imageUrl)

      if (variationSku && product.variations && product.variations.length > 0) {
        const vIndex = product.variations.findIndex(v => String(v.sku) === variationSku)
        if (vIndex !== -1) {
          if (!product.variations[vIndex].images) product.variations[vIndex].images = []
          product.variations[vIndex].images.unshift({ url: imageUrl, alt: product.name, isPrimary: true })
        } else {
          if (!product.variations[0].images) product.variations[0].images = []
          product.variations[0].images.unshift({ url: imageUrl, alt: product.name, isPrimary: true })
        }
      } else {
        if (product.variations && product.variations.length > 0) {
          if (!product.variations[0].images) product.variations[0].images = []
          product.variations[0].images.unshift({ url: imageUrl, alt: product.name, isPrimary: true })
        }
      }
    }

    await product.save()

    res.json({
      success: true,
      data: {
        productId: product._id,
        imageUrl: imageUrl,
        message: 'Image uploaded successfully'
      }
    })
  } catch (error) {
    // Clean up temp file
    if (req.file && req.file.path) {
      try { fs.unlinkSync(req.file.path) } catch (e) {}
    }

    console.error('[UPLOAD] Image upload error:', error)
    const payload = {
      success: false,
      error: error.message || 'Failed to upload image'
    }
    if (process.env.NODE_ENV !== 'production') {
      payload.details = error.stack || null
    }
    res.status(500).json(payload)
  }
})

// @desc    Test Cloudinary configuration
// @route   GET /api/products/test/cloudinary-config
// @access  Private/Admin
router.get('/test/cloudinary-config', protect, admin, (req, res) => {
  try {
    const config = {
      cloudinaryConfigured: !!(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET),
      cloudName: process.env.CLOUDINARY_CLOUD_NAME ? '✓ Set' : '✗ Missing',
      apiKey: process.env.CLOUDINARY_API_KEY ? '✓ Set' : '✗ Missing',
      apiSecret: process.env.CLOUDINARY_API_SECRET ? '✓ Set' : '✗ Missing',
      nodeEnv: process.env.NODE_ENV || 'development'
    }
    res.json({
      success: true,
      data: config
    })
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// @desc    Debug occasion filtering
// @route   GET /api/products/test/debug-occasions
// @access  Private/Admin
router.get('/test/debug-occasions', protect, admin, async (req, res) => {
  try {
    // Get all products with their occasions
    const products = await Product.find({ isActive: true, visibility: 'public' })
      .populate('occasions', 'name slug')
      .select('name occasions')
      .limit(20)
    
    // Get all occasions
    const occasions = await Occasion.find({})
    
    // Get sample products with their raw occasions field
    const rawProducts = await Product.find({ isActive: true, visibility: 'public' })
      .select('name occasions')
      .limit(10)
    
    res.json({
      success: true,
      data: {
        products: products.map(p => ({
          name: p.name,
          occasions: p.occasions
        })),
        occasions: occasions.map(o => ({
          _id: o._id,
          name: o.name,
          slug: o.slug
        })),
        rawProducts: rawProducts.map(p => ({
          name: p.name,
          occasions: p.occasions
        }))
      }
    })
  } catch (error) {
    console.error('Error debugging occasions:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// @desc    Debug all categories and product distribution
// @route   GET /api/products/test/debug-categories
// @access  Private/Admin
router.get('/test/debug-categories', protect, admin, async (req, res) => {
  try {
    // Get all categories
    const allCategories = await Category.find({}).select('name slug _id').lean()
    
    // For each category, count how many products are assigned
    const categoryStats = await Promise.all(
      allCategories.map(async (cat) => {
        const count = await Product.countDocuments({ category: cat._id, isActive: true, visibility: 'public' })
        return {
          name: cat.name,
          slug: cat.slug,
          _id: cat._id,
          productCount: count
        }
      })
    )
    
    // Get sample of all products to see what categories they have
    const sampleProducts = await Product.find({ isActive: true, visibility: 'public' })
      .populate('category', 'name slug')
      .select('name category')
      .limit(20)
    
    res.json({
      success: true,
      data: {
        totalCategories: allCategories.length,
        categoryStats: categoryStats,
        sampleProducts: sampleProducts.map(p => ({
          name: p.name,
          category: p.category
        }))
      }
    })
  } catch (error) {
    console.error('Error debugging categories:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// @desc    Test filtering with specific parameters
// @route   GET /api/products/test/filter-test
// @access  Private/Admin
router.get('/test/filter-test', protect, admin, async (req, res) => {
  try {
    const { category, occasion } = req.query
    
    console.log('[FILTER-TEST] Testing filter with params:', { category, occasion })
    
    let query = { isActive: true, visibility: 'public' }
    
    // Test category filtering
    if (category && category !== 'all') {
      console.log(`[FILTER-TEST] Testing category: ${category}`)
      const resolved = await resolveCategoryId(category)
      console.log(`[FILTER-TEST] Category resolved to: ${resolved}`)
      if (resolved) {
        query.category = resolved
        console.log(`[FILTER-TEST] Category query: ${JSON.stringify(query.category)}`)
      } else {
        query.tags = { $in: [category.toString().toLowerCase()] }
        console.log(`[FILTER-TEST] Category fallback query: ${JSON.stringify(query.tags)}`)
      }
    }
    
    // Test occasion filtering
    if (occasion && occasion !== 'all') {
      console.log(`[FILTER-TEST] Testing occasion: ${occasion}`)
      const resolved = await resolveOccasionId(occasion)
      console.log(`[FILTER-TEST] Occasion resolved to: ${resolved}`)
      if (resolved) {
        query.occasions = { $in: [resolved] }
        console.log(`[FILTER-TEST] Occasion query: ${JSON.stringify(query.occasions)}`)
      } else {
        query.tags = { $in: [occasion.toString().toLowerCase()] }
        console.log(`[FILTER-TEST] Occasion fallback query: ${JSON.stringify(query.tags)}`)
      }
    }
    
    console.log(`[FILTER-TEST] Final query: ${JSON.stringify(query)}`)
    
    const products = await Product.find(query)
      .populate('category', 'name slug')
      .populate('occasions', 'name slug')
      .limit(10)
    
    console.log(`[FILTER-TEST] Found ${products.length} products`)
    
    res.json({
      success: true,
      data: {
        query: query,
        products: products.map(p => ({
          name: p.name,
          category: p.category,
          occasions: p.occasions,
          slug: p.slug
        })),
        count: products.length
      }
    })
  } catch (error) {
    console.error('Error testing filter:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// POST /api/products/:id/rate - Add or update a review/rating
router.post('/:id/rate', protect, async (req, res) => {
  try {
    const { rating, title, comment } = req.body

    // Validate input
    if (!rating || rating < 1 || rating > 5) {
      return res.status(400).json({ success: false, error: 'Rating must be between 1 and 5' })
    }

    if (!title || title.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Review title is required' })
    }

    if (!comment || comment.trim().length === 0) {
      return res.status(400).json({ success: false, error: 'Review comment is required' })
    }

    // Find product
    const product = await Product.findById(req.params.id)
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    // Check if user already reviewed this product
    const existingReviewIndex = product.reviews.findIndex(r => r.user.toString() === req.user._id.toString())

    if (existingReviewIndex >= 0) {
      // Update existing review
      product.reviews[existingReviewIndex] = {
        ...product.reviews[existingReviewIndex],
        rating,
        title,
        comment,
        updatedAt: new Date()
      }
    } else {
      // Add new review
      product.reviews.push({
        user: req.user._id,
        rating,
        title,
        comment,
        verified: false,
        helpful: {
          count: 0,
          users: []
        }
      })
    }

    // Recalculate average rating
    const totalRating = product.reviews.reduce((sum, r) => sum + r.rating, 0)
    product.rating = {
      average: Math.round((totalRating / product.reviews.length) * 10) / 10,
      count: product.reviews.length
    }

    await product.save()

    res.json({
      success: true,
      data: {
        rating: product.rating,
        review: existingReviewIndex >= 0 ? product.reviews[existingReviewIndex] : product.reviews[product.reviews.length - 1]
      }
    })
  } catch (error) {
    console.error('Error adding review:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

// GET /api/products/:id/reviews - Get product reviews
router.get('/:id/reviews', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id).populate('reviews.user', 'name email')
    if (!product) {
      return res.status(404).json({ success: false, error: 'Product not found' })
    }

    res.json({
      success: true,
      data: {
        rating: product.rating,
        reviews: product.reviews
      }
    })
  } catch (error) {
    console.error('Error fetching reviews:', error)
    res.status(500).json({
      success: false,
      error: error.message
    })
  }
})

export default router
