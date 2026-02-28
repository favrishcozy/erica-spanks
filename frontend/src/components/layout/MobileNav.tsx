import React from 'react'
import { Link, useLocation } from 'react-router-dom'
import styled from 'styled-components'
import { Home, Search, ShoppingBag, User, Heart } from 'lucide-react'
import { useCartStore } from '../../stores/cartStore'
import { useWishlistStore } from '../../stores/wishlistStore'
import { useAuthStore } from '../../stores/authStore'
import { useAuth } from '../../contexts/AuthContext'

const MobileNavContainer = styled.nav`
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: ${({ theme }) => theme.colors.white};
  border-top: 1px solid ${({ theme }) => theme.colors.lightGray};
  padding: ${({ theme }) => theme.spacing.xs} 0;
  z-index: ${({ theme }) => theme.zIndex.fixed};
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  height: 70px;
  
  @media (min-width: ${({ theme }) => theme.breakpoints.desktop}) {
    display: none;
  }
`

const NavList = styled.div`
  display: flex;
  justify-content: space-around;
  align-items: center;
  max-width: 100%;
  margin: 0 auto;
`

const NavItem = styled(Link)<{ $active?: boolean }>`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: ${({ theme }) => theme.spacing.xs};
  padding: ${({ theme }) => theme.spacing.sm} ${({ theme }) => theme.spacing.xs};
  color: ${({ theme, $active }) => 
    $active ? theme.colors.primary : theme.colors.darkGray};
  font-size: ${({ theme }) => theme.fontSizes.xs};
  font-weight: ${({ theme, $active }) => 
    $active ? theme.fontWeights.bold : theme.fontWeights.medium};
  text-decoration: none;
  transition: ${({ theme }) => theme.transitions.fast};
  position: relative;
  min-width: 0;
  flex: 1;
  height: 100%;
  border-radius: ${({ theme }) => theme.borderRadius.md};
  
  &:hover {
    color: ${({ theme }) => theme.colors.primary};
    background: ${({ theme }) => theme.colors.offWhite};
  }
  
  &:active {
    transform: scale(0.95);
  }
`

const IconWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
`

const Badge = styled.span`
  position: absolute;
  top: -6px;
  right: -6px;
  background: ${({ theme }) => theme.colors.primary};
  color: ${({ theme }) => theme.colors.white};
  border-radius: ${({ theme }) => theme.borderRadius.full};
  font-size: 10px;
  font-weight: ${({ theme }) => theme.fontWeights.bold};
  min-width: 16px;
  height: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 4px;
`

const NavLabel = styled.span`
  font-size: ${({ theme }) => theme.fontSizes.xs};
  text-transform: uppercase;
  letter-spacing: 0.5px;
  line-height: 1;
`

const MobileNav: React.FC = () => {
  const location = useLocation()
  const { items } = useCartStore()
  const { items: wishlistItems } = useWishlistStore()
  // Prefer context-based auth if available to stay consistent
  let user = null
  try {
    const ctx = useAuth()
    user = ctx?.user ?? null
  } catch (e) {
    const store = useAuthStore()
    user = store.user
  }
  
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const wishlistCount = wishlistItems.length
  
  const navItems = [
    {
      path: '/',
      icon: Home,
      label: 'Home',
    },
    {
      path: '/products',
      icon: Search,
      label: 'Shop',
    },
    {
      path: '/cart',
      icon: ShoppingBag,
      label: 'Bag',
      badge: totalItems,
    },
    {
      path: user ? '/profile' : '/login',
      icon: User,
      label: user ? 'Profile' : 'Login',
      hideForAdmin: true, // Hide profile tab for admin users
    },
  ]
  
  // Filter nav items based on authentication and user role
  const filteredNavItems = navItems.filter(item => {
    if (item.requiresAuth && !user) return false
    if (item.hideForAdmin && user?.role === 'admin') return false
    return true
  })
  
  return (
    <MobileNavContainer>
      <NavList>
        {filteredNavItems.map((item) => {
          const Icon = item.icon
          const isNavItemActive = location.pathname === item.path ||
            (item.path === '/products' && location.pathname.startsWith('/products')) ||
            (item.path === '/search' && location.pathname.startsWith('/search'))
          
          return (
            <NavItem key={item.path} to={item.path} $active={isNavItemActive}>
              <IconWrapper>
                <Icon size={20} strokeWidth={isNavItemActive ? 2.5 : 2} />
                {item.badge !== undefined && item.badge > 0 && (
                  <Badge>{item.badge > 99 ? '99+' : item.badge}</Badge>
                )}
              </IconWrapper>
              <NavLabel>{item.label}</NavLabel>
            </NavItem>
          )
        })}
      </NavList>
    </MobileNavContainer>
  )
}

export default MobileNav