import express from 'express'

const router = express.Router()

// @desc    Get all categories
// @route   GET /api/categories
// @access  Public
router.get('/', async (req, res) => {
  res.json({
    success: true,
    data: [
      { _id: '1', name: 'Dresses', slug: 'dresses' },
      { _id: '2', name: 'Loungewear', slug: 'loungewear' },
      { _id: '3', name: 'Two-Piece Sets', slug: 'two-piece-sets' },
      { _id: '4', name: 'New In', slug: 'new-in' },
      { _id: '5', name: 'Essentials', slug: 'essentials' }
    ]
  })
})

export default router
