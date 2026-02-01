import { authAPI } from './api'

export interface LoginCredentials {
  email: string
  password: string
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
  dateOfBirth?: string
  gender?: string
  preferences?: {
    newsletter?: boolean
    smsMarketing?: boolean
    emailMarketing?: boolean
  }
}

export interface AuthResponse {
  success: boolean
  data: {
    user: any
    token: string
  }
  message: string
}

export interface User {
  _id: string
  firstName: string
  lastName: string
  email: string
  phone?: string
  role: 'customer' | 'admin'
  isActive: boolean
  isVerified: boolean
  addresses: any[]
  wishlist: any[]
  preferences: {
    newsletter: boolean
    smsMarketing: boolean
    emailMarketing: boolean
  }
  createdAt: string
  updatedAt: string
}

class AuthService {
  private token: string | null = null
  private user: User | null = null

  constructor() {
    this.loadTokenFromStorage()
  }

  private loadTokenFromStorage() {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('authToken')
      const userData = localStorage.getItem('userData')
      if (userData) {
        try {
          this.user = JSON.parse(userData)
        } catch (error) {
          console.error('Error parsing user data from storage:', error)
          this.clearAuth()
        }
      }
    }
  }

  private saveAuthToStorage(token: string, user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('authToken', token)
      localStorage.setItem('userData', JSON.stringify(user))
    }
  }

  private clearAuthFromStorage() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken')
      localStorage.removeItem('userData')
    }
  }

  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      const response = await authAPI.login(credentials)
      
      if (response.success && response.data) {
        this.token = response.data.token
        this.user = response.data.user
        this.saveAuthToStorage(response.data.token, response.data.user)
      }
      
      return response
    } catch (error: any) {
      console.error('Login error:', error)
      throw new Error(error.response?.data?.error || 'Login failed')
    }
  }

  async register(userData: RegisterData): Promise<AuthResponse> {
    try {
      const response = await authAPI.register(userData)
      
      if (response.success && response.data) {
        this.token = response.data.token
        this.user = response.data.user
        this.saveAuthToStorage(response.data.token, response.data.user)
      }
      
      return response
    } catch (error: any) {
      console.error('Registration error:', error)
      throw new Error(error.response?.data?.error || 'Registration failed')
    }
  }

  async logout(): Promise<void> {
    try {
      // Call backend logout endpoint to clear server-side sessions
      try {
        await authAPI.logout()
      } catch (error) {
        console.log('Note: Backend logout returned an error, but clearing local session anyway', error)
      }
    } catch (error) {
      console.error('Logout error:', error)
    } finally {
      // Always clear local session regardless of backend response
      this.token = null
      this.user = null
      this.clearAuthFromStorage()
      
      // Clear any other session-related data
      if (typeof window !== 'undefined') {
        // Clear cart and other temporary data
        sessionStorage.clear()
        // Clear Zustand store data
        localStorage.removeItem('cart-storage')
        localStorage.removeItem('wishlist-storage')
        localStorage.removeItem('auth-storage')
        
        // Clear any pending orders or temporary data
        localStorage.removeItem('pendingOrderId')
        localStorage.removeItem('cartData')
        localStorage.removeItem('userPreferences')
        localStorage.removeItem('cart')
        localStorage.removeItem('shippingAddress')
        localStorage.removeItem('billingAddress')
        localStorage.removeItem('selectedPaymentMethod')
        localStorage.removeItem('orderSummary')
        localStorage.removeItem('guestUserData')
        localStorage.removeItem('guestCart')
        localStorage.removeItem('guestShipping')
        localStorage.removeItem('guestBilling')
        localStorage.removeItem('guestPayment')
        localStorage.removeItem('guestOrder')
        localStorage.removeItem('guestCheckout')
        localStorage.removeItem('guestSession')
        localStorage.removeItem('guestCartItems')
        localStorage.removeItem('guestCartTotal')
        localStorage.removeItem('guestCartCount')
        localStorage.removeItem('guestCartSubtotal')
        localStorage.removeItem('guestCartTax')
        localStorage.removeItem('guestCartShipping')
        localStorage.removeItem('guestCartDiscount')
        localStorage.removeItem('guestCartGrandTotal')
        localStorage.removeItem('guestCartItemsCount')
        localStorage.removeItem('guestCartItemsTotal')
        localStorage.removeItem('guestCartItemsSubtotal')
        localStorage.removeItem('guestCartItemsTax')
        localStorage.removeItem('guestCartItemsShipping')
        localStorage.removeItem('guestCartItemsDiscount')
        localStorage.removeItem('guestCartItemsGrandTotal')
        localStorage.removeItem('guestCartItemsCount')
        localStorage.removeItem('guestCartItemsTotal')
        localStorage.removeItem('guestCartItemsSubtotal')
        localStorage.removeItem('guestCartItemsTax')
        localStorage.removeItem('guestCartItemsShipping')
        localStorage.removeItem('guestCartItemsDiscount')
        localStorage.removeItem('guestCartItemsGrandTotal')
      }
    }
  }

  getToken(): string | null {
    return this.token
  }

  getUser(): User | null {
    return this.user
  }

  isAuthenticated(): boolean {
    return !!this.token && !!this.user
  }

  isAdmin(): boolean {
    return this.user?.role === 'admin'
  }

  // Update user data in storage (after profile updates)
  updateUser(user: User): void {
    this.user = user
    if (typeof window !== 'undefined') {
      localStorage.setItem('userData', JSON.stringify(user))
    }
  }
}

// Export a singleton instance
export const authService = new AuthService()