import express from 'express'
import Occasion from '../models/Occasion.js'
import { protect } from '../middleware/auth.js'

const router = express.Router()

// @route   GET /api/occasions
// @desc    Get all occasions
// @access  Public
router.get('/', async (req, res) => {
  try {
    const occasions = await Occasion.find().sort({ name: 1 })
    res.json({
      success: true,
      data: occasions
    })
  } catch (err) {
    console.error('Error fetching occasions:', err)
    res.status(500).json({
      success: false,
      error: 'Server error while fetching occasions'
    })
  }
})

// @route   GET /api/occasions/:id
// @desc    Get occasion by ID
// @access  Public
router.get('/:id', async (req, res) => {
  try {
    const occasion = await Occasion.findById(req.params.id)
    
    if (!occasion) {
      return res.status(404).json({
        success: false,
        error: 'Occasion not found'
      })
    }
    
    res.json({
      success: true,
      data: occasion
    })
  } catch (err) {
    console.error('Error fetching occasion:', err)
    res.status(500).json({
      success: false,
      error: 'Server error while fetching occasion'
    })
  }
})

// @route   POST /api/occasions
// @desc    Create new occasion
// @access  Private (Admin only)
router.post('/', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const { name, description, image } = req.body

    // Check if occasion already exists
    const existingOccasion = await Occasion.findOne({ name: name.trim() })
    if (existingOccasion) {
      return res.status(400).json({
        success: false,
        error: 'Occasion with this name already exists'
      })
    }

    const occasion = new Occasion({
      name: name.trim(),
      description: description?.trim(),
      image: image?.trim()
    })

    const savedOccasion = await occasion.save()
    
    res.status(201).json({
      success: true,
      data: savedOccasion
    })
  } catch (err) {
    console.error('Error creating occasion:', err)
    res.status(500).json({
      success: false,
      error: 'Server error while creating occasion'
    })
  }
})

// @route   PUT /api/occasions/:id
// @desc    Update occasion
// @access  Private (Admin only)
router.put('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const { name, description, image } = req.body
    const updates = {}

    if (name) updates.name = name.trim()
    if (description !== undefined) updates.description = description?.trim()
    if (image !== undefined) updates.image = image?.trim()

    const occasion = await Occasion.findByIdAndUpdate(
      req.params.id,
      { $set: updates },
      { new: true, runValidators: true }
    )

    if (!occasion) {
      return res.status(404).json({
        success: false,
        error: 'Occasion not found'
      })
    }

    res.json({
      success: true,
      data: occasion
    })
  } catch (err) {
    console.error('Error updating occasion:', err)
    res.status(500).json({
      success: false,
      error: 'Server error while updating occasion'
    })
  }
})

// @route   DELETE /api/occasions/:id
// @desc    Delete occasion
// @access  Private (Admin only)
router.delete('/:id', protect, async (req, res) => {
  try {
    // Check if user is admin
    if (req.user.role !== 'admin') {
      return res.status(403).json({
        success: false,
        error: 'Access denied. Admin only.'
      })
    }

    const occasion = await Occasion.findByIdAndDelete(req.params.id)

    if (!occasion) {
      return res.status(404).json({
        success: false,
        error: 'Occasion not found'
      })
    }

    res.json({
      success: true,
      message: 'Occasion deleted successfully'
    })
  } catch (err) {
    console.error('Error deleting occasion:', err)
    res.status(500).json({
      success: false,
      error: 'Server error while deleting occasion'
    })
  }
})

export default router
