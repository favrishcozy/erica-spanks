import express from 'express'
import Product from '../models/Product.js'
import Category from '../models/Category.js'
import { protect, admin, optionalAuth } from '../middleware/auth.js'
import { query, check, param, validationResult } from 'express-validator'
import mongoose from 'mongoose'
import { validateRequest } from '../middleware/validate.js'

const router = express.Router()

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
      .populate('category', 'name slug')
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
        .populate('category', 'name slug')
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


// @desc    Search products
// @route   GET /api/products/search
// @access  Public (with optional auth for personalization)
router.get('/search', optionalAuth,
  [
    query('q').trim().isLength({ min: 1 }).withMessage('Search term is required'),
    query('page').optional().isInt({ min: 1 }).toInt(),
    query('limit').optional().isInt({ min: 1, max: 100 }).toInt()
  ],
  validateRequest,
  async (req, res) => {
  try {
    const { q: searchTerm, category, sort, page = 1, limit = 12 } = req.query

    if (!searchTerm) {
      return res.status(400).json({
        success: false,
        error: 'Search term is required'
      })
    }

    let query = {
      isActive: true,
      visibility: 'public',
      $text: { $search: searchTerm }
    }

    if (category && category !== 'all') {
      // resolve category to ObjectId when possible
      const resolved = await resolveCategoryId(category)
      if (resolved) {
        query.category = resolved
      } else {
        // fallback to tag-based matching if category is not an ObjectId/slug/name
        query.tags = { $in: [category.toString().toLowerCase()] }
      }
    }

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
      case 'relevance':
      default:
        sortOptions = { score: { $meta: 'textScore' } }
    }

    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const products = await Product.find(query)
      .populate('category', 'name slug')
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

    // Handle category by slug or name
    if (category === 'dresses') {
      query.tags = { $in: ['dress', 'dresses'] }
    } else if (category === 'loungewear') {
      query.tags = { $in: ['loungewear', 'lounge', 'comfort'] }
    } else if (category === 'two-piece-sets') {
      query.tags = { $in: ['two-piece', 'set', 'coord', 'matching'] }
    } else if (category === 'new-in') {
      query.isNew = true
    } else if (category === 'essentials') {
      query.tags = { $in: ['essential', 'basic', 'staple'] }
    } else if (category !== 'all') {
      // Generic category filter: resolve slug/name to ObjectId, otherwise fallback to tags
      const resolved = await resolveCategoryId(category)
      if (resolved) {
        query.category = resolved
      } else {
        query.tags = { $in: [category.toString().toLowerCase()] }
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
      .populate('category', 'name slug')
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
      const resolved = await resolveCategoryId(category)
      if (resolved) {
        query.category = resolved
      } else {
        query.tags = { $in: [category.toString().toLowerCase()] }
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
      .populate('category', 'name slug')
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
      .populate('category', 'name slug')
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
    check('category').trim().notEmpty().withMessage('Category is required'),
    check('variations').isArray({ min: 1 }).withMessage('At least one variation is required')
  ],
  validateRequest,
  async (req, res) => {
  try {
    const product = await Product.create(req.body)
    
    console.log(`Admin ${req.user.email} created product: ${product.name}`)
    
    res.status(201).json({
      success: true,
      data: product,
      message: 'Product created successfully'
    })
  } catch (error) {
    console.error('Error creating product:', error)
    res.status(500).json({
      success: false,
      error: 'Server error creating product'
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
    console.error('Error updating product:', error)
    res.status(500).json({
      success: false,
      error: 'Server error updating product'
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
    const { page = 1, limit = 50 } = req.query
    
    const pageNum = parseInt(page)
    const limitNum = parseInt(limit)
    const skip = (pageNum - 1) * limitNum

    const products = await Product.find({})
      .populate('category', 'name slug')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limitNum)

    const total = await Product.countDocuments()

    console.log(`Admin ${req.user.email} accessed all products`)

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

export default router