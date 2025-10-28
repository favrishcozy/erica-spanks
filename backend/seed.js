import mongoose from "mongoose";
import dotenv from "dotenv";
import cloudinary from "./src/config/cloudinary.js";
import Product from "./src/models/Product.js";
import Category from "./src/models/Category.js";
import path from "path";
import { fileURLToPath } from "url";
import fs from "fs";
// add extra dependencies to check the image files
import * as fileType from 'file-type'

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

const DRY_RUN = process.env.DRY_RUN === '1' || process.argv.includes('--dry-run')

// 🧠 Quick check for environment variables (only required when not running dry)
if (!DRY_RUN && !process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI is missing! Check your .env file or path.");
  process.exit(1);
}

// ✅ Connect to MongoDB with proper error handling
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✅ MongoDB connected!");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

// Load seed data from JSON if available to make the seed script configurable
let categories = []
let parsedSeed = null

try {
  const seedJsonPath = path.join(__dirname, './data/seed-data.json')
  if (fs.existsSync(seedJsonPath)) {
    const raw = fs.readFileSync(seedJsonPath, 'utf-8')
    parsedSeed = JSON.parse(raw)
    categories = parsedSeed.categories || []
    console.log('Loaded seed data from data/seed-data.json')
  }
} catch (err) {
  console.warn('No seed JSON found or failed to parse; falling back to built-in defaults')
}

// Helper: scan frontend images folder for files that match a category slug/name
const imagesDir = path.join(__dirname, '../frontend/src/images')
// Support images and video extensions
const IMAGE_EXT_RE = /\.(jpe?g|png|webp|gif|mp4|webm|ogg)$/i
const getImagesForCategory = (cat) => {
  try {
    if (!fs.existsSync(imagesDir)) return []
    const files = fs.readdirSync(imagesDir).filter(f => IMAGE_EXT_RE.test(f))
    const slug = (cat.slug || '').toLowerCase()
    const name = (cat.name || '').toLowerCase()

    // Prefer files that include slug or name
    const matched = files.filter(f => {
      const l = f.toLowerCase()
      if (slug && (l.includes(slug) || l.startsWith(slug))) return true
      if (name && (l.includes(name) || l.startsWith(name))) return true
      // also allow singular/plural variants
      const nameRoot = name.replace(/s$/,'')
      if (nameRoot && (l.includes(nameRoot))) return true
      return false
    }).map(f => `/images/${f}`)

    if (matched.length > 0) return matched

    // Fallback: return any files that contain numeric suffixes for this category, e.g., dress1, dress2
    const fallbackByNumber = files.filter(f => {
      const l = f.toLowerCase()
      if (slug && l.includes(slug)) return true
      return false
    }).map(f => `/images/${f}`)

    if (fallbackByNumber.length > 0) return fallbackByNumber

    // Final fallback: return first few images so seed still has media
    return files.slice(0, 6).map(f => `/images/${f}`)
  } catch (e) {
    return []
  }
}

if (!categories || categories.length === 0) {
  categories = [
    { name: "Dresses", slug: "dresses", description: "Elegant and confident styles for every outing." },
    { name: "Tops", slug: "tops", description: "Trendy, comfy, and stylish tops." },
    { name: "Bottoms", slug: "bottoms", description: "Beautiful bottoms to complete your look." },
    { name: "Two-Piece Sets", slug: "two-piece-sets", description: "Coordinated sets for effortless style." },
    { name: "Loungewear", slug: "loungewear", description: "Comfort meets style in our lounge collection." },
    { name: "Jackets", slug: "jackets", description: "Stylish outerwear for any season." },
  ]
}

// Default image map if not provided; ensure localImagesByCategory exists
// localImagesByCategory: prefer seed JSON mapping, otherwise use empties and fall back to defaults below
let localImagesByCategory = (parsedSeed && parsedSeed.localImagesByCategory) ? parsedSeed.localImagesByCategory : {}

