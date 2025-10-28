import React, { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import styled from 'styled-components'
import { Filter, Grid, List, Heart, ShoppingBag, Star, X } from 'lucide-react'
import { useCartStore } from '../stores/cartStore'
import toast from 'react-hot-toast'
import { productAPI } from '../services/api'
import { Product } from '../types/Product'

// Types (keeping your existing types, they're compatible)
interface Product {
  _id: string
  name: string
  slug: string
  description: string
  shortDescription?: string
  variations: Variation[]
  primaryImage?: ImageType
  rating: {
    average: number
    count: number
  }
  isNew?: boolean
  onSale?: boolean
  tags: string[]
}

interface Variation {
  size: string
  color: string
  colorCode: string
  price: number
  compareAtPrice?: number
  inventory: {
    quantity: number
  }
  images: ImageType[]
}

interface ImageType {
  url: string
  alt: string
  isPrimary?: boolean
}

interface FilterOptions {
  sizes: string[]
  colors: { name: string; code: string }[]
  priceRange: { min: number; max: number }
}

// Styled Components (all your existing styled components remain the same)
const Container = styled.div`
  width: 100%;
  padding-top: 80px;
`

const HeroSection = styled.section`
  background: ${({ theme }) => theme.colors.cream};
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.lg};
  text-align: center;
`

const HeroTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  text-transform: capitalize;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
`

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.darkGray};
  max-width: 600px;
  margin: 0 auto;
`

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.lg};
  display: grid;
  grid-template-columns: 280px 1fr;
  gap: ${({ theme }) => theme.spacing['2xl']};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
  }
`

// Sidebar Filters
const Sidebar = styled.aside`
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    order: 2;
  }
`

const FilterSection = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xl};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const FilterTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  color: ${({ theme }) => theme.colors.black};
`

const FilterOption = styled.label`
  display: flex;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.md};
  cursor: pointer;
  font-size: ${({ theme }) => theme.fontSizes.md};
  
  input {
    margin-right: ${({ theme }) => theme.spacing.sm};
  }
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const PriceRange = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.md};
`

const PriceInput = styled.input`
  flex: 1;
  padding: ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.mediumGray};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
`

// Product Grid
const ProductArea = styled.div`
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    order: 1;
  }
`

const ProductHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    flex-direction: column;
    gap: ${({ theme }) => theme.spacing.md};
    align-items: stretch;
  }
`

const ResultsInfo = styled.div`
  color: ${({ theme }) => theme.colors.darkGray};
  font-size: ${({ theme }) => theme.fontSizes.md};
`

const Controls = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  align-items: center;
`

const SortSelect = styled.select`
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.mediumGray};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  background: ${({ theme }) => theme.colors.white};
`

const ViewToggle = styled.div`
  display: flex;
  border: 1px solid ${({ theme }) => theme.colors.mediumGray};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
`

const ViewButton = styled.button<{ $active: boolean }>`
  padding: ${({ theme }) => theme.spacing.sm};
  border: none;
  background: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.white};
  color: ${({ theme, $active }) => $active ? theme.colors.white : theme.colors.darkGray};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme, $active }) => $active ? theme.colors.primaryDark : theme.colors.lightGray};
  }
`

const ProductGrid = styled.div<{ view: 'grid' | 'list' }>`
  display: grid;
  grid-template-columns: ${({ view }) => 
    view === 'grid' 
      ? 'repeat(auto-fill, minmax(280px, 1fr))' 
      : '1fr'
  };
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    grid-template-columns: 1fr 1fr;
    gap: ${({ theme }) => theme.spacing.md};
  }
`

const ProductCard = styled.div<{ view: 'grid' | 'list' }>`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions.normal};
  display: ${({ view }) => view === 'list' ? 'flex' : 'block'};
  
  &:hover {
    transform: translateY(-5px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`

const ProductImage = styled.div<{ view: 'grid' | 'list' }>`
  width: ${({ view }) => view === 'list' ? '200px' : '100%'};
  height: ${({ view }) => view === 'list' ? '200px' : '320px'};
  background: ${({ theme }) => theme.colors.accent};
  position: relative;
  overflow: hidden;
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    height: 200px;
    width: 100%;
  }
`

