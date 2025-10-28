import React, { useState } from 'react'
import styled from 'styled-components'
import { Heart, ShoppingBag, ExternalLink } from 'lucide-react'

// Types
interface LookbookItem {
  _id: string
  title: string
  description?: string
  category: 'campaign' | 'lifestyle' | 'influencer'
  images: {
    url: string
    alt: string
  }[]
  products?: {
    _id: string
    name: string
    price: number
    slug: string
  }[]
  tags: string[]
  publishedAt: string
}

// Styled Components
const Container = styled.div`
  width: 100%;
  padding-top: 80px;
`

const HeroSection = styled.section`
  background: linear-gradient(135deg, ${({ theme }) => theme.colors.cream} 0%, ${({ theme }) => theme.colors.accent} 100%);
  padding: ${({ theme }) => theme.spacing['3xl']} ${({ theme }) => theme.spacing.lg};
  text-align: center;
`

const HeroTitle = styled.h1`
  font-family: ${({ theme }) => theme.fonts.secondary};
  font-size: ${({ theme }) => theme.fontSizes['4xl']};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    font-size: ${({ theme }) => theme.fontSizes['3xl']};
  }
`

const HeroSubtitle = styled.p`
  font-size: ${({ theme }) => theme.fontSizes.xl};
  color: ${({ theme }) => theme.colors.darkGray};
  max-width: 600px;
  margin: 0 auto;
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
`

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: ${({ theme }) => theme.spacing['2xl']} ${({ theme }) => theme.spacing.lg};
`

const FilterTabs = styled.div`
  display: flex;
  justify-content: center;
  margin-bottom: ${({ theme }) => theme.spacing['2xl']};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
`

const FilterTab = styled.button<{ $active?: boolean }>`
  padding: ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xl};
  border: none;
  background: none;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme, $active }) => $active ? theme.colors.primary : theme.colors.darkGray};
  border-bottom: 2px solid ${({ theme, $active }) => $active ? theme.colors.primary : 'transparent'};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (max-width: ${({ theme }) => theme.breakpoints.mobile}) {
    padding: ${({ theme }) => theme.spacing.md} ${({ theme }) => theme.spacing.lg};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`

const LookbookGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
  gap: ${({ theme }) => theme.spacing['2xl']};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    grid-template-columns: 1fr;
    gap: ${({ theme }) => theme.spacing.xl};
  }
`

const LookbookCard = styled.div`
  background: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  overflow: hidden;
  box-shadow: ${({ theme }) => theme.shadows.md};
  transition: ${({ theme }) => theme.transitions.normal};
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: ${({ theme }) => theme.shadows.xl};
  }
`

const ImageContainer = styled.div`
  position: relative;
  aspect-ratio: 4/5;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    transition: ${({ theme }) => theme.transitions.slow};
  }
  
  &:hover img {
    transform: scale(1.05);
  }
`

const ImageOverlay = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.7) 100%);
  display: flex;
  align-items: flex-end;
  padding: ${({ theme }) => theme.spacing.xl};
  opacity: 0;
  transition: ${({ theme }) => theme.transitions.normal};
  
  ${ImageContainer}:hover & {
    opacity: 1;
  }
`

const OverlayContent = styled.div`
  color: ${({ theme }) => theme.colors.white};
  
  h3 {
    font-size: ${({ theme }) => theme.fontSizes.xl};
    font-weight: ${({ theme }) => theme.fontWeights.semibold};
    margin-bottom: ${({ theme }) => theme.spacing.sm};
  }
  
  p {
    font-size: ${({ theme }) => theme.fontSizes.sm};
    opacity: 0.9;
    line-height: ${({ theme }) => theme.lineHeights.normal};
  }