if (!localImagesByCategory || Object.keys(localImagesByCategory).length === 0) {
  // default to empty mapping; we'll scan frontend images per-category later
  localImagesByCategory = {}
}
// 📂 Helper function to upload local images to Cloudinary
// Small helper to generate product variations
const generateVariations = (basePrice, categoryName, seedIndex = 0) => {
  const sizes = ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  const colors = [
    { name: 'Black', code: '#000000' },
    { name: 'White', code: '#FFFFFF' },
    { name: 'Red', code: '#FF0000' },
    { name: 'Blue', code: '#0000FF' },
    { name: 'Green', code: '#00A86B' },
    { name: 'Beige', code: '#F5F5DC' }
  ]

  const count = Math.max(1, Math.min(3, Math.floor(Math.random() * 3) + 1));
  const variations = [];
  for (let i = 0; i < count; i++) {
    const size = sizes[Math.floor(Math.random() * sizes.length)]
    const colorObj = colors[Math.floor(Math.random() * colors.length)]
    const variationPrice = Math.max(1000, basePrice + i * 1500);
    variations.push({
      size,
      color: colorObj.name,
      colorCode: colorObj.code,
      name: `${categoryName} Variation ${seedIndex + 1}-${i + 1}`,
      sku: `SKU-${Date.now().toString().slice(-5)}-${Math.random().toString(36).slice(2, 6)}`,
      barcode: `BC-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      price: variationPrice,
      compareAtPrice: Math.random() > 0.7 ? variationPrice + 2000 : undefined,
      inventory: {
        quantity: Math.floor(Math.random() * 50) + 5,
        lowStockThreshold: 5,
        allowBackorder: false
      },
      weight: Math.floor(Math.random() * 1000) + 200,
      dimensions: {
        length: Math.floor(Math.random() * 50) + 20,
        width: Math.floor(Math.random() * 40) + 15,
        height: Math.floor(Math.random() * 10) + 5
      },
      images: []
    });
  }
  return variations;
}

// 📂 Helper function to upload local images to Cloudinary
const uploadImageToCloudinary = async (imagePath, folder = 'erica-spanks') => {
  // Resolve full path relative to project root frontend images
  const fullPath = path.join(__dirname, '../frontend/src', imagePath)

  if (!fs.existsSync(fullPath)) {
    console.warn(`⚠️ Image not found: ${fullPath}`)
    return null
  }

  // Validate that the file is an actual image or video by checking MIME type.
  let mimeType = null
  try {
    const fileTypeResult = await fileType.fileTypeFromFile(fullPath)
    mimeType = fileTypeResult?.mime
  } catch (e) {
    console.warn('Could not determine mime type for ', fullPath)
  }
  if (!mimeType || !(mimeType.startsWith('image/') || mimeType.startsWith('video/'))) {
    console.warn(`❌ ${imagePath} is not a valid image/video file (mime: ${mimeType})`)
    return null
  }

  if (!process.env.CLOUDINARY_CLOUD_NAME || !process.env.CLOUDINARY_API_KEY) {
    // Cloudinary not configured - return local path (so frontend can serve it during dev)
    return imagePath
  }

  try {
    console.log(`📎 Uploading ${imagePath} to Cloudinary...`)
    // Add basic retry/backoff logic
    const maxAttempts = 3
    let attempt = 0
    const resourceType = mimeType.startsWith('video/') ? 'video' : 'image'
    while (attempt < maxAttempts) {
      try {
        const result = await cloudinary.uploader.upload(fullPath, {
          folder: folder,
          use_filename: true,
          unique_filename: true,
          resource_type: resourceType
        })
        console.log(`✅ Uploaded successfully: ${result.secure_url}`)
        return result.secure_url
      } catch (err) {
        attempt += 1
        console.warn(`Upload attempt ${attempt} failed for ${imagePath}:`, err.message || err)
        if (attempt >= maxAttempts) {
          console.error(`❌ Failed to upload ${imagePath} after ${maxAttempts} attempts`)
          throw err
        }
        // exponential backoff
        await new Promise(r => setTimeout(r, 200 * Math.pow(2, attempt)))
      }
    }
  } catch (error) {
    // If Cloudinary is configured and upload fails, fail fast to avoid inconsistent seed state
    console.error(`❌ Error uploading ${imagePath}:`, error.message || error)
    throw error
  }
}

// ✅ Seeding Function
const seedDatabase = async () => {
  if (!DRY_RUN) {
    await connectDB();
  } else {
    console.log('⚠️ Running in DRY_RUN mode - skipping DB connection')
  }

  try {
    if (!DRY_RUN) {
      await Product.deleteMany();
      await Category.deleteMany();
      console.log("🗑️ Cleared old data!");
      var createdCategories = await Category.insertMany(categories);
      console.log("🏷️ Categories created!");
    } else {
      console.log('⚠️ Running in DRY_RUN mode - no DB writes will be performed')
      var createdCategories = categories.map((c, i) => ({ ...c, _id: `dry-${i}` }))
    }

    const products = [];
  console.log("\n🖼️ Starting image upload process...\n");

  for (const cat of createdCategories) {
      // Determine images for this category. Priority:
      // 1) parsedSeed.localImagesByCategory mapping (by slug or name)
      // 2) scan frontend images folder for matching files
      // 3) legacy localImagesByCategory defaults
      let localImages = [];

      if (parsedSeed && parsedSeed.localImagesByCategory) {
        const map = parsedSeed.localImagesByCategory
        const bySlug = map[cat.slug] || map[cat.slug?.toLowerCase()]
        const byName = map[cat.name] || map[cat.name?.toLowerCase()]
        if (Array.isArray(bySlug) && bySlug.length) localImages = bySlug
        else if (Array.isArray(byName) && byName.length) localImages = byName
      }

      if (!localImages || localImages.length === 0) {
        localImages = getImagesForCategory(cat)
      }

      if (!localImages || localImages.length === 0) {
        localImages = localImagesByCategory[cat.name] || localImagesByCategory[cat.slug] || []
      }

      console.log(`\n📚 Processing category: ${cat.name} (${localImages.length} images)`);

      // For manifest building
      const usedMediaForCategory = []

      // Create one product per media file so each image/video is used
      for (let index = 0; index < localImages.length; index++) {
        const imagePath = localImages[index]
        const basePrice = Math.floor(Math.random() * 15000) + 5000

        // create a name from file and category for uniqueness
        const fileBase = path.basename(imagePath, path.extname(imagePath)).replace(/[-_]/g, ' ')
        const name = `${cat.name.endsWith('s') ? cat.name.slice(0, -1) : cat.name} ${fileBase}`

        // Upload media to Cloudinary if configured
        let mediaUrl = imagePath
        if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
          const uploaded = await uploadImageToCloudinary(imagePath, `erica-spanks/${cat.slug}`)
          if (uploaded) mediaUrl = uploaded
        }

        // collect for manifest
        if (mediaUrl) usedMediaForCategory.push(mediaUrl)

        // generate variations and attach this media as the image for variations
        let variations = generateVariations(basePrice, cat.name, index)
        variations = variations.map(v => {
          v.images = [{ url: mediaUrl, alt: `${cat.name} Variation`, isPrimary: true }]
          return v
        })

        products.push({
          name,
          slug: `${name.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString().slice(-5)}-${index}`,
          description: `Introducing the ${name} from our ${cat.name} collection. Crafted with premium fabrics and designed for the confident, modern woman. This piece combines style and comfort, making it perfect for any occasion.`,
          shortDescription: `Stylish and comfortable ${cat.name.toLowerCase()} designed for confident women.`,
          category: cat._id,
          tags: [cat.slug || cat.name.toLowerCase().replace(/\s+/g, '-'), cat.name.toLowerCase(), 'fashion', 'women', 'clothing', 'style', 'erica-spanks'],
          brand: 'Erica Spanks',
          media: [mediaUrl],
          images: [mediaUrl],
          variations,
          features: [
            'Premium quality fabric',
            'Comfortable and breathable',
            'Flattering fit',
            'Easy care - Machine washable',
            'Perfect for any occasion'
          ],
          materials: [
            { name: 'Cotton', percentage: 70 },
            { name: 'Polyester', percentage: 25 },
            { name: 'Elastane', percentage: 5 }
          ],
          careInstructions: [
            'Machine wash cold with like colors',
            'Tumble dry low',
            'Do not bleach',
            'Iron on low heat if needed',
            'Do not dry clean'
          ],
          isActive: true,
          isFeatured: index < 2,
          isNew: index < 3,
          visibility: 'public',
          seo: {
            title: `${name} | Erica Spanks - Confident Women's Fashion`.substring(0, 60),
            description: `Shop ${name} from Erica Spanks. ${cat.description} Free shipping on orders over ₦10,000.`,
            keywords: [cat.name.toLowerCase(), 'fashion', 'women', 'clothing', 'style', 'erica-spanks']
          }
        })
      }

      // attach usedMediaForCategory to createdCategories for manifest after loop
      cat._usedMedia = (cat._usedMedia || []).concat(usedMediaForCategory)
    }

    // Build and write media manifest mapping category slug -> media URLs
    try {
      const manifest = {}
      for (const c of createdCategories) {
        const slug = c.slug || c.name.toLowerCase().replace(/\s+/g, '-')
        manifest[slug] = Array.from(new Set((c._usedMedia || []).filter(Boolean)))
      }
      // ensure frontend public exists and write manifest there (served by dev server)
      const frontendPublic = path.join(__dirname, '../frontend/public')
      if (!fs.existsSync(frontendPublic)) fs.mkdirSync(frontendPublic, { recursive: true })
      const manifestPath = path.join(frontendPublic, 'media-manifest.json')
      fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
      console.log('Wrote media manifest to:', manifestPath)
    } catch (err) {
      console.warn('Failed to write media manifest:', err)
    }

    if (!DRY_RUN) {
      await Product.insertMany(products);
      console.log(`\n🎉 Successfully inserted ${products.length} products into the database!`);
      console.log(`\n👍 Seeding completed! You can now start your server.\n`);
    } else {
      console.log(`\nℹ️ DRY_RUN: Prepared ${products.length} products (no DB write).`)
      console.log(`\n👍 DRY_RUN completed! No changes were written to the database.\n`);
    }

  } catch (error) {
    console.error("❌ Seeding error:", error);
    process.exit(1);
  } finally {
    try {
      if (!DRY_RUN) {
        await mongoose.connection.close();
        console.log("🔌 Database connection closed.");
      }
    } catch (e) {
      // ignore
    }
  }
};

seedDatabase();