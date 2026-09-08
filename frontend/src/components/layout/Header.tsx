import React, { useState, useEffect, useRef } from 'react'
import api from '../../services/api'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import styled from 'styled-components'
import { Search, ShoppingBag, User, Menu, X, Heart, ChevronDown, Settings } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useAuth } from '../../contexts/AuthContext'

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

const DropdownWrapper = styled.div`
  position: relative;
  display: inline-block;
`

const DropdownButton = styled.button<{ $isActive?: boolean }>`
  background: none;
  border: none;
  cursor: pointer;
  color: ${({ theme, $isActive }) => $isActive ? theme.colors.primary : theme.colors.black};
  font-weight: ${({ theme, $isActive }) => $isActive ? theme.fontWeights.semibold : theme.fontWeights.medium};
  text-transform: uppercase;
  font-size: ${({ theme }) => theme.fontSizes.xs};
  padding: ${({ theme }) => theme.spacing.sm} 0;
  display: flex;
  align-items: center;
  gap: 6px;

  &:hover {
    color: ${({ theme }) => theme.colors.primary};
  }
`

const DropdownMenu = styled.div<{ $open: boolean }>`
  position: absolute;
  top: 100%;
  left: 0;
  background: ${({ theme }) => theme.colors.white};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  box-shadow: ${({ theme }) => theme.shadows.md};
  min-width: 220px;
  padding: ${({ theme }) => theme.spacing.sm};
  display: ${({ $open }) => $open ? 'block' : 'none'};
  z-index: ${({ theme }) => theme.zIndex.dropdown};
`

const DropdownItem = styled(Link)`
  display: block;
  padding: 8px 10px;
  color: ${({ theme }) => theme.colors.black};
  text-decoration: none;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryLight};
    color: ${({ theme }) => theme.colors.primary};
  }
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
  padding: ${({ theme }) => `${theme.spacing.xs} ${theme.spacing.lg} ${theme.spacing.xs} 36px`};
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
  left: 12px;
  width: 16px;
  height: 16px;
  color: ${({ theme }) => theme.colors.darkGray};
  pointer-events: none;
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
  margin-bottom: ${({ theme }) => theme.spacing.md};
`

const MobileSearchButton = styled(IconButton)`
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: none;
  }
`

const MobileSearchOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  top: 60px;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.white};
  border-bottom: 1px solid ${({ theme }) => theme.colors.lightGray};
  padding: ${({ theme }) => theme.spacing.md};
  z-index: ${({ theme }) => theme.zIndex.sticky - 1};
  transform: translateY(${({ $isOpen }) => $isOpen ? '0' : '-100%'});
  opacity: ${({ $isOpen }) => $isOpen ? 1 : 0};
  visibility: ${({ $isOpen }) => $isOpen ? 'visible' : 'hidden'};
  transition: all 0.3s ease;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: none;
  }
`

const MobileSearchForm = styled.form`
  position: relative;
  display: flex;
  align-items: center;
  width: 100%;
  background: ${({ theme }) => theme.colors.offWhite};
  border-radius: ${({ theme }) => theme.borderRadius.lg};
  padding: ${({ theme }) => theme.spacing.xs} ${({ theme }) => theme.spacing.sm};
  border: 1px solid ${({ theme }) => theme.colors.lightGray};
  transition: ${({ theme }) => theme.transitions.fast};

  &:focus-within {
    border-color: ${({ theme }) => theme.colors.primary};
    box-shadow: 0 0 0 2px ${({ theme }) => theme.colors.primaryLight};
  }
`

const MobileSearchIcon = styled(Search)`
  width: 18px;
  height: 18px;
  color: ${({ theme }) => theme.colors.mediumGray};
  margin-right: ${({ theme }) => theme.spacing.sm};
  flex-shrink: 0;
`

const MobileSearchInputExpanded = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: ${({ theme }) => theme.fontSizes.sm};
  color: ${({ theme }) => theme.colors.black};
  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.colors.mediumGray};
    font-size: ${({ theme }) => theme.fontSizes.sm};
  }
`

const MobileSearchSubmitButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  background: ${({ theme }) => theme.colors.primary};
  border: none;
  color: ${({ theme }) => theme.colors.white};
  cursor: pointer;
  transition: ${({ theme }) => theme.transitions.fast};
  margin-left: ${({ theme }) => theme.spacing.xs};
  flex-shrink: 0;

  &:hover {
    background: ${({ theme }) => theme.colors.primaryDark};
    transform: scale(1.05);
  }

  &:active {
    transform: scale(0.95);
  }
`

const Header: React.FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [isMobileSearchOpen, setIsMobileSearchOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const { items } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  const { user } = useAuth()

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlistItems.length
  
  // Close mobile menu and search on route change
  useEffect(() => {
    setIsMenuOpen(false)
    setIsMobileSearchOpen(false)
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
    'YOUR WARDROBE': [
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
  
  // Dynamic categories and occasions loaded from API (fallback to navCategories shape)
  const [allCategories, setAllCategories] = useState<any[]>([])
  const [allOccasions, setAllOccasions] = useState<any[]>([])
  const [openDropdown, setOpenDropdown] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/categories')
        const cats = res.data?.data || []
        setAllCategories(cats)
      } catch (e) {
        console.error('Failed to load categories for header:', e)
      }
    }
    fetchCategories()
  }, [])

  useEffect(() => {
    const fetchOccasions = async () => {
      try {
        const res = await api.get('/occasions')
        const occasions = res.data?.data || []
        setAllOccasions(occasions)
      } catch (e) {
        console.error('Failed to load occasions for header:', e)
      }
    }
    fetchOccasions()
  }, [])

  const primaryCats = allCategories
  const occasionCats = allOccasions

  // Close dropdown on outside click
  useEffect(() => {
    const onDocClick = (e: MouseEvent) => {
      if (!dropdownRef.current) return
      if (!(e.target instanceof Node)) return
      if (!dropdownRef.current.contains(e.target)) {
        setOpenDropdown(null)
      }
    }
    document.addEventListener('click', onDocClick)
    return () => document.removeEventListener('click', onDocClick)
  }, [])

  const toggleDropdown = (key: string) => {
    setOpenDropdown(prev => prev === key ? null : key)
  }
  
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
          
          <Nav ref={dropdownRef}>
            <NavLink
              to="/products/new-in"
              $isActive={location.pathname === '/products/new-in'}
            >
              New In
            </NavLink>

            <DropdownWrapper>
              <DropdownButton
                onClick={() => toggleDropdown('clothing')}
                aria-expanded={openDropdown === 'clothing'}
                $isActive={openDropdown === 'clothing'}
              >
                Your Wardrobe
                <ChevronDown size={14} />
              </DropdownButton>
              <DropdownMenu $open={openDropdown === 'clothing'}>
                {primaryCats.length > 0 ? (
                  primaryCats.map((c: any) => (
                    <DropdownItem
                      key={c._id}
                      to={`/products?category=${encodeURIComponent(c.slug)}`}
                      onClick={() => setOpenDropdown(null)}
                    >
                      {c.name}
                    </DropdownItem>
                  ))
                ) : (
                  Object.entries(navCategories['YOUR WARDROBE']).map(([k, v]: any, idx) => (
                    <DropdownItem key={idx} to={`/products?category=${encodeURIComponent(v.path.split('/').pop())}`} onClick={() => setOpenDropdown(null)}>
                      {v.label}
                    </DropdownItem>
                  ))
                )}
              </DropdownMenu>
            </DropdownWrapper>

            <DropdownWrapper>
              <DropdownButton
                onClick={() => toggleDropdown('occasions')}
                aria-expanded={openDropdown === 'occasions'}
                $isActive={openDropdown === 'occasions'}
              >
                Occasions
                <ChevronDown size={14} />
              </DropdownButton>
              <DropdownMenu $open={openDropdown === 'occasions'}>
                {occasionCats.length > 0 ? (
                  occasionCats.map((c: any) => (
                    <DropdownItem
                      key={c._id}
                      to={`/products?occasion=${encodeURIComponent(c.slug)}`}
                      onClick={() => setOpenDropdown(null)}
                    >
                      {c.name}
                    </DropdownItem>
                  ))
                ) : (
                  Object.entries(navCategories['OCCASIONS']).map(([k, v]: any, idx) => (
                    <DropdownItem key={idx} to={`/products?occasion=${encodeURIComponent(v.path.split('/').pop())}`} onClick={() => setOpenDropdown(null)}>
                      {v.label}
                    </DropdownItem>
                  ))
                )}
              </DropdownMenu>
            </DropdownWrapper>

            <NavLink
              to="/about"
              $isActive={location.pathname === '/about'}
            >
              About
            </NavLink>

            <NavLink
              to="/contact"
              $isActive={location.pathname === '/contact'}
            >
              Contact
            </NavLink>
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

            {user?.role === 'admin' && (
              <IconButton as={Link} to="/admin/dashboard" title="Admin Panel">
                <Settings size={16} />
              </IconButton>
            )}

            {user && (
              <IconButton as={Link} to="/wishlist">
                <Heart size={16} />
                {wishlistCount > 0 && (
                  <CartBadge>{wishlistCount}</CartBadge>
                )}
              </IconButton>
            )}

            {/* Show profile for non-admin users; show login for guests; hide profile for admins */}
            {user ? (
              user.role !== 'admin' ? (
                <IconButton as={Link} to="/profile">
                  <User size={16} />
                </IconButton>
              ) : null
            ) : (
              <IconButton as={Link} to="/login">
                <User size={16} />
              </IconButton>
            )}
            
            <IconButton as={Link} to="/cart">
              <ShoppingBag size={16} />
              {totalItems > 0 && (
                <CartBadge>{totalItems}</CartBadge>
              )}
            </IconButton>
          </Actions>
        </HeaderContent>
      </HeaderContainer>

      {/* Mobile Search Overlay */}
      <MobileSearchOverlay $isOpen={isMobileSearchOpen}>
        <MobileSearchForm onSubmit={(e) => { handleSearchSubmit(e); setIsMobileSearchOpen(false); }}>
          <MobileSearchIcon />
          <MobileSearchInputExpanded
            type="text"
            placeholder="Search products..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            autoFocus
          />
          <MobileSearchSubmitButton type="submit">
            <Search size={16} />
          </MobileSearchSubmitButton>
        </MobileSearchForm>
      </MobileSearchOverlay>

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
            <MobileSearchForm onSubmit={(e) => { handleSearchSubmit(e); setIsMenuOpen(false); }}>
              <MobileSearchIcon />
              <MobileSearchInputExpanded
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <MobileSearchSubmitButton type="submit">
                <Search size={16} />
              </MobileSearchSubmitButton>
            </MobileSearchForm>
          </MobileSearchContainer>

          {/* New In */}
          <CategorySection>
            <MobileNavLink
              to="/products/new-in"
              onClick={() => setIsMenuOpen(false)}
              style={{ borderBottom: 'none', paddingTop: 0 }}
            >
              New In
            </MobileNavLink>
          </CategorySection>

          {/* Your Wardrobe */}
          <CategorySection>
            <CategoryTitle>Your Wardrobe</CategoryTitle>
            {primaryCats.length > 0 ? (
              primaryCats.map((c: any) => (
                <MobileNavLink
                  key={c._id}
                  to={`/products?category=${encodeURIComponent(c.slug)}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {c.name}
                </MobileNavLink>
              ))
            ) : (
              navCategories['YOUR WARDROBE'].map((item) => (
                <MobileNavLink
                  key={item.path}
                  to={`/products?category=${encodeURIComponent(item.path.split('/').pop())}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </MobileNavLink>
              ))
            )}
          </CategorySection>

          {/* Occasions */}
          <CategorySection>
            <CategoryTitle>Occasions</CategoryTitle>
            {occasionCats.length > 0 ? (
              occasionCats.map((c: any) => (
                <MobileNavLink
                  key={c._id}
                  to={`/products?occasion=${encodeURIComponent(c.slug)}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {c.name}
                </MobileNavLink>
              ))
            ) : (
              navCategories['OCCASIONS'].map((item) => (
                <MobileNavLink
                  key={item.path}
                  to={`/products?occasion=${encodeURIComponent(item.path.split('/').pop())}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </MobileNavLink>
              ))
            )}
          </CategorySection>

          {/* About and Contact */}
          <CategorySection>
            <CategoryTitle>More</CategoryTitle>
            {user?.role === 'admin' && (
              <MobileNavLink to="/admin/dashboard" onClick={() => setIsMenuOpen(false)}>
                Admin Panel
              </MobileNavLink>
            )}
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
