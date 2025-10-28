import React, { useState, useRef, useEffect } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Heart, ShoppingBag, Eye, Star } from 'lucide-react'
import { useAuthStore } from '../../stores/authStore'
import { useCartStore } from '../../stores/cartStore'
import { getCategoryName, getMainImage, calculateDiscount, formatPrice, validateProduct, Product } from '../../utils/productHelpers'

interface ProductCardProps {
  product: Product
  variant?: 'default' | 'compact' | 'minimal' | 'featured'
}

const Card = styled.div<{ $variant: string }>`
  position: relative;
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions.normal};
  cursor: pointer;
  
  ${({ $variant }) => $variant === 'compact' ? `
    box-shadow: none;
    border-radius: 8px;
  ` : `
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  `}
  
  &:hover {
    transform: ${({ $variant }) => $variant === 'compact' ? 'none' : 'translateY(-4px)'};
    box-shadow: ${({ theme, $variant }) => 
      $variant === 'compact' ? 'none' : theme.shadows.xl};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    &:hover {
      transform: none;
    }
  }
`

const ImageContainer = styled.div<{ $variant: string }>`
  position: relative;
  aspect-ratio: 3/4;
  background: ${({ theme }) => theme.colors.lightGray};
  overflow: hidden;
  
  ${({ $variant }) => $variant === 'compact' && `
    aspect-ratio: 4/5;
  `}
`

const ProductImage = styled.img<{ $isHover?: boolean }>`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: ${({ theme }) => theme.transitions.slow};
  opacity: ${({ $isHover }) => $isHover ? 0 : 1};
  
  &:nth-child(2) {
    position: absolute;
    top: 0;
    left: 0;
    opacity: ${({ $isHover }) => $isHover ? 1 : 0};
  }
`

const ProductVideo = styled.video`
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
`

// Small LazyVideo component: plays when visible and pauses when not
const LazyVideo: React.FC<React.VideoHTMLAttributes<HTMLVideoElement>> = ({ src, ...rest }) => {
  const ref = useRef<HTMLVideoElement | null>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return

    let observer: IntersectionObserver | null = null
    try {
      observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (!ref.current) return
          if (entry.isIntersecting) {
            // try to play, but ignore promise rejection
            ref.current.play().catch(() => {})
          } else {
            ref.current.pause()
          }
        })
      }, { threshold: 0.25 })
      observer.observe(el)
    } catch (e) {
      // IntersectionObserver not available or error - fallback to autoplay
      try { el.play().catch(() => {}) } catch (e) {}
    }

    return () => { if (observer && el) observer.unobserve(el) }
  }, [src])

  return (
    // @ts-ignore styled component accepts ref
    <ProductVideo ref={ref} src={src} preload="metadata" playsInline muted loop {...rest} />
  )
}

const Badge = styled.div<{ $type: 'new' | 'sale' }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  left: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme, $type }) => 
    $type === 'sale' ? theme.colors.primary : theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  z-index: 2;
`

const QuickActions = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
  opacity: ${({ $isVisible }) => $isVisible ? 1 : 0};
  transform: translateY(${({ $isVisible }) => $isVisible ? '0' : '-10px'});
  transition: all ${({ theme }) => theme.transitions.fast};
  z-index: 2;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    opacity: 1;
    transform: translateY(0);
  }
`

const ActionButton = styled.button<{ $active?: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.white};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.white : theme.colors.darkGray};
  
  &:hover {
    transform: scale(1.1);
    background: ${({ theme, $active }) => 
      $active ? theme.colors.primaryDark : theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    width: 36px;
    height: 36px;
  }
`

const QuickShop = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.md};
  left: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  opacity: ${({ $isVisible }) => $isVisible ? 1 : 0};
  transform: translateY(${({ $isVisible }) => $isVisible ? '0' : '20px'});
  transition: all ${({ theme }) => theme.transitions.fast};
  z-index: 2;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`

const QuickShopButton = styled.button`
  width: 100%;
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
`

const ColorSwatches = styled.div<{ $isVisible: boolean }>`
  position: absolute;
  bottom: ${({ theme }) => theme.spacing.sm};
  left: ${({ theme }) => theme.spacing.sm};
  display: flex;
  gap: ${({ theme }) => theme.spacing.xs};
  opacity: ${({ $isVisible }) => $isVisible ? 1 : 0};
  transition: opacity ${({ theme }) => theme.transitions.fast};
  z-index: 2;
`

const ColorSwatch = styled.button<{ $color: string; $active?: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${({ theme, $active }) => 
    $active ? theme.colors.black : theme.colors.white};
  background: ${({ $color }) => $color.toLowerCase()};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    transform: scale(1.1);
    border-color: ${({ theme }) => theme.colors.black};
  }
`

const ProductInfo = styled.div<{ $variant: string }>`
  padding: ${({ theme, $variant }) => 
    $variant === 'compact' ? theme.spacing.sm : theme.spacing.md};
`

const DebugBox = styled.div`
  position: absolute;
  left: 8px;
  bottom: 8px;
  right: 8px;
  background: rgba(0,0,0,0.7);
  color: #fff;
  font-size: 11px;
  padding: 6px 8px;
  border-radius: 6px;
  z-index: 4;
  max-height: 4.5rem;
  overflow: auto;
  line-height: 1.1;
  opacity: 0.95;
`

const ProductName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  line-height: 1.3;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`

const ProductCategory = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.darkGray};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const ProductDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.darkGray};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`

const ProductRating = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
`

const Stars = styled.div`
  display: flex;
  gap: 2px;
`

const ReviewCount = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.darkGray};
`

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
`

const CurrentPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.black};
`

const OriginalPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.darkGray};
  text-decoration: line-through;
`

