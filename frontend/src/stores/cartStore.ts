import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

export interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  size?: string
  color?: string
}

interface CartStore {
  items: CartItem[]
  isOpen: boolean
  addItem: (item: CartItem) => void
  removeItem: (id: string, size?: string, color?: string) => void
  updateQuantity: (id: string, size?: string, color?: string, quantity?: number) => void
  clearCart: () => void
  getTotalPrice: () => number
  getTotalItems: () => number
  toggleCart: () => void
  setCartOpen: (isOpen: boolean) => void
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],
      isOpen: false,

      addItem: (item) => {
        const { items } = get()
        const existingItemIndex = items.findIndex(
          (cartItem) => 
            cartItem.id === item.id &&
            cartItem.size === item.size &&
            cartItem.color === item.color
        )
        
        if (existingItemIndex >= 0) {
          // Item already exists, update quantity
          const updatedItems = [...items]
          updatedItems[existingItemIndex].quantity += item.quantity
          set({ items: updatedItems })
        } else {
          // Add new item
          set({
            items: [...items, item]
          })
        }
      },

      removeItem: (id, size, color) => {
        const { items } = get()
        set({
          items: items.filter((item) => 
            !(item.id === id && 
              item.size === size && 
              item.color === color)
          )
        })
      },

      updateQuantity: (id, size, color, quantity) => {
        if (quantity === undefined || quantity < 1) return
        
        const { items } = get()
        const updatedItems = items.map((item) =>
          item.id === id && 
          item.size === size && 
          item.color === color
            ? { ...item, quantity }
            : item
        )
        set({ items: updatedItems })
      },

      clearCart: () => {
        set({ items: [] })
      },

      getTotalPrice: () => {
        const { items } = get()
        return items.reduce((total, item) => total + (item.price || 0) * item.quantity, 0)
      },

      getTotalItems: () => {
        const { items } = get()
        return items.reduce((total, item) => total + item.quantity, 0)
      },

      toggleCart: () => {
        set({ isOpen: !get().isOpen })
      },

      setCartOpen: (isOpen) => {
        set({ isOpen })
      },
    }),
    {
      name: 'cart-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
)