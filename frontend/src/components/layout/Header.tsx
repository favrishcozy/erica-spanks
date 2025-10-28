import React, { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Search, ShoppingBag, User, Menu, X, Heart, ChevronDown } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { useAuthStore } from '../../stores/authStore'

const HeaderContainer = styled.header`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  box-shadow: ${({ theme }) => theme.shadows.sm};
  z-index: ${({ theme }) => theme.zIndex.sticky};
  height: 60px;
  transition: ${({ theme }) => theme.transitions.fast};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    height: 65px;
  }
`

const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  height: 100%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 ${({ theme }) => theme.spacing.md};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    padding: 0 ${({ theme }) => theme.spacing.sm};
  }
`

const LogoContainer = styled(Link)`
  display: flex;
  align-items: center;
  text-decoration: none;
  height: 100%;
  padding: ${({ theme }) => theme.spacing.sm} 0;
`

const LogoImage = styled.img`
  height: 30px;
  width: 150px;
  object-fit: contain;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    height: 28px;
  }
`

const Nav = styled.nav`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.lg};
  
  @media (max-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: none;
  }
`

// Fixed NavLink - using proper transient prop syntax
const NavLink = styled(Link)<{ $isActive?: boolean }>`
  font-weight: ${({ theme, $isActive }) => $isActive ? theme.fontWeights.semibold : theme.fontWeights.medium};
  color: ${({ theme, $isActive }) => $isActive ? theme.colors.primary : theme.colors.black};
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  letter-spacing: 0.8px;
  transition: ${({ theme }) => theme.transitions.fast};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  position: relative;
  text-decoration: none;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  ${({ $isActive, theme }) => $isActive && `
    &::after {
      content: '';
      position: absolute;
      bottom: -1px;
      left: 0;
      right: 0;
      height: 2px;
      background: ${theme.colors.primary};
    }
  `}
`

const Actions = styled.div`
  display: flex;
  align-items: center;
  gap: ${({ theme }) => theme.spacing.sm};
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    gap: ${({ theme }) => theme.spacing.md};
  }
`

const SearchContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  
  @media (max-width: ${({ theme }) => theme.breakpoints.tablet}) {
    display: none;
  }
`

const SearchInput = styled.input`
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.xl};
  border: 1px solid ${({ theme }) => theme.colors.mediumGray};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  width: 200px;
  transition: ${({ theme }) => theme.transitions.fast};
  
  &:focus {
    outline: none;
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 1px ${({ theme }) => theme.colors.primaryLight};
  }
  
  &::placeholder {
    color: ${({ theme }) => theme.colors.darkGray};
    font-size: ${({ theme }) => theme.fontSizes.xs};
  }
`

const SearchIcon = styled(Search)`
  position: absolute;
  left: ${({ theme }) => theme.spacing.sm};
  width: 14px;
  height: 14px;
  color: ${({ theme }) => theme.colors.darkGray};
`

const IconButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: ${({ theme }) => theme.borderRadius.full};
  background: none;
  border: none;
  color: ${({ theme }) => theme.colors.black};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  position: relative;
  
  &:hover {
    background: ${({ theme }) => theme.colors.lightGray};
    color: ${({ theme }) => theme.colors.primary};
  }
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    width: 32px;
    height: 32px;
  }
`

const CartBadge = styled.span`
  position: absolute;
  top: -2px;
  right: -2px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: ${({ theme }) => theme.fontSizes.xxs};
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 3px;
`

const MobileMenuButton = styled(IconButton)`
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: none;
  }
`

const MobileMenuOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: ${({ theme }) => theme.zIndex.modal - 1};
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: none;
  }
`

const MobileMenu = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 0;
  left: 0;
  bottom: 0;
  width: 280px;
  background: ${({ theme }) => theme.colors.white};
  transform: translateX(${({ $isOpen }) => $isOpen ? '0' : '-100%'});
  transition: transform 0.3s ease;
  z-index: ${({ theme }) => theme.zIndex.modal};
  overflow-y: auto;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: none;
  }
`

const MobileMenuHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${({ theme }) => theme.spacing.lg};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  height: 60px;
`

const MobileMenuContent = styled.div`
  padding: ${({ theme }) => theme.spacing.lg};
`

const CategorySection = styled.div`
  margin-bottom: ${({ theme }) => theme.spacing.xl};
`

const CategoryTitle = styled.h3`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme }) => theme.fontWeights.semibold};
  text-transform: uppercase;
  color: ${({ theme }) => theme.colors.darkGray};
  margin-bottom: ${({ theme }) => theme.spacing.md};
  padding-left: ${({ theme }) => theme.spacing.sm};
  letter-spacing: 0.8px;
`

const MobileNavLink = styled(Link)`
  display: block;
  padding: ${({ theme }) => theme.spacing.md} 0;
  font-weight: ${({ theme }) => theme.fontWeights.medium};
  color: ${({ theme }) => theme.colors.black};
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  letter-spacing: 0.5px;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  text-decoration: none;
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
  
  &:last-child {
    border-bottom: none;
  }
`

const MobileSearchContainer = styled.div`
  padding: ${({ theme }) => theme.spacing.md} 0;
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const MobileSearchInput = styled(SearchInput)`
  width: 100%;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.lg} ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xl};
