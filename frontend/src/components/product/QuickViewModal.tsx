import React, { useState } from 'react'
import styled from 'styled-components'
import { X, Heart, ShoppingBag, Star } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import toast from 'react-hot-toast'
import { Product, getMainImage, formatPrice, getCategoryName } from '../../utils/productHelpers'

interface QuickViewModalProps {
  product: Product
  isOpen: boolean
  onClose: () => void
}

const Overlay = styled.div<{ $isOpen: boolean }>`
  display: ${({ $isOpen }) => $isOpen ? 'flex' : 'none'};
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 1000;
  align-items: center;
  justify-content: center;
  padding: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    align-items: flex-end;
  }
`

const Modal = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  max-width: 900px;
  width: 100%;
  max-height: 90vh;
  overflow-y: auto;
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: ${({ theme }) => theme.spacing['2xl']};
  padding: ${({ theme }) => theme.spacing['2xl']};
  position: relative;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    max-height: 95vh;
    border-radius: ${({ theme }) => theme.borderRadius.lg} ${({ theme }) => theme.borderRadius.lg} 0 0;
  }
`

const CloseButton = styled.button`
  position: absolute;
  top: ${({ theme }) => theme.spacing.lg};
  right: ${({ theme }) => theme.spacing.lg};
  background: none;
  border: none;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.darkGray};
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    color: ${({ theme }) => theme.colors.black};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    top: ${({ theme }) => theme.spacing.md};
    right: ${({ theme }) => theme.spacing.md};
  }
`

const ImageSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const MainImage = styled.img`
  width: 100%;
  height: auto;
  aspect-ratio: 3/4;
  object-fit: cover;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.lightGray};
`

const ThumbnailGallery = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.sm};
  overflow-x: auto;
`

const Thumbnail = styled.button<{ $active: boolean }>`
  width: 60px;
  height: 80px;
  border: 2px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.lightGray};
  background: none;
  cursor: pointer;
  border-radius: ${({ theme }) => theme.borderRadius.sm};
  overflow: hidden;
  transition: ${({ theme }) => theme.transitions.fast};
  flex-shrink: 0;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const ContentSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.lg};
  padding-top: ${({ theme }) => theme.spacing['2xl']};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding-top: 0;
  }
`

const ProductName = styled.h2`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['2xl']};
  color: ${({ theme }) => theme.colors.black};
  margin: 0;
`

const ProductCategory = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.darkGray};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0;
`

const ProductDescription = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.darkGray};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin: 0;
`

const RatingSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const Stars = styled.div`
  display: flex;
  gap: 2px;
`

const ReviewCount = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.darkGray};
`

const PriceSection = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.md};
`

const CurrentPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  color: ${({ theme }) => theme.colors.black};
`

const OriginalPrice = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.darkGray};
  text-decoration: line-through;
`

const Discount = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.md};
  color: ${({ theme }) => theme.colors.primary};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
`

const VariationsSection = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.md};
`

const VariationGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.sm};
`

const VariationLabel = styled.label`
  font-size: ${({ theme }) => theme.fontSizes.sm};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.black};
`

const Select = styled.select`
  padding: ${({ theme }) => theme.spacing.md};
  border: 1px solid ${({ theme }) => theme.colors.mediumGray};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-size: ${({ theme }) => theme.fontSizes.md};
  background: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
  }
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
  }
`

const ActionButtons = styled.div`
  display: flex;
  gap: ${({ theme }) => theme.spacing.md};
  margin-top: ${({ theme }) => theme.spacing.lg};
`

const AddToCartButton = styled.button`
  flex: 1;
  background: ${({ theme }) => theme.colors.black};
  color: ${({ theme }) => theme.colors.white};
  border: none;
  padding: ${({ theme }) => theme.spacing.lg};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  font-size: ${({ theme }) => theme.fontSizes.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.sm};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`

const WishlistButton = styled.button<{ $active: boolean }>`
  width: 56px;
  height: 56px;
  border: 2px solid ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.mediumGray};
  background: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.white};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.white : theme.colors.darkGray};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }
`

const QuickViewModal: React.FC<QuickViewModalProps> = ({ product, isOpen, onClose }) => {
  const { addItem } = useCartStore()
  const { isInWishlist, addToWishlist, removeFromWishlist } = useWishlistStore()
  
  const [selectedSize, setSelectedSize] = useState('')
  const [selectedColor, setSelectedColor] = useState('')
  const [selectedImageIndex, setSelectedImageIndex] = useState(0)
  
  const mainImage = getMainImage(product) || (product as any).variations?.[0]?.images?.[0]?.url || '/placeholder-product.svg'
  const images = (product as any).variations?.flatMap((v: any) => v.images || [])?.filter((img: any) => img && img.url) || [mainImage]
  const currentImage = images[selectedImageIndex]?.url || images[0]?.url || mainImage
  
  const categoryName = getCategoryName(product.category)
  const price = (product as any).price || (product as any).variations?.[0]?.price || 0
  const originalPrice = (product as any).originalPrice || (product as any).compareAtPrice
  const discount = originalPrice && price < originalPrice 
    ? Math.round(((originalPrice - price) / originalPrice) * 100)
    : 0
  
  const sizes = Array.from(new Set((product as any).variations?.map((v: any) => v.size) || []))
  const colors = Array.from(new Set((product as any).variations?.map((v: any) => v.color) || []))
  
  const productId = (product as any)._id || product.id || ''
  const isWishlisted = isInWishlist(productId)
  
  const handleAddToCart = () => {
    const variations = (product as any).variations || []
    
    if (variations.length === 0) {
      toast.error('This product has no variants')
      return
    }
    
    if (variations.length === 1) {
      const v = variations[0]
      addItem({
        id: productId,
        name: product.name,
        price: v.price || price,
        image: currentImage,
        size: v.size,
        color: v.color,
        quantity: 1,
        variationId: v._id || `${v.color}-${v.size}`
      })
      toast.success(`${product.name} added to cart!`)
    } else if (selectedSize && selectedColor) {
      const selectedVariation = variations.find(
        (v: any) => v.size === selectedSize && v.color === selectedColor
      )
      
      if (selectedVariation) {
        addItem({
          id: productId,
          name: product.name,
          price: selectedVariation.price || price,
          image: currentImage,
          size: selectedSize,
          color: selectedColor,
          quantity: 1,
          variationId: selectedVariation._id || `${selectedColor}-${selectedSize}`
        })
        toast.success(`${product.name} added to cart!`)
      } else {
        toast.error('Selected variation not available')
      }
    } else {
      toast.error('Please select size and color')
    }
    
    onClose()
  }
  
  const handleWishlistToggle = () => {
    if (isWishlisted) {
      removeFromWishlist(productId)
      toast.success('Removed from wishlist')
    } else {
      addToWishlist(productId)
      toast.success('Added to wishlist')
    }
  }
  
  if (!isOpen) return null
  
  return (
    <Overlay $isOpen={isOpen} onClick={onClose}>
      <Modal onClick={(e) => e.stopPropagation()}>
        <CloseButton onClick={onClose}>
          <X size={24} />
        </CloseButton>
        
        <ImageSection>
          <MainImage 
            src={currentImage} 
            alt={product.name}
            onError={(e) => {
              e.currentTarget.src = '/placeholder-product.svg'
            }}
          />
          
          {images.length > 1 && (
            <ThumbnailGallery>
              {images.slice(0, 5).map((img: any, idx: number) => (
                <Thumbnail
                  key={idx}
                  $active={selectedImageIndex === idx}
                  onClick={() => setSelectedImageIndex(idx)}
                >
                  <img 
                    src={img.url || img} 
                    alt={`${product.name} view ${idx + 1}`}
                    onError={(e) => {
                      e.currentTarget.src = '/placeholder-product.svg'
                    }}
                  />
                </Thumbnail>
              ))}
            </ThumbnailGallery>
          )}
        </ImageSection>
        
        <ContentSection>
          {categoryName && <ProductCategory>{categoryName}</ProductCategory>}
          <ProductName>{product.name}</ProductName>
          
          {product.description && <ProductDescription>{product.description}</ProductDescription>}
          
          {(product as any).rating && (
            <RatingSection>
              <Stars>
                {Array.from({ length: 5 }).map((_, i) => (
                  <Star 
                    key={i} 
                    size={14} 
                    fill={i < Math.floor((product as any).rating) ? 'currentColor' : 'none'}
                    color={i < Math.floor((product as any).rating) ? '#FFD700' : '#E0E0E0'}
                  />
                ))}
              </Stars>
              {(product as any).reviewCount && (
                <ReviewCount>({(product as any).reviewCount} reviews)</ReviewCount>
              )}
            </RatingSection>
          )}
          
          <PriceSection>
            <CurrentPrice>{formatPrice(price)}</CurrentPrice>
            {originalPrice && originalPrice > price && (
              <>
                <OriginalPrice>{formatPrice(originalPrice)}</OriginalPrice>
                {discount > 0 && <Discount>Save {discount}%</Discount>}
              </>
            )}
          </PriceSection>
          
          {sizes.length > 0 || colors.length > 0 ? (
            <VariationsSection>
              {sizes.length > 0 && (
                <VariationGroup>
                  <VariationLabel htmlFor="size-select">Size</VariationLabel>
                  <Select 
                    id="size-select"
                    value={selectedSize} 
                    onChange={(e) => setSelectedSize(e.target.value)}
                  >
                    <option value="">Select a size</option>
                    {sizes.map(size => (
                      <option key={size} value={size}>{size}</option>
                    ))}
                  </Select>
                </VariationGroup>
              )}
              
              {colors.length > 0 && (
                <VariationGroup>
                  <VariationLabel htmlFor="color-select">Color</VariationLabel>
                  <Select 
                    id="color-select"
                    value={selectedColor} 
                    onChange={(e) => setSelectedColor(e.target.value)}
                  >
                    <option value="">Select a color</option>
                    {colors.map(color => (
                      <option key={color} value={color}>{color}</option>
                    ))}
                  </Select>
                </VariationGroup>
              )}
            </VariationsSection>
          ) : null}
          
          <ActionButtons>
            <AddToCartButton onClick={handleAddToCart}>
              <ShoppingBag size={20} />
              Add to Cart
            </AddToCartButton>
            <WishlistButton 
              $active={isWishlisted}
              onClick={handleWishlistToggle}
              title={isWishlisted ? 'Remove from wishlist' : 'Add to wishlist'}
            >
              <Heart size={20} fill={isWishlisted ? 'currentColor' : 'none'} />
            </WishlistButton>
          </ActionButtons>
        </ContentSection>
      </Modal>
    </Overlay>
  )
}

export default QuickViewModal
