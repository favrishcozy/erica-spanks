import express from 'express'
import User from '../models/User.js'
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

    // Validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Please provide email and password'
      })
    }

    // Find user and include password for comparison (overrides select: false)
    const user = await User.findOne({ email }).select('+password')
    
    if (!user || !(await user.comparePassword(password))) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    if (!user.isActive) {
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

    res.json({
      success: true,
      data: {
        user,
        token
      },
      message: 'Login successful'
    })

  } catch (error) {
    console.error('Login error:', error)
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

export default router