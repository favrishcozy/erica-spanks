import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phone?: string
  addresses: Address[]
  orders: Order[]
  wishlist: string[]
}

export interface Address {
  id: string
  label: string
  firstName: string
  lastName: string
  company?: string
  address1: string
  address2?: string
  city: string
  state: string
  zipCode: string
  country: string
  phone?: string
  isDefault: boolean
}

export interface Order {
  id: string
  orderNumber: string
  status: 'pending' | 'processing' | 'shipped' | 'delivered' | 'cancelled'
  total: number
  items: OrderItem[]
  shippingAddress: Address
  billingAddress: Address
  createdAt: string
  updatedAt: string
}

export interface OrderItem {
  id: string
  productId: string
  name: string
  price: number
  quantity: number
  size: string
  color: string
  image: string
}

interface AuthStore {
  user: User | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string) => Promise<void>
  register: (userData: RegisterData) => Promise<void>
  logout: () => void
  updateProfile: (userData: Partial<User>) => Promise<void>
  addAddress: (address: Omit<Address, 'id'>) => void
  updateAddress: (id: string, address: Partial<Address>) => void
  removeAddress: (id: string) => void
  setDefaultAddress: (id: string) => void
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
}

export interface RegisterData {
  firstName: string
  lastName: string
  email: string
  password: string
  phone?: string
}

export const useAuthStore = create<AuthStore>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isLoading: false,
      
      login: async (email: string, password: string) => {
        set({ isLoading: true })
        try {
          // API call would go here
          // const response = await api.post('/auth/login', { email, password })
          
          // Mock user data for now
          const mockUser: User = {
            id: '1',
            email,
            firstName: 'Jane',
            lastName: 'Doe',
            addresses: [],
            orders: [],
            wishlist: []
          }
          
          set({
            user: mockUser,
            token: 'mock-token',
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      register: async (userData: RegisterData) => {
        set({ isLoading: true })
        try {
          // API call would go here
          // const response = await api.post('/auth/register', userData)
          
          // Mock user data for now
          const mockUser: User = {
            id: '1',
            email: userData.email,
            firstName: userData.firstName,
            lastName: userData.lastName,
            phone: userData.phone,
            addresses: [],
            orders: [],
            wishlist: []
          }
          
          set({
            user: mockUser,
            token: 'mock-token',
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      logout: () => {
        set({
          user: null,
          token: null
        })
      },
      
      updateProfile: async (userData: Partial<User>) => {
        const { user } = get()
        if (!user) return
        
        set({ isLoading: true })
        try {
          // API call would go here
          // const response = await api.patch('/auth/profile', userData)
          
          set({
            user: { ...user, ...userData },
            isLoading: false
          })
        } catch (error) {
          set({ isLoading: false })
          throw error
        }
      },
      
      addAddress: (address: Omit<Address, 'id'>) => {
        const { user } = get()
        if (!user) return
        
        const newAddress: Address = {
          ...address,
          id: Date.now().toString()
        }
        
        set({
          user: {
            ...user,
            addresses: [...user.addresses, newAddress]
          }
        })
      },
      
      updateAddress: (id: string, addressData: Partial<Address>) => {
        const { user } = get()
        if (!user) return
        
        set({
          user: {
            ...user,
            addresses: user.addresses.map(addr =>
              addr.id === id ? { ...addr, ...addressData } : addr
            )
          }
        })
      },
      
      removeAddress: (id: string) => {
        const { user } = get()
        if (!user) return
        
        set({
          user: {
            ...user,
            addresses: user.addresses.filter(addr => addr.id !== id)
          }
        })
      },
      
      setDefaultAddress: (id: string) => {
        const { user } = get()
        if (!user) return
        
        set({
          user: {
            ...user,
            addresses: user.addresses.map(addr => ({
              ...addr,
              isDefault: addr.id === id
            }))
          }
        })
      },
      
      addToWishlist: (productId: string) => {
        const { user } = get()
        if (!user) return
        
        if (!user.wishlist.includes(productId)) {
          set({
            user: {
              ...user,
              wishlist: [...user.wishlist, productId]
            }
          })
        }
      },
      
      removeFromWishlist: (productId: string) => {
        const { user } = get()
        if (!user) return
        
        set({
          user: {
            ...user,
            wishlist: user.wishlist.filter(id => id !== productId)
          }
        })
      },
      
      isInWishlist: (productId: string) => {
        const { user } = get()
        return user?.wishlist.includes(productId) || false
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        user: state.user,
        token: state.token
      }),
    }
  )
)
