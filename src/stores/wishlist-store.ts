import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

interface WishlistStore {
  imageIds: string[]
  addItem: (imageId: string) => void
  removeItem: (imageId: string) => void
  toggleItem: (imageId: string) => void
  isWishlisted: (imageId: string) => boolean
}

export const useWishlistStore = create<WishlistStore>()(
  persist(
    (set, get) => ({
      imageIds: [],

      addItem: imageId => {
        if (get().imageIds.includes(imageId)) return
        set(state => ({ imageIds: [...state.imageIds, imageId] }))
      },

      removeItem: imageId => {
        set(state => ({
          imageIds: state.imageIds.filter(id => id !== imageId),
        }))
      },

      toggleItem: imageId => {
        if (get().isWishlisted(imageId)) {
          get().removeItem(imageId)
        } else {
          get().addItem(imageId)
        }
      },

      isWishlisted: imageId => get().imageIds.includes(imageId),
    }),
    {
      name: 'jiangs-wishlist',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
