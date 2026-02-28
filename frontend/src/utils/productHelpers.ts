export interface Product {
  _id: string
  name: string
  price: number
  originalPrice?: number
  images: string[]
  colors?: string[]
  sizes?: string[]
  rating?: number
  reviewCount?: number
  isNew?: boolean
  isSale?: boolean
  category: string | { _id: string; name: string }
  description?: string
  slug: string
  inStock?: boolean
  featured?: boolean
  tags?: string[]
}

export const normalizeProduct = (productData: any): Product => {
  return {
    _id: productData._id || productData.id || '',
    name: productData.name || 'Unnamed Product',
    price: Number(productData.price) || 0,
    originalPrice: productData.originalPrice ? Number(productData.originalPrice) : undefined,
    images: Array.isArray(productData.images) 
      ? productData.images 
      : [productData.image || '/placeholder-product.png'],
    colors: Array.isArray(productData.colors) ? productData.colors : [],
    sizes: Array.isArray(productData.sizes) ? productData.sizes : [],
    rating: Number(productData.rating) || 0,
    reviewCount: Number(productData.reviewCount) || 0,
    isNew: Boolean(productData.isNew),
    isSale: Boolean(productData.isSale),
    category: productData.category || 'Uncategorized',
    description: productData.description || '',
    slug: productData.slug || productData._id || '',
    inStock: productData.inStock !== undefined ? Boolean(productData.inStock) : true,
    featured: Boolean(productData.featured),
    tags: Array.isArray(productData.tags) ? productData.tags : [],
  }
}

export const getCategoryName = (category: string | { _id: string; name: string }): string => {
  if (typeof category === 'string') {
    return category
  }
  return category?.name || 'Uncategorized'
}