`

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const location = useLocation()
  const navigate = useNavigate()
  const { items } = useCartStore()
  const { user, isInWishlist } = useAuthStore()
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = user?.wishlist?.length || 0
  
  // Close mobile menu on route change
  useEffect(() => {
    setIsMenuOpen(false)
  }, [location.pathname])
  
  // Prevent body scroll when menu is open
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isMenuOpen])
  
  const navCategories = {
    'NEW & TRENDING': [
      { path: '/products/new-in', label: 'New Arrivals' },
      { path: '/products/trending', label: 'Trending Now' },
      { path: '/products/best-sellers', label: 'Best Sellers' },
    ],
    'CLOTHING': [
      { path: '/products/dresses', label: 'Dresses' },
      { path: '/products/tops', label: 'Tops & Blouses' },
      { path: '/products/bottoms', label: 'Bottoms' },
      { path: '/products/loungewear', label: 'Loungewear' },
      { path: '/products/two-piece-sets', label: 'Two-Piece Sets' },
      { path: '/products/outerwear', label: 'Jackets & Coats' },
    ],
    'OCCASIONS': [
      { path: '/products/party', label: 'Party Wear' },
      { path: '/products/casual', label: 'Everyday' },
      { path: '/products/date-night', label: 'Date Night' },
      { path: '/products/work', label: 'Workwear' },
    ],
  }
  
  const mainNavItems = [
    { path: '/products/new-in', label: 'New In' },
    { path: '/products/dresses', label: 'Dresses' },
    { path: '/products/tops', label: 'Tops' },
    { path: '/products/bottoms', label: 'Bottoms' },
    { path: '/products/loungewear', label: 'Loungewear' },
    { path: '/lookbook', label: 'Lookbook' },
    { path: '/about', label: 'About' },
  ]
  
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (searchQuery.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`)
      setSearchQuery('')
      setIsMenuOpen(false)
    }
  }

  // Determine which logo to use based on current theme or route
  const getLogoSource = () => {
    // You can modify this logic based on your theme system
    // For now, using the black logo as default
    return '/EricaLogoBlack.png';
  }
  
  return (
    <>
      <HeaderContainer>
        <HeaderContent>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <MobileMenuButton onClick={() => setIsMenuOpen(!isMenuOpen)}>
              <Menu size={18} />
            </MobileMenuButton>
            <LogoContainer to="/">
              <LogoImage 
                src={getLogoSource()} 
                alt="Erica Spanks" 
              />
            </LogoContainer>
          </div>
          
          <Nav>
            {mainNavItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                $isActive={location.pathname === item.path} // Fixed prop name
              >
                {item.label}
              </NavLink>
            ))}
          </Nav>
          
          <Actions>
            <SearchContainer>
              <form onSubmit={handleSearchSubmit}>
                <SearchIcon size={14} />
                <SearchInput
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </form>
            </SearchContainer>
            
            {user && (
              <IconButton as={Link} to="/wishlist">
                <Heart size={16} />
                {wishlistCount > 0 && (
                  <CartBadge>{wishlistCount}</CartBadge>
                )}
              </IconButton>
            )}
            
            <IconButton as={Link} to={user ? '/profile' : '/login'}>
              <User size={16} />
            </IconButton>
            
            <IconButton as={Link} to="/cart">
              <ShoppingBag size={16} />
              {totalItems > 0 && (
                <CartBadge>{totalItems}</CartBadge>
              )}
            </IconButton>
          </Actions>
        </HeaderContent>
      </HeaderContainer>
      
      {/* Mobile Menu Overlay */}
      <MobileMenuOverlay 
        $isOpen={isMenuOpen} 
        onClick={() => setIsMenuOpen(false)} 
      />
      
      {/* Mobile Menu */}
      <MobileMenu $isOpen={isMenuOpen}>
        <MobileMenuHeader>
          <LogoContainer to="/" onClick={() => setIsMenuOpen(false)}>
            <LogoImage 
              src={getLogoSource()} 
              alt="Erica Spanks" 
            />
          </LogoContainer>
          <IconButton onClick={() => setIsMenuOpen(false)}>
            <X size={18} />
          </IconButton>
        </MobileMenuHeader>
        
        <MobileMenuContent>
          <MobileSearchContainer>
            <form onSubmit={handleSearchSubmit}>
              <SearchIcon size={14} />
              <MobileSearchInput
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </form>
          </MobileSearchContainer>
          
          {Object.entries(navCategories).map(([categoryName, items]) => (
            <CategorySection key={categoryName}>
              <CategoryTitle>{categoryName}</CategoryTitle>
              {items.map((item) => (
                <MobileNavLink
                  key={item.path}
                  to={item.path}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </MobileNavLink>
              ))}
            </CategorySection>
          ))}
          
          <CategorySection>
            <CategoryTitle>MORE</CategoryTitle>
            <MobileNavLink to="/lookbook" onClick={() => setIsMenuOpen(false)}>
              Lookbook
            </MobileNavLink>
            <MobileNavLink to="/about" onClick={() => setIsMenuOpen(false)}>
              About Us
            </MobileNavLink>
            <MobileNavLink to="/contact" onClick={() => setIsMenuOpen(false)}>
              Contact
            </MobileNavLink>
            <MobileNavLink to="/size-guide" onClick={() => setIsMenuOpen(false)}>
              Size Guide
            </MobileNavLink>
          </CategorySection>
        </MobileMenuContent>
      </MobileMenu>
    </>
  )
}

export default Header