import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { ArrowRight, Mail, RefreshCw } from 'lucide-react'
import ProductCard from '../components/product/ProductCard'
import Carousel from '../components/ui/Carousel'
import { productAPI, contactAPI } from '../services/api'
import { Product, normalizeProduct, validateProduct } from '../utils/productHelpers'

// Import local videos
import fashionVideo1 from '../images/fashionvideo1.mp4'
import fashionVideo2 from '../images/fashionvideo2.mp4'
import blazerVideo from '../images/blazers.mp4'

// Types
type ProductType = Product

// Styled Components
const HomeContainer = styled.div`
  width: 100%;
  overflow-x: hidden;
`

// Hero Section
const HeroSection = styled.section`
  position: relative;
  height: 80vh;
  min-height: 500px;
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  overflow: hidden;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    height: 90vh;
    min-height: 600px;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 60vh;
    min-height: 320px;
  }
`

const HeroMedia = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 0;
  overflow: hidden;
`

const HeroVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const HeroContent = styled.div`
  max-width: 900px;
  z-index: 2;
  padding: 0 ${({ theme }) => theme.spacing.md};
  display: flex;
  flex-direction: column;
  align-items: flex-start;
  text-align: left;
  position: absolute;
  left: 1rem;
  bottom: 1.75rem;
  gap: ${({ theme }) => theme.spacing.sm};

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    left: 6%;
    top: 50%;
    bottom: auto;
    transform: translateY(-50%);
    padding: 0 ${({ theme }) => theme.spacing.lg};
  }

  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    left: 8%;
    max-width: 700px;
  }
`

const HeroTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  color: ${({ theme }) => theme.colors.black};
  margin: 0;
  letter-spacing: -1px;
  line-height: 1;
  display: inline-block;
  background: rgba(255,255,255,0.65);
  padding: 0.125rem 0.5rem;
  border-radius: 6px;
  transform: rotate(-1.5deg);

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes['5xl']};
    transform: none;
    background: transparent;
    padding: 0;
  }
`

const HeroTagline = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  margin: 0;
  margin-top: ${({ theme }) => theme.spacing.xs};
  font-style: italic;
  transform: rotate(1deg) translateX(0);
  background: rgba(255,255,255,0.6);
  padding: 0.125rem 0.5rem;
  border-radius: 6px;

  @media (min-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    background: transparent;
    transform: translateX(6px) rotate(0.5deg);
    margin-top: ${({ theme }) => theme.spacing.md};
  }
`

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.darkGray};
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`

const CTAButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing['2xl']};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 1px;
  text-decoration: none;
  transition: ${({ theme }) => theme.transitions.normal};
  min-width: 200px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-3px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`

// Featured Collections Section
const CollectionsSection = styled.section`
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.md};
  }
`

const SectionTitle = styled.h2`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.black};
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`

const CollectionsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: repeat(4, 1fr);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`

const CollectionsCarouselContainer = styled.div`
  display: none;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
  }
`

const CollectionCard = styled(Link)`
  position: relative;
  height: 400px;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  text-decoration: none;
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
`

const CollectionImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

const CollectionOverlay = styled.div`
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background: linear-gradient(transparent, rgba(0,0,0,0.7));
  padding: ${({ theme }) => theme.spacing['2xl']};
  color: ${({ theme }) => theme.colors.white};
`

const CollectionTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

// Runway Section
const RunwaySection = styled.section`
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.cream};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.md};
  }
`

const RunwayContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  text-align: center;
`

const RunwayVideo = styled.video`
  width: 100%;
  height: 500px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    height: 300px;
  }
`

const RunwayTitle = styled.h3`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const RunwayText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.darkGray};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  max-width: 600px;
  margin: 0 auto;
`

// Lookbook Section
const LookbookSection = styled.section`
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.lg};
  max-width: 1200px;
  margin: 0 auto;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.md};
  }
`

const LookbookGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`

const LookbookCarouselContainer = styled.div`
  display: none;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: block;
  }
`

const LookbookItem = styled.div`
  text-align: center;
`

const LookbookImage = styled.img`
  width: 100%;
  height: 400px;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const LookbookCaption = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.darkGray};
  font-style: italic;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`

// Featured Products Section
const ProductsSection = styled.section`
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.lightGray};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.md};
  }
`

const ProductsContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
`

const ProductsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${({ theme }) => theme.spacing.lg};
  margin-bottom: ${({ theme }) => theme.spacing['3xl']};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: repeat(6, 1fr);
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(2, 1fr);
    gap: ${({ theme }) => theme.spacing.md};
  }
`

// Story Section
const StorySection = styled.section`
  padding: ${({ theme }) => theme.spacing['4xl']} ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.md};
  }
`

const StoryContainer = styled.div`
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
`

const StoryText = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.darkGray};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

// Newsletter Section
const NewsletterSection = styled.section`
  padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing.lg};
  background: ${({ theme }) => theme.colors.white};
`

const NewsletterContainer = styled.div`
  max-width: 600px;
  margin: 0 auto;
  text-align: center;
`

const NewsletterForm = styled.form`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
  }
`

const EmailInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.lg};
  border: 2px solid ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const SubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }

  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 100%;
    padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  }
`

// Loading and Error States
const LoadingState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  color: ${({ theme }) => theme.colors.darkGray};
`

const ErrorState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing.xl};
  color: ${({ theme }) => theme.colors.error};
  background: ${({ theme }) => theme.colors.errorLight};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  margin: ${({ theme }) => theme.spacing.xl} 0;
`

const RetryButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  margin-top: ${({ theme }) => theme.spacing.md};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
  }
`

// Hero Video Component
const HeroVideoPlayer: React.FC = () => {
  const [currentMediaIndex, setCurrentMediaIndex] = useState(0)
  
  const heroMedia = [
    fashionVideo2,
    blazerVideo
   ]

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentMediaIndex((prev) => (prev + 1) % heroMedia.length)
    }, 18000) // 18 seconds

    return () => clearInterval(interval)
  }, [])

  const currentMedia = heroMedia[currentMediaIndex]
  const isVideo = typeof currentMedia === 'string' && /\.(mp4|webm|ogg)$/i.test(currentMedia)

  return (
    <HeroMedia>
      {isVideo ? (
        <HeroVideo
          src={currentMedia}
          autoPlay
          muted
          loop
          playsInline
        />
      ) : (
        <CollectionImage src={currentMedia} alt="Hero" />
      )}
    </HeroMedia>
  )
}

// Mock data
// Mock data removed - all data loaded from API