const ProductBadge = styled.span<{ type: 'new' | 'sale' }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  left: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, type }) => 
    type === 'new' ? theme.colors.black : theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
`

const WishlistButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: none;
  background: rgba(255, 255, 255, 0.9);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.white};
    color: ${({ theme }) => theme.colors.primary};
  }
`

const ProductInfo = styled.div<{ view: 'grid' | 'list' }>`
  padding: ${({ theme }) => theme.spacing.lg};
  flex: 1;
  display: ${({ view }) => view === 'list' ? 'flex' : 'block'};
  flex-direction: ${({ view }) => view === 'list' ? 'column' : 'initial'};
  justify-content: ${({ view }) => view === 'list' ? 'space-between' : 'initial'};
`

const ProductName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  line-height: ${({ theme }) => theme.lineHeights.tight};
`

const ProductDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.darkGray};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  line-height: ${({ theme }) => theme.lineHeights.normal};
`

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.darkGray};
`

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const CurrentPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.black};
`

const OriginalPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.mediumGray};
  text-decoration: line-through;
`

const DiscountBadge = styled.span`
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
`

const AddToCartButton = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: ${({ theme }) => theme.colors.mediumGray};
    cursor: not-allowed;
    transform: none;
  }
`

const LoadingState = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  height: 400px;
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.darkGray};
`

const EmptyState = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']};
  
  h3 {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
    color: ${({ theme }) => theme.colors.black};
    margin-bottom: ${({ theme }) => theme.spacing.lg};
  }
  
  p {
    color: ${({ theme }) => theme.colors.darkGray};
    margin-bottom: ${({ theme }) => theme.spacing.xl};
  }
`

// Mobile Filter Toggle
const MobileFilterToggle = styled.button`
  display: none;
  width: 100%;
  padding: ${({ theme }) => theme.spacing.md};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  cursor: pointer;
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: ${({ theme }) => theme.spacing.sm};
  }
`

const MobileFilterOverlay = styled.div<{ $isOpen: boolean }>`
  display: none;

  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: ${({ $isOpen }) => $isOpen ? 'block' : 'none'};
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.5);
    z-index: ${({ theme }) => theme.zIndex.modal};
  }
`

const MobileFilterPanel = styled.div`
  position: fixed;
  top: 0;
  right: 0;
  width: 320px;
  height: 100vh;
  background: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xl};
  overflow-y: auto;
  z-index: ${({ theme }) => theme.zIndex.modal + 1};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    width: 100vw;
  }
`

const MobileFilterHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${({ theme }) => theme.spacing.xl};
  padding-bottom: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
  }
`

const CloseButton = styled.button`
  width: 32px;
  height: 32px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  border: none;
  background: ${({ theme }) => theme.colors.lightGray};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.mediumGray};
  }
