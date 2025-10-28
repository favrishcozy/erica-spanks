import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'
import { Heart, ShoppingBag, Trash2, Share } from 'lucide-react'
import { useAuthStore } from '../stores/authStore'
import { useCartStore } from '../stores/cartStore'

const WishlistContainer = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing.lg};
  min-height: 70vh;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: ${({ theme }) => theme.spacing.md};
  }
`

const WishlistHeader = styled.div`
  text-align: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
`

const Title = styled.h1`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['3xl']};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes['2xl']};
  }
`

const Subtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  color: ${({ theme }) => theme.colors.darkGray};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const EmptyWishlist = styled.div`
  text-align: center;
  padding: ${({ theme }) => theme.spacing['4xl']} 0;
`

const EmptyIcon = styled.div`
  width: 120px;
  height: 120px;
  margin: 0 auto ${({ theme }) => theme.spacing.xl};
  background: ${({ theme }) => theme.colors.lightGray};
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: ${({ theme }) => theme.colors.darkGray};
`

const EmptyTitle = styled.h2`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const EmptyText = styled.p`
  color: ${({ theme }) => theme.colors.darkGray};
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const ShopButton = styled(Link)`
  display: inline-flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.xl};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  text-decoration: none;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: translateY(-2px);
  }
`

const WishlistGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: ${({ theme }) => theme.spacing.xl};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
    gap: ${({ theme }) => theme.spacing.md};
  }
`

const ProductCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.sm};
  transition: ${({ theme }) => theme.transitions.normal};
  position: relative;
  
  &:hover {
    transform: translateY(-4px);
    box-shadow: ${({ theme }) => theme.shadows.lg};
  }
`

const ProductImageContainer = styled.div`
  position: relative;
  aspect-ratio: 3/4;
  background: ${({ theme }) => theme.colors.lightGray};
  overflow: hidden;
`

const ProductImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  transition: ${({ theme }) => theme.transitions.slow};
  
  &:hover {
    transform: scale(1.05);
  }
`

const ProductActions = styled.div`
  position: absolute;
  top: ${({ theme }) => theme.spacing.sm};
  right: ${({ theme }) => theme.spacing.sm};
  display: flex;
  flex-direction: column;
  gap: ${({ theme }) => theme.spacing.xs};
`

const ActionButton = styled.button<{ $variant?: 'danger' }>`
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: ${({ theme }) => theme.colors.white};
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  color: ${({ theme, $variant }) => 
    $variant === 'danger' ? theme.colors.error : theme.colors.darkGray};
  
  &:hover {
    transform: scale(1.1);
    background: ${({ theme, $variant }) => 
      $variant === 'danger' ? theme.colors.error : theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }
`

const ProductInfo = styled.div`
  padding: ${({ theme }) => theme.spacing.md};
`

const ProductName = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.md};
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.xs};
  line-height: 1.3;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`

const ProductPrice = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  margin-bottom: ${({ theme }) => theme.spacing.md};
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

const AddToBagButton = styled.button`
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
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`

// Mock wishlist data - will be replaced with real data
const mockWishlistItems = [
  {
    id: '1',
    name: 'Satin Slip Dress',
    price: 89.99,
    originalPrice: 119.99,
    image: '/api/placeholder/300/400',
    sizes: ['XS', 'S', 'M', 'L'],
    colors: ['Black', 'Pink', 'White']
  },
  {
    id: '2',
    name: 'Lace Bodysuit',
    price: 59.99,
    originalPrice: null,
    image: '/api/placeholder/300/400',
    sizes: ['XS', 'S', 'M', 'L', 'XL'],
    colors: ['Black', 'Nude']
  }
]

const Wishlist: React.FC = () => {
  const { user, removeFromWishlist } = useAuthStore()
  const { addItem } = useCartStore()
  const [selectedSizes, setSelectedSizes] = useState<{[key: string]: string}>({})
  const [selectedColors, setSelectedColors] = useState<{[key: string]: string}>({})

  if (!user) {
    return (
      <WishlistContainer>
        <EmptyWishlist>
          <EmptyIcon>
            <Heart size={60} />
          </EmptyIcon>
          <EmptyTitle>Sign in to see your wishlist</EmptyTitle>
          <EmptyText>
            Save items you love to your wishlist and shop them later.
          </EmptyText>
          <ShopButton to="/login">
            Sign In
          </ShopButton>
        </EmptyWishlist>
      </WishlistContainer>
    )
  }

  const wishlistItems = mockWishlistItems // Replace with real wishlist items

  const handleRemoveFromWishlist = (productId: string) => {
    removeFromWishlist(productId)
  }

  const handleAddToBag = (item: any) => {
    const selectedSize = selectedSizes[item.id] || item.sizes[0]
    const selectedColor = selectedColors[item.id] || item.colors[0]
    
    addItem({
      id: item.id,
      name: item.name,
      price: item.price,
      image: item.image,
      size: selectedSize,
      color: selectedColor,
    })
  }

  if (wishlistItems.length === 0) {
    return (
      <WishlistContainer>
        <WishlistHeader>
          <Title>My Wishlist</Title>
          <Subtitle>Your saved items</Subtitle>
        </WishlistHeader>
        <EmptyWishlist>
          <EmptyIcon>
            <Heart size={60} />
          </EmptyIcon>
          <EmptyTitle>Your wishlist is empty</EmptyTitle>
          <EmptyText>
            Items you save will appear here. Start shopping and add items you love!
          </EmptyText>
          <ShopButton to="/products">
            Start Shopping <ShoppingBag size={18} />
          </ShopButton>
        </EmptyWishlist>
      </WishlistContainer>
    )
  }

  return (
    <WishlistContainer>
      <WishlistHeader>
        <Title>My Wishlist</Title>
        <Subtitle>{wishlistItems.length} item{wishlistItems.length !== 1 ? 's' : ''} saved</Subtitle>
      </WishlistHeader>
      
      <WishlistGrid>
        {wishlistItems.map((item) => (
          <ProductCard key={item.id}>
            <ProductImageContainer>
              <Link to={`/product/${item.id}`}>
                <ProductImage 
                  src={item.image} 
                  alt={item.name}
                  onError={(e) => {
                    e.currentTarget.style.display = 'none'
                  }}
                />
              </Link>
              
              <ProductActions>
                <ActionButton
                  onClick={() => handleRemoveFromWishlist(item.id)}
                  $variant="danger"
                  title="Remove from wishlist"
                >
                  <Trash2 size={16} />
                </ActionButton>
                <ActionButton title="Share">
                  <Share size={16} />
                </ActionButton>
              </ProductActions>
            </ProductImageContainer>
            
            <ProductInfo>
              <Link to={`/product/${item.id}`} style={{ textDecoration: 'none' }}>
                <ProductName>{item.name}</ProductName>
              </Link>
              
              <ProductPrice>
                <CurrentPrice>£{item.price}</CurrentPrice>
                {item.originalPrice && (
                  <OriginalPrice>£{item.originalPrice}</OriginalPrice>
                )}
              </ProductPrice>
              
              <AddToBagButton onClick={() => handleAddToBag(item)}>
                <ShoppingBag size={16} />
                Add to Bag
              </AddToBagButton>
            </ProductInfo>
          </ProductCard>
        ))}
      </WishlistGrid>
    </WishlistContainer>
  )
}

export default Wishlist