`

const CategoryBadge = styled.span<{ $category: 'campaign' | 'lifestyle' | 'influencer' }>`
  position: absolute;
  top: ${({ theme }) => theme.spacing.md};
  right: ${({ theme }) => theme.spacing.md};
  background: ${({ theme, $category }) => {
    switch ($category) {
      case 'campaign':
        return theme.colors.black;
      case 'lifestyle':
        return theme.colors.primary;
      case 'influencer':
        return theme.colors.blush;
      default:
        return theme.colors.primary;
    }
  }};
  color: ${({ theme }) => theme.colors.white};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`

const CardContent = styled.div`
  padding: ${({ theme }) => theme.spacing.xl};
`

const CardTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.lg};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  color: ${({ theme }) => theme.colors.black};
  margin-bottom: ${({ theme }) => theme.spacing.sm};
`

const CardDescription = styled.p`
  color: ${({ theme }) => theme.colors.darkGray};
  font-size: ${({ theme }) => theme.fontSizes.md};
  line-height: ${({ theme }) => theme.lineHeights.relaxed};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const ProductsList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: ${({ theme }) => theme.spacing.md};
  margin-bottom: ${({ theme }) => theme.spacing.lg};
`

const ProductTag = styled.div`
  background: ${({ theme }) => theme.colors.accent};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.black};
  transition: ${({ theme }) => theme.transitions.fast};
  cursor: pointer;
  
  &:hover {
    background: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.white};
  }
`

const CardActions = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
`

const ActionButton = styled.button`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.xs};
  background: none;
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  color: ${({ theme }) => theme.colors.darkGray};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.md};
  border-radius: ${({ theme }) => theme.borderRadius.md};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  font-size: ${({ theme }) => theme.fontSizes.sm};
  
  &:hover {
    border-color: ${({ theme }) => theme.colors.primary};
    color: ${({ theme }) => theme.colors.primary};
  }
`

const PublishedDate = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  color: ${({ theme }) => theme.colors.mediumGray};
  text-transform: uppercase;
  letter-spacing: 0.5px;
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
  }
`

