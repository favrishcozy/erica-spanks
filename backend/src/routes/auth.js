import express from 'express'
import User from '../models/User.js'
import Product from '../models/Product.js'
import { generateToken } from '../utils/jwt.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// Register new user
router.post('/register', async (req, res) => {
  try {
    const { firstName, lastName, email, password, phone, dateOfBirth, gender, preferences } = req.body

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide first name, last name, email, and password'
      })
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      })
    }

    // Check if user exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      })
    }

    // Create user
    const user = await User.create({
      firstName,
      lastName,
      email,
      password,
      phone,
      dateOfBirth,
      gender,
      preferences
    })

    // Generate token
    const token = generateToken(user._id)

    res.status(201).json({
      success: true,
      data: {
        user,
        token
      },
      message: 'User registered successfully'
    })

  } catch (error) {
    console.error('Registration error:', error)
    
    // Handle MongoDB duplicate key error
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'User already exists with this email'
      })
    }
    
    // Handle Mongoose validation errors
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error during registration'
    })
  }
})

// Login user
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body

    console.log('[LOGIN] Attempting login with email:', email)

    // Validation
    if (!email || !password) {
      console.log('[LOGIN] Missing email or password')
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      })
    }

    // Find user and include password for comparison (overrides select: false)
    const user = await User.findOne({ email }).select('+password')
    
    console.log('[LOGIN] User found:', user ? 'yes' : 'no')
    
    if (!user) {
      console.log('[LOGIN] User not found with email:', email)
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Test password
    console.log('[LOGIN] Testing password...')
    const passwordMatch = await user.comparePassword(password)
    console.log('[LOGIN] Password match:', passwordMatch)
    
    if (!passwordMatch) {
      console.log('[LOGIN] Password mismatch for user:', email)
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    if (!user.isActive) {
      console.log('[LOGIN] Account inactive for user:', email)
      return res.status(401).json({
        success: false,
        error: 'Account is deactivated. Please contact support.'
      })
    }

    // Update last login
    user.lastLogin = new Date()
    await user.save()

    // Generate token
    const token = generateToken(user._id)

    console.log('[LOGIN] Login successful for user:', email)

    res.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'Login successful'
    })

  } catch (error) {
    console.error('[LOGIN] Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error during login'
    })
  }
})

// Get current user profile
router.get('/profile', protect, async (req, res) => {
  try {
    // User is already attached to req by protect middleware
    const user = await User.findById(req.user._id)
      .populate('wishlist', 'name price images slug category')
      .populate('orders', 'orderNumber status totalAmount createdAt')

    res.json({
      success: true,
      data: user
    })

  } catch (error) {
    console.error('Profile fetch error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching profile'
    })
  }
})

// Update user profile
router.put('/profile', protect, async (req, res) => {
  try {
    const allowedUpdates = [
      'firstName', 
      'lastName', 
      'email', 
      'phone', 
      'dateOfBirth', 
      'gender', 
      'preferences'
    ]
    
    const updates = Object.keys(req.body)
    const isValidOperation = updates.every(update => allowedUpdates.includes(update))

    if (!isValidOperation) {
      return res.status(400).json({
        success: false,
        error: 'Invalid updates'
      })
    }

    // Check if email is being updated and if it's already taken
    if (req.body.email && req.body.email !== req.user.email) {
      const existingUser = await User.findOne({ email: req.body.email })
      if (existingUser) {
        return res.status(400).json({
          success: false,
          error: 'Email already in use'
        })
      }
    }

    updates.forEach(update => req.user[update] = req.body[update])
    await req.user.save()

    res.json({
      success: true,
      data: req.user,
      message: 'Profile updated successfully'
    })

  } catch (error) {
    console.error('Profile update error:', error)
    
    if (error.name === 'ValidationError') {
      const errors = Object.values(error.errors).map(err => err.message)
      return res.status(400).json({
        success: false,
        error: errors.join(', ')
      })
    }
    
    res.status(500).json({
      success: false,
      error: 'Server error updating profile'
    })
  }
})

// Logout user
router.post('/logout', protect, async (req, res) => {
  try {
    // Clear any session-related data if using sessions
    // For JWT-based auth, the session is cleared on the client side
    console.log('[LOGOUT] User logged out:', req.user._id)
    
    res.json({
      success: true,
      message: 'Logged out successfully'
    })
  } catch (error) {
    console.error('[LOGOUT] Logout error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error during logout'
    })
  }
})

