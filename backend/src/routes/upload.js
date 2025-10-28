import express from 'express'
import multer from 'multer'
import path from 'path'
import fs from 'fs'
import { fileURLToPath } from 'url'
import cloudinary from '../config/cloudinary.js'
import { protect, admin } from '../middleware/auth.js'

const router = express.Router()

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

// Ensure tmp upload directory exists
const uploadTmpDir = path.join(__dirname, '../../tmp/uploads')
if (!fs.existsSync(uploadTmpDir)) {
  fs.mkdirSync(uploadTmpDir, { recursive: true })
}

// Multer storage to disk (temporary) with filename sanitization
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadTmpDir),
  filename: (req, file, cb) => {
    // keep original extension but sanitize name
    const safeName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_')
    cb(null, `${Date.now()}_${safeName}`)
  }
})

// Accept only common image types and limit size to 5MB per file
const IMAGE_MIME_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (!IMAGE_MIME_TYPES.includes(file.mimetype)) {
      return cb(new Error('Invalid file type. Only images are allowed.'))
    }
    cb(null, true)
  }
})

// Helper to upload a local file path to Cloudinary with retries
const uploadToCloudinary = async (filePath, folder = 'erica-spanks') => {
  const maxAttempts = 3
  let attempt = 0
  const uploadOpts = { folder, use_filename: true, unique_filename: true, resource_type: 'image' }

  while (attempt < maxAttempts) {
    try {
      const result = await cloudinary.uploader.upload(filePath, uploadOpts)
      return result
    } catch (err) {
      attempt += 1
      if (attempt >= maxAttempts) throw err
      // exponential backoff
      await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)))
    }
  }
}

// Single file upload
router.post('/', protect, admin, upload.single('file'), async (req, res) => {
  if (!req.file) return res.status(400).json({ success: false, error: 'No file provided' })

  const localPath = req.file.path
  try {
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      const result = await uploadToCloudinary(localPath, req.body.folder || 'erica-spanks')
      // remove local file
      fs.unlink(localPath, () => {})
      return res.json({ success: true, data: { url: result.secure_url, public_id: result.public_id } })
    }

    // If Cloudinary not configured, return local path for dev
    return res.json({ success: true, data: { url: `/uploads/${req.file.filename}`, local: true } })
  } catch (error) {
    // Clean up
    try { fs.unlinkSync(localPath) } catch (e) {}
    console.error('Upload error:', error)
    return res.status(500).json({ success: false, error: error.message || 'Upload failed' })
  }
})

// Multiple files upload
router.post('/multiple', protect, admin, upload.array('files', 8), async (req, res) => {
  if (!req.files || req.files.length === 0) return res.status(400).json({ success: false, error: 'No files provided' })

  const results = []
  for (const file of req.files) {
    const localPath = file.path
    try {
      if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
        const uploaded = await uploadToCloudinary(localPath, req.body.folder || 'erica-spanks')
        results.push({ url: uploaded.secure_url, public_id: uploaded.public_id })
        fs.unlink(localPath, () => {})
      } else {
        results.push({ url: `/uploads/${file.filename}`, local: true })
      }
    } catch (error) {
      try { fs.unlinkSync(localPath) } catch (e) {}
      console.error('Upload one file failed:', error)
      return res.status(500).json({ success: false, error: 'One or more uploads failed' })
    }
  }

  return res.json({ success: true, data: results })
})

export default router