const Lookbook: React.FC = () => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'campaign' | 'lifestyle' | 'influencer'>('all')
  const [favorites, setFavorites] = useState<string[]>([])

  // Mock lookbook data
  const lookbookItems: LookbookItem[] = [
    {
      _id: '1',
      title: 'Summer Confidence Campaign',
      description: 'Our latest campaign celebrating confidence and comfort in the summer heat. Featuring our new lightweight collection.',
      category: 'campaign',
      images: [
        { url: '/placeholder-campaign-1.jpg', alt: 'Summer Confidence Campaign' }
      ],
      products: [
        { _id: '1', name: 'Comfort Ribbed Dress', price: 89.99, slug: 'comfort-ribbed-dress' },
        { _id: '2', name: 'Cozy Lounge Set', price: 135.00, slug: 'cozy-lounge-set' }
      ],
      tags: ['summer', 'campaign', 'confidence'],
      publishedAt: '2024-10-15'
    },
    {
      _id: '2',
      title: 'Everyday Elegance',
      description: 'Street style inspiration showing how to elevate your everyday look with Erica Spanks pieces.',
      category: 'lifestyle',
      images: [
        { url: '/placeholder-lifestyle-1.jpg', alt: 'Everyday Elegance Lifestyle' }
      ],
      products: [
        { _id: '3', name: 'Essential Midi Dress', price: 79.99, slug: 'essential-midi-dress' }
      ],
      tags: ['lifestyle', 'everyday', 'elegant'],
      publishedAt: '2024-10-10'
    },
    {
      _id: '3',
      title: '@fashionista_jane Collaboration',
      description: 'Fashion influencer Jane styles our latest two-piece sets for her autumn wardrobe refresh.',
      category: 'influencer',
      images: [
        { url: '/placeholder-influencer-1.jpg', alt: 'Influencer Jane Collaboration' }
      ],
      products: [
        { _id: '4', name: 'Autumn Two-Piece Set', price: 149.99, slug: 'autumn-two-piece-set' }
      ],
      tags: ['influencer', 'collaboration', 'autumn'],
      publishedAt: '2024-10-05'
    }
  ]

  const filteredItems = lookbookItems.filter(item => 
    activeFilter === 'all' || item.category === activeFilter
  )

  const toggleFavorite = (itemId: string) => {
    setFavorites(prev => 
      prev.includes(itemId) 
        ? prev.filter(id => id !== itemId)
        : [...prev, itemId]
    )
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const getCategoryLabel = (category: string) => {
    switch (category) {
      case 'campaign':
        return 'Campaign'
      case 'lifestyle':
        return 'Lifestyle'
      case 'influencer':
        return 'Influencer'
      default:
        return category
    }
  }

  return (
    <Container>
      <HeroSection>
        <HeroTitle>Lookbook</HeroTitle>
        <HeroSubtitle>
          Discover inspiration through our campaigns, lifestyle moments, and influencer collaborations. 
          See how confident women style Erica Spanks pieces.
        </HeroSubtitle>
      </HeroSection>

      <MainContent>
        <FilterTabs>
          {(['all', 'campaign', 'lifestyle', 'influencer'] as const).map(filter => (
            <FilterTab
              key={filter}
              $active={activeFilter === filter}
              onClick={() => setActiveFilter(filter)}
            >
              {filter === 'all' ? 'All' : getCategoryLabel(filter)}
            </FilterTab>
          ))}
        </FilterTabs>

        {filteredItems.length === 0 ? (
          <EmptyState>
            <h3>No content found</h3>
            <p>Check back soon for more inspiring looks and campaigns.</p>
          </EmptyState>
        ) : (
          <LookbookGrid>
            {filteredItems.map(item => (
              <LookbookCard key={item._id}>
                <ImageContainer>
                  <img
                    src={item.images[0]?.url || '/placeholder.jpg'}
                    alt={item.images[0]?.alt || item.title}
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iNDAwIiBoZWlnaHQ9IjUwMCIgZmlsbD0iI0Y1RTZEMyIvPjx0ZXh0IHg9IjUwJSIgeT0iNTAlIiBkb21pbmFudC1iYXNlbGluZT0ibWlkZGxlIiB0ZXh0LWFuY2hvcj0ibWlkZGxlIiBmb250LWZhbWlseT0ic2Fucy1zZXJpZiIgZm9udC1zaXplPSIyMHB4IiBmaWxsPSIjNjY2NjY2Ij5Mb29rYm9vayBJbWFnZTwvdGV4dD48L3N2Zz4='
                    }}
                  />
                  
                  <CategoryBadge $category={item.category}>
                    {getCategoryLabel(item.category)}
                  </CategoryBadge>
                  
                  <ImageOverlay>
                    <OverlayContent>
                      <h3>{item.title}</h3>
                      {item.description && <p>{item.description}</p>}
                    </OverlayContent>
                  </ImageOverlay>
                </ImageContainer>

                <CardContent>
                  <CardTitle>{item.title}</CardTitle>
                  
                  {item.description && (
                    <CardDescription>{item.description}</CardDescription>
                  )}
                  
                  {item.products && item.products.length > 0 && (
                    <ProductsList>
                      {item.products.map(product => (
                        <ProductTag key={product._id}>
                          <ShoppingBag size={14} />
                          <span>{product.name}</span>
                          <span>${product.price.toFixed(2)}</span>
                        </ProductTag>
                      ))}
                    </ProductsList>
                  )}
                  
                  <CardActions>
                    <PublishedDate>
                      {formatDate(item.publishedAt)}
                    </PublishedDate>
                    
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <ActionButton onClick={() => toggleFavorite(item._id)}>
                        <Heart 
                          size={16} 
                          fill={favorites.includes(item._id) ? '#F4C2C2' : 'none'}
                          color={favorites.includes(item._id) ? '#F4C2C2' : 'currentColor'}
                        />
                        Save
                      </ActionButton>
                      
                      <ActionButton>
                        <ExternalLink size={16} />
                        Share
                      </ActionButton>
                    </div>
                  </CardActions>
                </CardContent>
              </LookbookCard>
            ))}
          </LookbookGrid>
        )}
      </MainContent>
    </Container>
  )
}

export default Lookbook
