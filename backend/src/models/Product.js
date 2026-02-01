import mongoose from "mongoose";
import slugify from "slugify";

const reviewSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  rating: {
    type: Number,
    required: true,
    min: 1,
    max: 5
  },
  title: {
    type: String,
    required: true,
    trim: true,
    maxlength: 100
  },
  comment: {
    type: String,
    required: true,
    trim: true,
    maxlength: 1000
  },
  verified: {
    type: Boolean,
    default: false
  },
  helpful: {
    count: {
      type: Number,
      default: 0
    },
    users: [{
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }]
  }
}, {
  timestamps: true
});

const variationSchema = new mongoose.Schema({
  size: {
    type: String,
    required: true,
    enum: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL', 'XXXL']
  },
  color: {
    type: String,
    required: true,
    trim: true
  },
  colorCode: {
    type: String,
    required: true,
    trim: true,
    match: [/^#[0-9A-F]{6}$/i, 'Color code must be a valid hex code']
  },
  sku: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  barcode: {
    type: String,
    trim: true
  },
  price: {
    type: Number,
    required: true,
    min: 0
  },
  compareAtPrice: {
    type: Number,
    min: 0
  },
  inventory: {
    quantity: {
      type: Number,
      required: true,
      min: 0,
      default: 0
    },
    lowStockThreshold: {
      type: Number,
      default: 5
    },
    allowBackorder: {
      type: Boolean,
      default: false
    }
  },
  weight: {
    type: Number,
    required: true,
    min: 0
  },
  dimensions: {
    length: Number,
    width: Number,
    height: Number
  },
  images: [{
    url: {
      type: String,
      required: true
    },
    alt: {
      type: String,
      required: true
    },
    isPrimary: {
      type: Boolean,
      default: false
    }
  }]
});

const productSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Product name is required'],
    trim: true,
    maxlength: [200, 'Product name cannot exceed 200 characters']
  },
  slug: {
    type: String,
    required: true,
    unique: true,
    lowercase: true,
    trim: true
  },
  description: {
    type: String,
    required: [true, 'Product description is required'],
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  shortDescription: {
    type: String,
    trim: true,
    maxlength: [500, 'Short description cannot exceed 500 characters']
  },
  category: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category',
    required: true
  },
  subcategory: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Category'
  },
  occasions: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Occasion'
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  brand: {
    type: String,
    default: 'Erica Spanks',
    trim: true
  },
  // Media field from first schema - kept as backup for simple media storage
  media: [String], // Array of Cloudinary URLs
  
  variations: [variationSchema],
  features: [{
    type: String,
    trim: true
  }],
  materials: [{
    name: {
      type: String,
      required: true,
      trim: true
    },
    percentage: {
      type: Number,
      min: 0,
      max: 100
    }
  }],
  careInstructions: [{
    type: String,
    trim: true
  }],
  sizeGuide: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'SizeGuide'
  },
  collections: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Collection'
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isFeatured: {
    type: Boolean,
    default: false
  },
  isNew: {
    type: Boolean,
    default: true
  },
  onSale: {
    type: Boolean,
    default: false
  },
  stockStatus: {
    type: String,
    enum: ['in_stock', 'out_of_stock', 'low_stock', 'discontinued'],
    default: 'in_stock'
  },
  visibility: {
    type: String,
    enum: ['public', 'hidden', 'password'],
    default: 'public'
  },
  availableFrom: {
    type: Date,
    default: Date.now
  },
  availableUntil: Date,
  reviews: [reviewSchema],
  rating: {
    average: {
      type: Number,
      default: 0,
      min: 0,
      max: 5
    },
    count: {
      type: Number,
      default: 0
    }
  },
  sales: {
    totalSold: {
      type: Number,
      default: 0
    },
    revenue: {
      type: Number,
      default: 0
    }
  },
  seo: {
    title: {
      type: String,
      trim: true,
      maxlength: 60
    },
    description: {
      type: String,
      trim: true,
      maxlength: 160
    },
    keywords: [{
      type: String,
      trim: true,
      lowercase: true
    }]
  },
  relatedProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }],
  crossSellProducts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Product'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtuals
productSchema.virtual('inStock').get(function() {
  return this.variations.some(variation => variation.inventory.quantity > 0);
});

productSchema.virtual('minPrice').get(function() {
  if (this.variations.length === 0) return 0;
  return Math.min(...this.variations.map(v => v.price));
});

productSchema.virtual('maxPrice').get(function() {
  if (this.variations.length === 0) return 0;
  return Math.max(...this.variations.map(v => v.price));
});

productSchema.virtual('totalInventory').get(function() {
  return this.variations.reduce((total, variation) => total + variation.inventory.quantity, 0);
});

productSchema.virtual('primaryImage').get(function() {
  for (const variation of this.variations) {
    const primaryImg = variation.images.find(img => img.isPrimary);
    if (primaryImg) return primaryImg;
  }
  // Fallback to media field from first schema if no variation images
  if (this.media && this.media.length > 0) {
    return { url: this.media[0], alt: this.name, isPrimary: true };
  }
  return this.variations[0]?.images[0] || null;
});

// Backward compatibility virtual for simple stock checking
productSchema.virtual('stock').get(function() {
  return this.totalInventory;
});