const Discount = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`

const ProductCard: React.FC<ProductCardProps> = ({ product, variant = 'default' }) => {
  // Validate and sanitize product data
  const validatedProduct = validateProduct(product);
  
  if (!validatedProduct) {
    console.error('Invalid product data:', product);
    return null;
  }

  // Use helper functions
  const categoryName = getCategoryName(validatedProduct.category);
  const mainImage = getMainImage(validatedProduct);
  const discountPercentage = calculateDiscount(validatedProduct.price, validatedProduct.originalPrice);

  const { 
    // _id may not always be present depending on API shape — use productId below
    name, 
    price, 
    originalPrice, 
    images, 
    colors, 
    sizes, 
    rating, 
    reviewCount, 
    isNew, 
    isSale, 
    description,
    slug
  } = validatedProduct;

  // Normalize product id access across different API shapes
  const productId = (validatedProduct as any)._id || (validatedProduct as any).id || ''

  // Debugging: log normalized image values to help trace missing-image issues
  // Removed noisy dev console.debug in production code; keep runtime fallback below.

  const [isHovered, setIsHovered] = useState(false)
  const [selectedColor, setSelectedColor] = useState(colors?.[0] || '')
  const { user, isInWishlist, addToWishlist, removeFromWishlist } = useAuthStore()
  const { addItem } = useCartStore()

  const isWishlisted = user ? isInWishlist(productId) : false
  const formattedPrice = formatPrice(price)
  const formattedOriginalPrice = originalPrice ? formatPrice(originalPrice) : null

  const handleWishlistToggle = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!user) {
      // Redirect to login or show login modal
      return
    }
    
    if (isWishlisted) {
      removeFromWishlist(productId)
    } else {
      addToWishlist(productId)
    }
  }

  const handleQuickShop = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    addItem({
      id: productId,
      name: name,
      price: price,
      image: mainImage,
      size: sizes?.[0] || 'M',
      color: selectedColor || 'Default',
    })
  }

  const handleColorChange = (color: string, e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setSelectedColor(color)
  }

  return (
    <Card 
      $variant={variant}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
  <Link to={`/products/${slug || productId}`} style={{ textDecoration: 'none', color: 'inherit' }}>
  <ImageContainer $variant={variant}>
          {/* Render video when the main image is a video file */}
            <ProductImage 
              src={
                // prefer normalized mainImage, but fall back to raw product.variations[*].images[0].url at render time
                mainImage || (Array.isArray((product as any).variations) && (product as any).variations[0]?.images?.[0]?.url) || '/placeholder-product.svg'
              } 
              alt={name}
              $isHover={false}
              onError={(e) => {
                e.currentTarget.src = '/placeholder-product.svg'
              }}
            />

          {images?.[1] && (
            /\.(mp4|webm|ogg)$/i.test(images[1]) ? (
              <LazyVideo src={images[1]} onError={(e) => { console.error('Product video load error', e) }} />
            ) : (
              <ProductImage 
                src={images[1]} 
                alt={name}
                $isHover={isHovered}
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            )
          )}

          {/* Removed on-card debug overlay (dev) to keep production UI clean. */}
          
          {/* Product badges */}
          {isNew && <Badge $type="new">New</Badge>}
          {isSale && discountPercentage > 0 && (
            <Badge $type="sale">Save {discountPercentage}%</Badge>
          )}
          
          <QuickActions $isVisible={isHovered || variant === 'compact'}>
            <ActionButton
              onClick={handleWishlistToggle}
              $active={isWishlisted}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={16} fill={isWishlisted ? 'currentColor' : 'none'} />
            </ActionButton>
            <ActionButton title="Quick view">
              <Eye size={16} />
            </ActionButton>
          </QuickActions>
          
          {variant !== 'compact' && (
            <QuickShop $isVisible={isHovered}>
              <QuickShopButton onClick={handleQuickShop}>
                <ShoppingBag size={16} />
                Quick Add
              </QuickShopButton>
            </QuickShop>
          )}
          
          {colors && colors.length > 1 && (
            <ColorSwatches $isVisible={isHovered}>
              {colors.slice(0, 4).map((color) => (
                <ColorSwatch
                  key={color}
                  $color={color}
                  $active={selectedColor === color}
                  onClick={(e) => handleColorChange(color, e)}
                  title={color}
                />
              ))}
            </ColorSwatches>
          )}
        </ImageContainer>
        
        <ProductInfo $variant={variant}>
          {categoryName && variant !== 'compact' && (
            <ProductCategory>{categoryName}</ProductCategory>
          )}
          
          <ProductName>{name}</ProductName>
          
          {description && variant !== 'compact' && variant !== 'minimal' && (
            <ProductDescription>
              {description || 'Discover this amazing product'}
            </ProductDescription>
          )}
          
          {rating && variant !== 'compact' && (
            <ProductRating>
              <Stars>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={12} 
                    fill={i < Math.floor(rating) ? 'currentColor' : 'none'}
                    color={i < Math.floor(rating) ? '#FFD700' : '#E0E0E0'}
                  />
                ))}
              </Stars>
              {reviewCount && (
                <ReviewCount>({reviewCount})</ReviewCount>
              )}
            </ProductRating>
          )}
          
          <ProductPrice>
            <CurrentPrice>{formattedPrice}</CurrentPrice>
            {originalPrice && originalPrice > price && (
              <>
                <OriginalPrice>{formattedOriginalPrice}</OriginalPrice>
                {discountPercentage > 0 && <Discount>-{discountPercentage}%</Discount>}
              </>
            )}
          </ProductPrice>
        </ProductInfo>
      </Link>
    </Card>
  )
}

export default ProductCard