const Home: React.FC = () => {
  const [email, setEmail] = useState('')
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mediaManifest, setMediaManifest] = useState<Record<string, string[]>>({})
  const [newsletterLoading, setNewsletterLoading] = useState(false)
  const [newsletterMessage, setNewsletterMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null)

  // Robust transform: validate and sanitize incoming product objects for UI
  // Uses `mediaManifest` (fetched from /media-manifest.json) to patch missing images.
  const transformProductData = (data: any): Product => {
    // First try the full validator which extracts image URLs into an array
    const validated = validateProduct(data) || normalizeProduct(data)

    // If validation produced only a placeholder image, attempt to extract alternate image fields
  const firstImage = (validated && Array.isArray(validated.images) && validated.images[0]) || ''
  // Treat missing/empty image or placeholder as needing extraction
  const looksLikePlaceholder = !firstImage || (typeof firstImage === 'string' && firstImage.includes('placeholder'))

    if (looksLikePlaceholder) {
      // try common alternative locations in the raw data (including variations)
      const candidates: any[] = []
      if (data.image) candidates.push(data.image)
      if (data.thumbnail) candidates.push(data.thumbnail)
      if (data.primaryImage) candidates.push(data.primaryImage)
      if (data.media && Array.isArray(data.media)) candidates.push(...data.media)
      if (data.photos && Array.isArray(data.photos)) candidates.push(...data.photos)
      if (data.assets && Array.isArray(data.assets)) candidates.push(...data.assets)
      if (data.gallery && Array.isArray(data.gallery)) candidates.push(...data.gallery)
      // handle API products that place images under variations: [{ images: [...] }]
      if (data.variations && Array.isArray(data.variations)) {
        for (const v of data.variations) {
          if (v && Array.isArray(v.images)) {
            // push each image entry (could be string or object)
            candidates.push(...v.images)
          }
          // also support variation.image or variation.primaryImage
          if (v && v.image) candidates.push(v.image)
        }
        // also consider top variation's first image
        const topVar = data.variations[0]
        if (topVar) {
          if (Array.isArray(topVar.images) && topVar.images.length > 0) candidates.push(topVar.images[0])
          if (topVar.image) candidates.push(topVar.image)
        }
      }

      // pick the first candidate that is a string url or has a url/src property
      const pickUrl = (c: any): string | null => {
        if (!c) return null
        if (typeof c === 'string' && /^(https?:)?\/\//.test(c)) return c
        if (typeof c === 'string' && c.startsWith('/')) return c
        if (typeof c === 'object') {
          if (typeof c.url === 'string' && c.url) return c.url
          if (typeof c.src === 'string' && c.src) return c.src
          if (typeof c.secure_url === 'string' && c.secure_url) return c.secure_url
          if (typeof c.path === 'string' && c.path) return c.path
          if (typeof c.publicUrl === 'string' && c.publicUrl) return c.publicUrl
          // nested formats e.g. formats.small.url
          if (c.formats && typeof c.formats === 'object') {
            const fmt = c.formats.small || c.formats.thumbnail || Object.values(c.formats)[0]
            if (fmt && typeof fmt.url === 'string') return fmt.url
          }
        }
        return null
      }

      for (const cand of candidates) {
        const url = pickUrl(cand)
        if (url) {
          validated.images = [url, ...(validated.images || []).slice(1)]
          break
        }
      }
      // If we still don't have a usable URL, try the media manifest by category/slug/name
      const firstAfterCandidates = (validated && Array.isArray(validated.images) && validated.images[0]) || ''
      if ((!firstAfterCandidates || String(firstAfterCandidates).includes('placeholder')) && mediaManifest && Object.keys(mediaManifest).length > 0) {
        const manifestKeys = Object.keys(mediaManifest)
        const slugify = (s: string) => String(s || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '')

        // Build candidate tokens from product (category name, slug, name, tags)
        const tokens = new Set<string>()
        const rawCategory = (validated && typeof validated.category === 'string') ? validated.category : (validated && (validated.category as any)?.name) || ''
        if (rawCategory) tokens.add(slugify(rawCategory))
        if ((validated as any).slug) tokens.add(slugify((validated as any).slug))
        if (validated.name) tokens.add(slugify(validated.name))
        if (Array.isArray((validated as any).tags)) {
          (validated as any).tags.forEach((t: string) => tokens.add(slugify(t)))
        }

        // Try exact manifest key matches first
        let picked: string | null = null
        for (const t of Array.from(tokens)) {
          if (!t) continue
          if (mediaManifest[t] && mediaManifest[t].length > 0) {
            picked = mediaManifest[t][0]
            break
          }
        }

        // Try looser matching: manifest keys that contain token substrings
        if (!picked) {
          for (const key of manifestKeys) {
            const k = slugify(key)
            for (const t of Array.from(tokens)) {
              if (!t) continue
              if (k.includes(t) || t.includes(k)) {
                const arr = mediaManifest[key]
                if (arr && arr.length > 0) {
                  picked = arr[0]
                  break
                }
              }
            }
            if (picked) break
          }
        }

        // Try scanning manifest URLs for product slug/name tokens
        if (!picked) {
          const nameToken = slugify(validated.name || '')
          const slugToken = slugify((validated as any).slug || '')
          outer: for (const key of manifestKeys) {
            const arr = mediaManifest[key]
            if (!Array.isArray(arr)) continue
            for (const url of arr) {
              const u = String(url).toLowerCase()
              if ((nameToken && u.includes(nameToken)) || (slugToken && u.includes(slugToken))) {
                picked = url
                break outer
              }
            }
          }
        }

        // Final fallback: first available manifest image
        if (!picked) {
          for (const key of manifestKeys) {
            const arr = mediaManifest[key]
            if (Array.isArray(arr) && arr.length > 0) {
              picked = arr[0]
              break
            }
          }
        }

        if (picked) {
          validated.images = [picked, ...(validated.images || []).slice(1)]
        }
      }
    }

    return validated as Product
  }

  const loadFeaturedProducts = async () => {
    try {
      setLoading(true)
      setError(null)
      
      let response
      let productsData: any[] = []

      // Try to fetch the frontend media manifest (public/media-manifest.json) as a non-critical fallback
      try {
        const mf = await fetch('/media-manifest.json')
        if (mf.ok) {
          try {
            const json = await mf.json()
            setMediaManifest(json)
          } catch (e) {
            // ignore parse errors
          }
        }
      } catch (e) {
        // ignore fetch errors — manifest is optional
      }

      try {
        response = await productAPI.getFeaturedProducts()
        
        if (response && Array.isArray(response)) {
          productsData = response
        } else if (response?.data && Array.isArray(response.data)) {
          productsData = response.data
        } else if (response?.products && Array.isArray(response.products)) {
          productsData = response.products
        }
        
        console.log('[Home] Featured products response:', { response, productsData: productsData.length })
      } catch (featuredError) {
        console.warn('Featured products endpoint failed, trying regular products...', featuredError)
        
        try {
          response = await productAPI.getProducts({ limit: 6, featured: true })
          
          if (response && Array.isArray(response)) {
            productsData = response
          } else if (response?.data && Array.isArray(response.data)) {
            productsData = response.data
          } else if (response?.products && Array.isArray(response.products)) {
            productsData = response.products
          }
        } catch (productsError) {
          console.warn('Regular products endpoint also failed, using mock data...', productsError)
          throw new Error('All API endpoints failed')
        }
      }

      if (productsData.length > 0) {
        const transformedProducts = productsData.map((p) => transformProductData(p))
        // Filter out any items that don't have an id or slug (they are not real products)
        const validProducts = transformedProducts.filter((tp) => {
          const hasId = Boolean((tp as any)._id && String((tp as any)._id).trim())
          const hasSlug = Boolean(tp.slug && String(tp.slug).trim())
          if (!hasId && !hasSlug) {
            console.warn('Home: dropping invalid featured product (missing id/slug)', tp)
          }
          return hasId || hasSlug
        })
        // ensure unique, valid ids and images
        setFeaturedProducts(validProducts)
      } else {
        setFeaturedProducts([])
      }

    } catch (err) {
      console.error('Error loading featured products:', err)
      setError('Unable to load featured products at the moment.')
      setFeaturedProducts([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadFeaturedProducts()
  }, [])

  const handleNewsletterSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) {
      setNewsletterMessage({ type: 'error', text: 'Please enter a valid email address' })
      return
    }

    setNewsletterLoading(true)
    setNewsletterMessage(null)

    try {
      await contactAPI.subscribeNewsletter(email)
      setNewsletterMessage({ type: 'success', text: 'Thank you for subscribing to our newsletter!' })
      setEmail('')
    } catch (error) {
      console.error('Newsletter subscription error:', error)
      setNewsletterMessage({ 
        type: 'error', 
        text: 'Failed to subscribe. Please try again later.' 
      })
    } finally {
      setNewsletterLoading(false)
    }
  }

  const displayedProducts = featuredProducts.length > 0 ? featuredProducts : []

  return (
    <HomeContainer>
      {/* Hero Section */}
      <HeroSection>
        <HeroVideoPlayer />
        <HeroContent>
          <HeroTitle>ERICA SPANKS</HeroTitle>
          <HeroTagline>"Comfort that turns heads."</HeroTagline>
          <HeroSubtitle>
            Discover fashion that celebrates your confidence, embraces your comfort,
            and makes every moment feel extraordinary.
          </HeroSubtitle>
          <CTAButton to="/products">
            Shop Collection <ArrowRight size={18} />
          </CTAButton>
        </HeroContent>
      </HeroSection>
      
      {/* Featured Collections */}
      <CollectionsSection>
        <SectionTitle>Featured Collections</SectionTitle>
        <CollectionsGrid>
          <CollectionCard to="/products?sort=newest">
            <CollectionImage 
              src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501832/erica-spanks/undefined/Dress_waw3fm.jpg" 
              alt="New Arrivals" 
            />
            <CollectionOverlay>
              <CollectionTitle>New Arrivals</CollectionTitle>
              <p>Fresh styles that define confidence</p>
            </CollectionOverlay>
          </CollectionCard>
          
          <CollectionCard to="/products?sort=popular">
            <CollectionImage 
              src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501837/erica-spanks/undefined/Top_onrpuu.jpg" 
              alt="Best Sellers" 
            />
            <CollectionOverlay>
              <CollectionTitle>Best Sellers</CollectionTitle>
              <p>Customer favorites that never disappoint</p>
            </CollectionOverlay>
          </CollectionCard>
          
          <CollectionCard to="/products?category=sets">
            <CollectionImage 
              src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501853/erica-spanks/undefined/Two-piece_lydbu8.jpg" 
              alt="Sets" 
            />
            <CollectionOverlay>
              <CollectionTitle>Sets</CollectionTitle>
              <p>Perfectly coordinated outfits</p>
            </CollectionOverlay>
          </CollectionCard>
          
          <CollectionCard to="/products?category=dresses">
            <CollectionImage 
              src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501834/erica-spanks/undefined/Dress2_abmlyn.jpg" 
              alt="Dresses" 
            />
            <CollectionOverlay>
              <CollectionTitle>Dresses</CollectionTitle>
              <p>Elegant styles for every occasion</p>
            </CollectionOverlay>
          </CollectionCard>
        </CollectionsGrid>
        
        <CollectionsCarouselContainer>
          <Carousel
            items={[
              <CollectionCard key="new" to="/products?sort=newest">
                <CollectionImage 
                  src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501832/erica-spanks/undefined/Dress_waw3fm.jpg" 
                  alt="New Arrivals" 
                />
                <CollectionOverlay>
                  <CollectionTitle>New Arrivals</CollectionTitle>
                  <p>Fresh styles that define confidence</p>
                </CollectionOverlay>
              </CollectionCard>,
              <CollectionCard key="popular" to="/products?sort=popular">
                <CollectionImage 
                  src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501837/erica-spanks/undefined/Top_onrpuu.jpg" 
                  alt="Best Sellers" 
                />
                <CollectionOverlay>
                  <CollectionTitle>Best Sellers</CollectionTitle>
                  <p>Customer favorites that never disappoint</p>
                </CollectionOverlay>
              </CollectionCard>,
              <CollectionCard key="sets" to="/products?category=sets">
                <CollectionImage 
                  src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501853/erica-spanks/undefined/Two-piece_lydbu8.jpg" 
                  alt="Sets" 
                />
                <CollectionOverlay>
                  <CollectionTitle>Sets</CollectionTitle>
                  <p>Perfectly coordinated outfits</p>
                </CollectionOverlay>
              </CollectionCard>,
              <CollectionCard key="dresses" to="/products?category=dresses">
                <CollectionImage 
                  src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501834/erica-spanks/undefined/Dress2_abmlyn.jpg" 
                  alt="Dresses" 
                />
                <CollectionOverlay>
                  <CollectionTitle>Dresses</CollectionTitle>
                  <p>Elegant styles for every occasion</p>
                </CollectionOverlay>
              </CollectionCard>
            ]}
            enableSwipe={true}
          />
        </CollectionsCarouselContainer>
      </CollectionsSection>
      
      {/* Runway Section */}
      <RunwaySection>
        <RunwayContainer>
          <SectionTitle>Runway Collection</SectionTitle>
          <RunwayVideo
            src={fashionVideo1}
            autoPlay
            muted
            loop
            playsInline
          />
          <RunwayTitle>Where Style Meets Movement</RunwayTitle>
          <RunwayText>
            Experience the fluidity of fashion in motion. Our runway collection brings 
            together dynamic designs that celebrate the art of dressing with intention 
            and confidence.
          </RunwayText>
        </RunwayContainer>
      </RunwaySection>
      
      {/* Lookbook Section */}
      <LookbookSection>
        <SectionTitle>Style Inspiration</SectionTitle>
        <LookbookGrid>
          <LookbookItem>
            <LookbookImage 
              src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501853/erica-spanks/undefined/Two-piece2_ekz4s7.jpg" 
              alt="Casual Elegance" 
            />
            <LookbookCaption>
              "Embrace effortless style that transitions seamlessly from day to night."
            </LookbookCaption>
          </LookbookItem>
          
          <LookbookItem>
            <LookbookImage 
              src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501853/erica-spanks/undefined/Two-piece3_ii4cvw.jpg" 
              alt="Modern Sophistication" 
            />
            <LookbookCaption>
              "Redefine your confidence with pieces that speak to your unique journey."
            </LookbookCaption>
          </LookbookItem>
          
          <LookbookItem>
            <LookbookImage 
              src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501863/erica-spanks/undefined/Lounge_apskzs.jpg" 
              alt="Comfort First" 
            />
            <LookbookCaption>
              "Luxury isn't just about appearance—it's about how you feel in every moment."
            </LookbookCaption>
          </LookbookItem>
        </LookbookGrid>
        
        <LookbookCarouselContainer>
          <Carousel
            items={[
              <LookbookItem key="casual">
                <LookbookImage 
                  src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501853/erica-spanks/undefined/Two-piece2_ekz4s7.jpg" 
                  alt="Casual Elegance" 
                />
                <LookbookCaption>
                  "Embrace effortless style that transitions seamlessly from day to night."
                </LookbookCaption>
              </LookbookItem>,
              <LookbookItem key="modern">
                <LookbookImage 
                  src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501853/erica-spanks/undefined/Two-piece3_ii4cvw.jpg" 
                  alt="Modern Sophistication" 
                />
                <LookbookCaption>
                  "Redefine your confidence with pieces that speak to your unique journey."
                </LookbookCaption>
              </LookbookItem>,
              <LookbookItem key="comfort">
                <LookbookImage 
                  src="https://res.cloudinary.com/dtnyez4fk/image/upload/v1761501863/erica-spanks/undefined/Lounge_apskzs.jpg" 
                  alt="Comfort First" 
                />
                <LookbookCaption>
                  "Luxury isn't just about appearance—it's about how you feel in every moment."
                </LookbookCaption>
              </LookbookItem>
            ]}
            enableSwipe={true}
          />
        </LookbookCarouselContainer>
      </LookbookSection>
      
      {/* Featured Products */}
      <ProductsSection>
        <ProductsContainer>
          <SectionTitle>Featured Products</SectionTitle>
          
          {loading && (
            <LoadingState>
              <RefreshCw size={24} style={{ animation: 'spin 1s linear infinite', marginBottom: '1rem' }} />
              <div>Loading featured products...</div>
            </LoadingState>
          )}
          
          {error && (
            <ErrorState>
              {error}
              <br />
              <RetryButton onClick={loadFeaturedProducts}>
                <RefreshCw size={16} />
                Try Again
              </RetryButton>
            </ErrorState>
          )}
          
          {!loading && displayedProducts.length > 0 && (
            <>
              <ProductsGrid>
                    {displayedProducts.map((product, idx) => (
                      <ProductCard
                        key={product._id || product.id || product.slug || product.name || idx}
                        product={product}
                        variant="compact"
                      />
                    ))}
              </ProductsGrid>
                  {/* dev diagnostic panel removed */}
              <div style={{ textAlign: 'center' }}>
                <CTAButton to="/products">
                  View All Products <ArrowRight size={18} />
                </CTAButton>
              </div>
            </>
          )}

          {!loading && displayedProducts.length === 0 && !error && (
            <ErrorState>
              No featured products available at the moment.
              <br />
              <CTAButton to="/products">
                View All Products <ArrowRight size={18} />
              </CTAButton>
            </ErrorState>
          )}
        </ProductsContainer>
      </ProductsSection>
      
      {/* Story Section */}
      <StorySection>
        <StoryContainer>
          <SectionTitle>Our Story</SectionTitle>
          <StoryText>
            Erica Spanks was born from a simple belief: every woman deserves to feel 
            confident, comfortable, and unstoppable in what she wears. We create pieces 
            that celebrate your unique beauty while ensuring you feel amazing all day long.
          </StoryText>
          <StoryText>
            From our carefully selected fabrics to our attention to fit, every detail 
            is designed with you in mind.
          </StoryText>
          <CTAButton to="/about">
            Learn More <ArrowRight size={18} />
          </CTAButton>
        </StoryContainer>
      </StorySection>
      
      {/* Newsletter Section */}
      <NewsletterSection>
        <NewsletterContainer>
          <SectionTitle>Stay in Touch</SectionTitle>
          <StoryText>
            Be the first to know about new arrivals, exclusive offers, and style tips 
            straight from our team.
          </StoryText>
          <NewsletterForm onSubmit={handleNewsletterSubmit}>
            <EmailInput
              type="email"
              placeholder="Enter your email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={newsletterLoading}
            />
            <SubmitButton type="submit" disabled={newsletterLoading}>
              <Mail size={18} />
              {newsletterLoading ? 'Subscribing...' : 'Subscribe'}
            </SubmitButton>
          </NewsletterForm>
          {newsletterMessage && (
            newsletterMessage.type === 'success' ? (
              <div style={{ color: 'green', marginTop: '1rem' }}>{newsletterMessage.text}</div>
            ) : (
              <div style={{ color: 'red', marginTop: '1rem' }}>{newsletterMessage.text}</div>
            )
          )}
        </NewsletterContainer>
      </NewsletterSection>
    </HomeContainer>
  )
}

export default Home