// Change password
router.put('/change-password', protect, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: 'Please provide current and new password'
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'New password must be at least 6 characters long'
      })
    }

    // Get user with password (overrides select: false)
    const user = await User.findById(req.user._id).select('+password')

    // Verify current password
    const isCurrentPasswordValid = await user.comparePassword(currentPassword)
    if (!isCurrentPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Current password is incorrect'
      })
    }

    // Update password
    user.password = newPassword
    await user.save()

    res.json({
      success: true,
      message: 'Password changed successfully'
    })

  } catch (error) {
    console.error('Password change error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error changing password'
    })
  }
})

// Add address
router.post('/addresses', protect, async (req, res) => {
  try {
    const addressData = req.body
    
    // If this is the first address or user wants to set it as default, make it default
    if (req.user.addresses.length === 0 || addressData.isDefault) {
      req.user.addresses.forEach(addr => {
        addr.isDefault = false
      })
    }
    
    req.user.addresses.push(addressData)
    await req.user.save()

    res.status(201).json({
      success: true,
      data: req.user.addresses,
      message: 'Address added successfully'
    })

  } catch (error) {
    console.error('Add address error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error adding address'
    })
  }
})

// Update address
router.put('/addresses/:addressId', protect, async (req, res) => {
  try {
    const { addressId } = req.params
    const addressData = req.body

    const address = req.user.addresses.id(addressId)
    if (!address) {
      return res.status(404).json({
        success: false,
        error: 'Address not found'
      })
    }

    // If setting as default, update all other addresses
    if (addressData.isDefault) {
      req.user.addresses.forEach(addr => {
        addr.isDefault = addr._id.toString() === addressId.toString()
      })
    } else {
      Object.assign(address, addressData)
    }

    await req.user.save()

    res.json({
      success: true,
      data: req.user.addresses,
      message: 'Address updated successfully'
    })

  } catch (error) {
    console.error('Update address error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error updating address'
    })
  }
})

// Delete address
router.delete('/addresses/:addressId', protect, async (req, res) => {
  try {
    const { addressId } = req.params

    req.user.addresses = req.user.addresses.filter(
      addr => addr._id.toString() !== addressId.toString()
    )

    await req.user.save()

    res.json({
      success: true,
      data: req.user.addresses,
      message: 'Address deleted successfully'
    })

  } catch (error) {
    console.error('Delete address error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error deleting address'
    })
  }
})

// Get user's wishlist
router.get('/wishlist', protect, async (req, res) => {
  try {
    await req.user.populate('wishlist', 'name price images slug category')
    res.json({
      success: true,
      data: req.user.wishlist
    })
  } catch (error) {
    console.error('Get wishlist error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error fetching wishlist'
    })
  }
})

// Add product to wishlist
router.post('/wishlist', protect, async (req, res) => {
  try {
    const { productId } = req.body

    if (!productId) {
      return res.status(400).json({
        success: false,
        error: 'Product ID is required'
      })
    }

    // Check if product exists
    const product = await Product.findById(productId)
    if (!product) {
      return res.status(404).json({
        success: false,
        error: 'Product not found'
      })
    }

    // Check if already in wishlist
    if (req.user.wishlist.includes(productId)) {
      return res.status(400).json({
        success: false,
        error: 'Product already in wishlist'
      })
    }

    req.user.wishlist.push(productId)
    await req.user.save()

    await req.user.populate('wishlist', 'name price images slug category')

    res.status(201).json({
      success: true,
      data: req.user.wishlist,
      message: 'Product added to wishlist'
    })

  } catch (error) {
    console.error('Add to wishlist error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error adding to wishlist'
    })
  }
})

// Remove product from wishlist
router.delete('/wishlist/:productId', protect, async (req, res) => {
  try {
    const { productId } = req.params

    // Check if product exists in wishlist
    const index = req.user.wishlist.indexOf(productId)
    if (index === -1) {
      return res.status(404).json({
        success: false,
        error: 'Product not found in wishlist'
      })
    }

    req.user.wishlist.splice(index, 1)
    await req.user.save()

    await req.user.populate('wishlist', 'name price images slug category')

    res.json({
      success: true,
      data: req.user.wishlist,
      message: 'Product removed from wishlist'
    })

  } catch (error) {
    console.error('Remove from wishlist error:', error)
    res.status(500).json({
      success: false,
      error: 'Server error removing from wishlist'
    })
  }
})

export default router
