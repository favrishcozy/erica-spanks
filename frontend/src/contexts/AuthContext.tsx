import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { authService, User, LoginCredentials, RegisterData } from '../services/authService'
import { authAPI, wishlistAPI } from '../services/api'

interface AuthContextType {
  user: User | null
  isLoading: boolean
  login: (credentials: LoginCredentials) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => Promise<void>
  isAuthenticated: boolean
  addToWishlist: (productId: string) => Promise<void>
  removeFromWishlist: (productId: string) => Promise<void>
  isInWishlist: (productId: string) => boolean
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

interface AuthProviderProps {
  children: ReactNode
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Check if user is logged in on app start
    const initAuth = () => {
      const currentUser = authService.getUser()
      setUser(currentUser)
      setIsLoading(false)
    }

    initAuth()
  }, [])

  const login = async (credentials: LoginCredentials) => {
    try {
      setIsLoading(true)
      const response = await authService.login(credentials)
      console.log('[AuthContext] Login response:', response)
      if (response.success && response.data) {
        const userData = authService.getUser()
        console.log('[AuthContext] User data after login:', userData)
        console.log('[AuthContext] User role:', userData?.role)
        setUser(userData)
      } else {
        throw new Error((response as any).error || 'Login failed')
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const register = async (userData: RegisterData) => {
    try {
      setIsLoading(true)
      const response = await authService.register(userData)
      if (response.success && response.data) {
        setUser(authService.getUser())
      } else {
        throw new Error((response as any).error || 'Registration failed')
      }
    } catch (error) {
      throw error
    } finally {
      setIsLoading(false)
    }
  }

  const addToWishlist = async (productId: string) => {
    try {
      await wishlistAPI.addToWishlist(productId)
      // Refresh user data to update wishlist
      await refreshUser()
    } catch (error) {
      console.error('Error adding to wishlist:', error)
      throw error
    }
  }

  const removeFromWishlist = async (productId: string) => {
    try {
      await wishlistAPI.removeFromWishlist(productId)
      // Refresh user data to update wishlist
      await refreshUser()
    } catch (error) {
      console.error('Error removing from wishlist:', error)
      throw error
    }
  }

  const isInWishlist = (productId: string): boolean => {
    return user?.wishlist?.includes(productId) || false
  }

  const refreshUser = async () => {
    try {
      const response = await authAPI.getProfile()
      if (response.success && response.data) {
        // Update localStorage with new user data
        localStorage.setItem('userData', JSON.stringify(response.data))
        setUser(response.data)
      }
    } catch (error) {
      console.error('Error refreshing user:', error)
      // Fallback to localStorage
      const localUser = authService.getUser()
      if (localUser) setUser(localUser)
    }
  }

  const logout = async () => {
    await authService.logout()
    setUser(null)
  }

  const value: AuthContextType = {
    user,
    isLoading,
    login,
    register,
    logout,
    isAuthenticated: !!user,
    addToWishlist,
    removeFromWishlist,
    isInWishlist,
    refreshUser,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