`

const ProductList: React.FC = () => {
  const { category } = useParams<{ category: string }>()
  const [searchParams, setSearchParams] = useSearchParams()
  const { addItem } = useCartStore()
  
  // State - updated with error state
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [view, setView] = useState<'grid' | 'list'>('grid')
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false)
  const [wishlist, setWishlist] = useState<string[]>([])
  
  // Filter states
  const [filters, setFilters] = useState({
    sizes: [] as string[],
    colors: [] as string[],
    minPrice: '',
    maxPrice: '',
    sort: 'newest'
  })
  
  const [filterOptions] = useState<FilterOptions>({
    sizes: ['XXS', 'XS', 'S', 'M', 'L', 'XL', 'XXL'],
    colors: [
      { name: 'Black', code: '#000000' },
      { name: 'White', code: '#FFFFFF' },
      { name: 'Beige', code: '#D4A574' },
      { name: 'Nude', code: '#DDBEA9' },
      { name: 'Blush', code: '#F4C2C2' },
      { name: 'Navy', code: '#1e3a8a' },
      { name: 'Brown', code: '#8b4513' }
    ],
    priceRange: { min: 0, max: 500 }
  })
  
  // Get category info
  const getCategoryInfo = (cat?: string) => {
    switch (cat) {
      case 'dresses':
        return {
          title: 'Dresses',
          description: 'Elegant dresses that make you feel confident and beautiful'
        }
      case 'loungewear':
        return {
          title: 'Loungewear',
          description: 'Comfortable pieces perfect for relaxing in style'
        }
      case 'two-piece-sets':
        return {
          title: 'Two-Piece Sets',
          description: 'Coordinated sets that take the guesswork out of styling'
        }
      case 'new-in':
        return {
          title: 'New In',
          description: 'The latest arrivals from our newest collection'
        }
      case 'essentials':
        return {
          title: 'Essentials',
          description: 'Wardrobe staples you\'ll reach for again and again'
        }
      default:
        return {
          title: 'All Products',
          description: 'Discover our complete collection of confidence-inspiring pieces'
        }
    }
  }
  
  const categoryInfo = getCategoryInfo(category)

  // Product fetching with API integration
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        setError(null);
        
        let response;
        
        if (category && category !== 'all') {
          // Use category-specific endpoint
              response = await productAPI.getProductsByCategory(category);
  } else {
    // Get all products
    response = await productAPI.getProducts();
        }

        if (response.success) {
          setProducts(response.data);
        } else {
          throw new Error('Failed to fetch products');
        }
      } catch (err) {
        console.error('Error fetching products:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, [category]);
  
  // Handle filter changes
  const handleFilterChange = (type: string, value: string | string[]) => {
    setFilters(prev => ({
      ...prev,
      [type]: value
    }))
  }
  
  // Handle add to cart
  const handleAddToCart = (product: Product) => {
    const variation = product.variations[0] // For demo, use first variation
    addItem({
      id: product._id,
      name: product.name,
      price: variation.price,
      image: variation.images[0]?.url || '/placeholder.jpg',
      size: variation.size,
      color: variation.color,
      quantity: 1
    })
    toast.success(`${product.name} added to cart!`)
  }
  
  // Handle wishlist toggle
  const toggleWishlist = (productId: string) => {
    setWishlist(prev => {
      const isInWishlist = prev.includes(productId)
      if (isInWishlist) {
        toast.success('Removed from wishlist')
        return prev.filter(id => id !== productId)
      } else {
        toast.success('Added to wishlist')
        return [...prev, productId]
      }
    })
  }
  
  // Calculate discount percentage
  const getDiscountPercentage = (price: number, compareAtPrice?: number) => {
    if (!compareAtPrice || compareAtPrice <= price) return 0
    return Math.round(((compareAtPrice - price) / compareAtPrice) * 100)
  }
  
  // Render stars for rating
  const renderStars = (rating: number) => {
    const stars = []
    for (let i = 1; i <= 5; i++) {
      stars.push(
        <Star
          key={i}
          size={14}
          fill={i <= rating ? '#D4A574' : 'none'}
          color={i <= rating ? '#D4A574' : '#cccccc'}
        />
      )
    }
    return stars
  }

  // Updated loading and error states
  if (loading) {
    return (
      <Container>
        <LoadingState>Loading products...</LoadingState>
      </Container>
    )
  }

  if (error) {
    return (
      <Container>
        <EmptyState>
          <h3>Error Loading Products</h3>
          <p>{error}</p>
        </EmptyState>
      </Container>
    )
  }
  
  return (
    <Container>
      <HeroSection>
        <HeroTitle>{categoryInfo.title}</HeroTitle>
        <HeroSubtitle>{categoryInfo.description}</HeroSubtitle>
      </HeroSection>
      
      <MainContent>
        <Sidebar>
          <MobileFilterToggle onClick={() => setMobileFilterOpen(true)}>
            <Filter size={20} />
            Filters
          </MobileFilterToggle>
          
          {/* Desktop Filters */}
          <div style={{ display: window.innerWidth > 1024 ? 'block' : 'none' }}>
            <FilterSection>
              <FilterTitle>Size</FilterTitle>
              {filterOptions.sizes.map(size => (
                <FilterOption key={size}>
                  <input
                    type="checkbox"
                    id={`size-${size}`}
                    checked={filters.sizes.includes(size)}
                    onChange={(e) => {
                      const newSizes = e.target.checked
                        ? [...filters.sizes, size]
                        : filters.sizes.filter(s => s !== size)
                      handleFilterChange('sizes', newSizes)
                    }}
                  />
                  {size}
                </FilterOption>
              ))}
            </FilterSection>
            
            <FilterSection>
              <FilterTitle>Color</FilterTitle>
              {filterOptions.colors.map(color => (
                <FilterOption key={color.name}>
                  <input
                    type="checkbox"
                    id={`color-${color.name}`}
                    checked={filters.colors.includes(color.name)}
                    onChange={(e) => {
                      const newColors = e.target.checked
                        ? [...filters.colors, color.name]
                        : filters.colors.filter(c => c !== color.name)
                      handleFilterChange('colors', newColors)
                    }}
                  />
                  <span style={{ marginRight: '8px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        width: '16px',
                        height: '16px',
                        backgroundColor: color.code,
                        border: '1px solid #ddd',
                        borderRadius: '50%',
                        marginRight: '8px'
                      }}
                    />
                  </span>
                  {color.name}
                </FilterOption>
              ))}
            </FilterSection>
            
            <FilterSection>
              <FilterTitle>Price Range</FilterTitle>
              <PriceRange>
                <PriceInput
                  type="number"
                  placeholder="Min"
                  value={filters.minPrice}
                  onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                />
                <PriceInput
                  type="number"
                  placeholder="Max"
                  value={filters.maxPrice}
                  onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                />
              </PriceRange>
            </FilterSection>
          </div>
        </Sidebar>
        
        <ProductArea>
          <ProductHeader>
            <ResultsInfo>
              Showing {products.length} products
            </ResultsInfo>
            
            <Controls>
              <SortSelect
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
              >
                <option value="newest">Newest</option>
                <option value="price-asc">Price: Low to High</option>
                <option value="price-desc">Price: High to Low</option>
                <option value="rating">Highest Rated</option>
                <option value="popular">Most Popular</option>
              </SortSelect>
              
              <ViewToggle>
                <ViewButton
                  $active={view === 'grid'}
                  onClick={() => setView('grid')}
                >
                  <Grid size={16} />
                </ViewButton>
                <ViewButton
                  $active={view === 'list'}
                  onClick={() => setView('list')}
                >
                  <List size={16} />
                </ViewButton>
              </ViewToggle>
            </Controls>
          </ProductHeader>
          
          {products.length === 0 ? (
            <EmptyState>
              <h3>No products found</h3>
              <p>Try adjusting your filters or browse our other categories.</p>
            </EmptyState>
          ) : (
            <ProductGrid view={view}>
              {products.map(product => {
                const variation = product.variations[0]
                const discount = getDiscountPercentage(variation.price, variation.compareAtPrice)
                const isInWishlist = wishlist.includes(product._id)
                
                return (
                  <ProductCard key={product._id} view={view}>
                    <ProductImage view={view}>
                      <img
                        src={variation.images[0]?.url || '/placeholder.jpg'}
                        alt={product.name}
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMzAwIiBoZWlnaHQ9IjMwMCIgZmlsbD0iI0Y1RTZEMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIxOHB4IiBmaWxsPSIjNjY2NjY2Ij5Qcm9kdWN0IEltYWdlPC90ZXh0Pjwvc3ZnPg=='
                        }}
                      />
                      
                      {product.isNew && <ProductBadge type="new">New</ProductBadge>}
                      {product.onSale && discount > 0 && (
                        <ProductBadge type="sale">-{discount}%</ProductBadge>
                      )}
                      
                      <WishlistButton onClick={() => toggleWishlist(product._id)}>
                        <Heart
                          size={18}
                          fill={isInWishlist ? '#F4C2C2' : 'none'}
                          color={isInWishlist ? '#F4C2C2' : '#666666'}
                        />
                      </WishlistButton>
                    </ProductImage>
                    
                    <ProductInfo view={view}>
                      <div>
                        <ProductName>{product.name}</ProductName>
                        
                        {product.shortDescription && (
                          <ProductDescription>
                            {product.shortDescription}
                          </ProductDescription>
                        )}
                        
                        <ProductRating>
                          {renderStars(Math.floor(product.rating.average))}
                          <span>({product.rating.count})</span>
                        </ProductRating>
                        
                        <ProductPrice>
                          <CurrentPrice>${variation.price.toFixed(2)}</CurrentPrice>
                          {variation.compareAtPrice && variation.compareAtPrice > variation.price && (
                            <>
                              <OriginalPrice>
                                ${variation.compareAtPrice.toFixed(2)}
                              </OriginalPrice>
                              <DiscountBadge>-{discount}%</DiscountBadge>
                            </>
                          )}
                        </ProductPrice>
                      </div>
                      
                      <AddToCartButton
                        onClick={() => handleAddToCart(product)}
                        disabled={variation.inventory.quantity === 0}
                      >
                        <ShoppingBag size={16} />
                        {variation.inventory.quantity === 0 ? 'Out of Stock' : 'Add to Cart'}
                      </AddToCartButton>
                    </ProductInfo>
                  </ProductCard>
                )
              })}
            </ProductGrid>
          )}
        </ProductArea>
      </MainContent>
      
      {/* Mobile Filter Overlay */}
      <MobileFilterOverlay 
        $isOpen={mobileFilterOpen}
        onClick={() => setMobileFilterOpen(false)}
      />
      
      {mobileFilterOpen && (
        <MobileFilterPanel>
          <MobileFilterHeader>
            <h3>Filters</h3>
            <CloseButton onClick={() => setMobileFilterOpen(false)}>
              <X size={16} />
            </CloseButton>
          </MobileFilterHeader>
          
          <FilterSection>
            <FilterTitle>Size</FilterTitle>
            {filterOptions.sizes.map(size => (
              <FilterOption key={size}>
                <input
                  type="checkbox"
                  id={`mobile-size-${size}`}
                  checked={filters.sizes.includes(size)}
                  onChange={(e) => {
                    const newSizes = e.target.checked
                      ? [...filters.sizes, size]
                      : filters.sizes.filter(s => s !== size)
                    handleFilterChange('sizes', newSizes)
                  }}
                />
                {size}
              </FilterOption>
            ))}
          </FilterSection>
          
          <FilterSection>
            <FilterTitle>Color</FilterTitle>
            {filterOptions.colors.map(color => (
              <FilterOption key={color.name}>
                <input
                  type="checkbox"
                  id={`mobile-color-${color.name}`}
                  checked={filters.colors.includes(color.name)}
                  onChange={(e) => {
                    const newColors = e.target.checked
                      ? [...filters.colors, color.name]
                      : filters.colors.filter(c => c !== color.name)
                    handleFilterChange('colors', newColors)
                  }}
                />
                <span style={{ marginRight: '8px' }}>
                  <span
                    style={{
                      display: 'inline-block',
                      width: '16px',
                      height: '16px',
                      backgroundColor: color.code,
                      border: '1px solid #ddd',
                      borderRadius: '50%',
                      marginRight: '8px'
                    }}
                  />
                </span>
                {color.name}
              </FilterOption>
            ))}
          </FilterSection>
          
          <FilterSection>
            <FilterTitle>Price Range</FilterTitle>
            <PriceRange>
              <PriceInput
                type="number"
                placeholder="Min"
                value={filters.minPrice}
                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
              />
              <PriceInput
                type="number"
                placeholder="Max"
                value={filters.maxPrice}
                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
              />
            </PriceRange>
          </FilterSection>
        </MobileFilterPanel>
      )}
    </Container>
  )
}

export default ProductList