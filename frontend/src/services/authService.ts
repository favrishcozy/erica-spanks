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

  logout(): void {
    this.token = null
    this.user = null
    this.clearAuthFromStorage()
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