const extractImageUrl = (img: any): string | null => {
  if (!img) return null
  if (typeof img === 'string') return img
  if (typeof img === 'object') {
    // common top-level keys
    const candidates = [
      'url', 'secure_url', 'src', 'path', 'publicUrl', 'public_id', 'publicId', 'secureUrl'
    ]
    for (const key of candidates) {
      if (img[key] && typeof img[key] === 'string') return img[key]
    }

    // common nested shapes
    if (img.fields && img.fields.file && typeof img.fields.file.url === 'string') return img.fields.file.url
    if (img.file && typeof img.file.url === 'string') return img.file.url
    if (img.attributes && typeof img.attributes.url === 'string') return img.attributes.url
    if (img.image && typeof img.image.url === 'string') return img.image.url

    // arrays or first-string property fallback
    if (Array.isArray(img) && img.length > 0) {
      const first = img[0]
      if (typeof first === 'string') return first
      if (typeof first === 'object') return extractImageUrl(first)
    }

    // last resort: find first string property that looks like a URL
    for (const k of Object.keys(img)) {
      const v = img[k]
      if (typeof v === 'string' && /^(https?:)?\/\//.test(v)) return v
    }
  }
  return null
}

export const getMainImage = (product: Product): string => {
  if (Array.isArray(product.images) && product.images.length > 0) {
    const first: any = product.images[0]
    const url = extractImageUrl(first)
    if (url) return url
  }
  return '/placeholder-product.svg'
}

/**
 * Get the best available product image based on variation stock status
 * If the first image corresponds to an out-of-stock variation (e.g., a color),
 * return the image of the first in-stock variation instead
 */
export const getBestAvailableImage = (product: any): string => {
  // If no variations, return main image
  if (!product.variations || product.variations.length === 0) {
    return getMainImage(product)
  }

  // Get the main/primary image to check its color
  const mainImageUrl = getMainImage(product)
  
  // Try to find the first variation with stock and use its image
  const inStockVariation = product.variations.find((v: any) => {
    const quantity = v.inventory?.quantity || 0
    return quantity > 0
  })

  // If we found an in-stock variation, prefer its image
  if (inStockVariation && inStockVariation.images && inStockVariation.images.length > 0) {
    const variationImageUrl = extractImageUrl(inStockVariation.images[0])
    if (variationImageUrl) {
      return variationImageUrl
    }
  }

  // Fallback to main image
  return mainImageUrl
}

/**
 * Get the best initial color to display for a product
 * Prefers the first in-stock color if available
 */
export const getBestInitialColor = (product: any): string => {
  if (!product.variations || product.variations.length === 0) {
    return ''
  }

  // Try to find the first in-stock variation
  const inStockVariation = product.variations.find((v: any) => {
    const quantity = v.inventory?.quantity || 0
    return quantity > 0
  })

  return inStockVariation?.color || ''
}

export const calculateDiscount = (price: number, originalPrice?: number): number => {
  if (!originalPrice || originalPrice <= price) return 0
  return Math.round(((originalPrice - price) / originalPrice) * 100)
}

export const validateProduct = (product: any) => {
    if (!product) return null;
    
    // Normalize images array: collect from common locations (images, image, media, variations[*].images)
    const rawImages: any[] = []
    if (Array.isArray(product.images)) rawImages.push(...product.images)
    if (product.image) rawImages.push(product.image)
    if (product.media && Array.isArray(product.media)) rawImages.push(...product.media)
    if (product.photos && Array.isArray(product.photos)) rawImages.push(...product.photos)
    if (product.assets && Array.isArray(product.assets)) rawImages.push(...product.assets)
    if (product.gallery && Array.isArray(product.gallery)) rawImages.push(...product.gallery)
    // variations may contain images arrays (objects with url)
    if (product.variations && Array.isArray(product.variations)) {
      for (const v of product.variations) {
        if (!v) continue
        if (Array.isArray(v.images)) rawImages.push(...v.images)
        if (v.image) rawImages.push(v.image)
      }
    }

    const images: string[] = rawImages.map((img: any) => {
      const extracted = extractImageUrl(img)
      return extracted || '/placeholder-product.svg'
    }).filter(Boolean).map((i: any) => i || '/placeholder-product.svg')

    return {
      _id: product._id || product.id || '',
      id: product.id || product._id || '',
      name: product.name || 'Unnamed Product',
      // prefer top-level price, otherwise use first variation's price when available
      price: Number(product.price) || (product.variations && Array.isArray(product.variations) && Number(product.variations[0]?.price)) || 0,
      originalPrice: product.originalPrice ? Number(product.originalPrice) : undefined,
  image: images[0] || product.image || '/placeholder-product.svg',
      images,
      colors: Array.isArray(product.colors) ? product.colors : [],
      sizes: Array.isArray(product.sizes) ? product.sizes : [],
      rating: Number(product.rating) || 0,
      reviewCount: Number(product.reviewCount) || 0,
      isNew: Boolean(product.isNew),
      isSale: Boolean(product.isSale),
      category: product.category || 'Uncategorized',
      description: product.description || '',
      slug: product.slug || product._id || product.id || '',
      inStock: product.inStock !== undefined ? Boolean(product.inStock) : true,
      featured: Boolean(product.featured),
      tags: Array.isArray(product.tags) ? product.tags : [],
    };
  };
  
  export const formatPrice = (price: number | string | undefined): string => {
    if (price === undefined || price === null) return '₦0.00';

    // If price is already a number, use it. If it's a string, try to extract numeric value.
    let num: number
    if (typeof price === 'number') {
      num = price
    } else {
      // Remove any currency symbols or non-numeric characters except dot and minus
      const cleaned = String(price).replace(/[^0-9.\-]/g, '')
      num = parseFloat(cleaned)
    }

    if (!isFinite(num) || isNaN(num)) return '₦0.00'

    // Format with thousands separators and two decimals, using Naira symbol
    try {
      return `₦${num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
    } catch (e) {
      return `₦${num.toFixed(2)}`
    }
  }