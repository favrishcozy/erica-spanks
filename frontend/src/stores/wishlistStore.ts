import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface WishlistStore {
  items: string[] // array of product IDs
  addToWishlist: (productId: string) => void
  removeFromWishlist: (productId: string) => void
  isInWishlist: (productId: string) => boolean
  getWishlist: () => string[]
  clearWishlist: () => void
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      items: [],

      addToWishlist: (productId: string) => {
        const { items } = get()
        if (!items.includes(productId)) {
          set({ items: [...items, productId] })
        }
      },

      removeFromWishlist: (productId: string) => {
        const { items } = get()
        set({ items: items.filter(id => id !== productId) })
      },

      isInWishlist: (productId: string) => {
        const { items } = get()
        return items.includes(productId)
      },

      getWishlist: () => {
        return get().items
      },

      clearWishlist: () => {
        set({ items: [] })
      },
    }),
    {
      name: 'wishlist-storage',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