// Indexes
productSchema.index({ name: 1 });
productSchema.index({ slug: 1 });
productSchema.index({ category: 1 });
productSchema.index({ tags: 1 });
productSchema.index({ isActive: 1, visibility: 1 });
productSchema.index({ 'variations.sku': 1 });
productSchema.index({ 'rating.average': -1 });
productSchema.index({ createdAt: -1 });
productSchema.index({ 'variations.price': 1 });
productSchema.index({ occasions: 1 });

// Text search index
productSchema.index({
  name: 'text',
  description: 'text',
  shortDescription: 'text',
  tags: 'text'
});

// 🧠 Auto-generate slug from name before validation using slugify
// Use `pre('validate')` so the slug is available during schema validation
productSchema.pre('validate', async function(next) {
  try {
    if (!this.slug && this.name) {
      let baseSlug = slugify(this.name, { lower: true, strict: true });
      let slug = baseSlug;
      let counter = 1;
      
      // Check if slug already exists (excluding current document if updating)
      while (true) {
        const query = { slug };
        
        // If this is an update (document has _id), exclude it from the check
        if (this._id) {
          query._id = { $ne: this._id };
        }
        
        const existingProduct = await this.constructor.findOne(query).select('_id').lean();
        
        if (!existingProduct) {
          // Slug is unique, use it
          break;
        }
        
        // Slug exists, try with a suffix
        slug = `${baseSlug}-${counter}`;
        counter++;
        
        // Safety check to prevent infinite loop
        if (counter > 1000) {
          throw new Error('Could not generate unique slug after 1000 attempts');
        }
      }
      
      this.slug = slug;
    }
  } catch (e) {
    // swallow slug generation errors and let validation handle missing slug
    console.error('Slug generation failed:', e);
  }
  next();
});

// Additional pre-save middleware for SEO fields and sale status
productSchema.pre('save', function(next) {
  // Auto-generate SEO fields if not provided
  if (!this.seo?.title) {
    if (!this.seo) this.seo = {};
    this.seo.title = this.name.substring(0, 60);
  }
  if (!this.seo?.description) {
    if (!this.seo) this.seo = {};
    this.seo.description = this.shortDescription?.substring(0, 160) || 
                           this.description.substring(0, 160);
  }
  
  // Update onSale based on variations
  this.onSale = this.variations.some(v => v.compareAtPrice && v.price < v.compareAtPrice);
  
  // Auto-update stock status
  this.updateStockStatus();
  
  next();
});

// Calculate average rating
productSchema.methods.calculateAverageRating = function() {
  if (this.reviews.length === 0) {
    this.rating.average = 0;
    this.rating.count = 0;
  } else {
    const sum = this.reviews.reduce((acc, review) => acc + review.rating, 0);
    this.rating.average = Number((sum / this.reviews.length).toFixed(1));
    this.rating.count = this.reviews.length;
  }
  return this.save();
};

// Get available sizes for a specific color
productSchema.methods.getAvailableSizes = function(color) {
  return this.variations
    .filter(v => v.color === color && v.inventory.quantity > 0)
    .map(v => v.size);
};

// Get available colors
productSchema.methods.getAvailableColors = function() {
  return [...new Set(this.variations
    .filter(v => v.inventory.quantity > 0)
    .map(v => ({ name: v.color, code: v.colorCode }))
  )];
};

// Check if product is on sale
productSchema.methods.isOnSale = function() {
  return this.variations.some(v => v.compareAtPrice && v.price < v.compareAtPrice);
};

// Get discount percentage
productSchema.methods.getDiscountPercentage = function() {
  const variation = this.variations.find(v => v.compareAtPrice && v.price < v.compareAtPrice);
  if (!variation) return 0;
  return Math.round(((variation.compareAtPrice - variation.price) / variation.compareAtPrice) * 100);
};

// Static method to find featured products
productSchema.statics.findFeatured = function() {
  return this.find({ isFeatured: true, isActive: true, visibility: 'public' });
};

// Update stock status based on inventory
productSchema.methods.updateStockStatus = function() {
  if (!this.isActive) {
    this.stockStatus = 'discontinued';
    return;
  }

  const totalInventory = this.totalInventory;
  const hasStock = this.inStock;
  const lowStockThreshold = Math.min(...this.variations.map(v => v.inventory.lowStockThreshold || 5));
  
  if (totalInventory === 0) {
    this.stockStatus = 'out_of_stock';
  } else if (totalInventory <= lowStockThreshold) {
    this.stockStatus = 'low_stock';
  } else {
    this.stockStatus = 'in_stock';
  }
  
  return this.stockStatus;
};

// Check if product can be ordered
productSchema.methods.canBeOrdered = function() {
  return this.isActive && 
         this.visibility === 'public' && 
         this.stockStatus !== 'out_of_stock' && 
         this.stockStatus !== 'discontinued';
};

// Static method to find new arrivals
productSchema.statics.findNewArrivals = function() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  return this.find({ 
    isActive: true, 
    visibility: 'public',
    createdAt: { $gte: thirtyDaysAgo }
  });
};

const Product = mongoose.model("Product", productSchema);
export default Product;