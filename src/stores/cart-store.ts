import { create } from 'zustand'
import { createJSONStorage, persist } from 'zustand/middleware'

import { calculatePrice } from '@/lib/price'
import type { ImageSize, LicenseType } from '@/types/enums'
import type { LocalCartItem } from '@/types/cart'

interface CartStore {
  items: LocalCartItem[]
  addItem: (item: Omit<LocalCartItem, 'id' | 'addedAt'>) => void
  removeItem: (id: string) => void
  updateItem: (
    id: string,
    size: ImageSize,
    licenseType: LicenseType,
    basePrice: number
  ) => void
  clearCart: () => void
  setItemsFromServer: (items: LocalCartItem[]) => void
  totalCount: () => number
  totalAmount: () => number
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: item => {
        const exists = get().items.some(
          i =>
            i.imageId === item.imageId &&
            i.size === item.size &&
            i.licenseType === item.licenseType
        )
        if (exists) return

        set(state => ({
          items: [
            ...state.items,
            {
              ...item,
              id: crypto.randomUUID(),
              addedAt: Date.now(),
            },
          ],
        }))
      },

      removeItem: id => {
        set(state => ({
          items: state.items.filter(i => i.id !== id),
        }))
      },

      updateItem: (id, size, licenseType, basePrice) => {
        set(state => ({
          items: state.items.map(i =>
            i.id === id
              ? {
                  ...i,
                  size,
                  licenseType,
                  price: calculatePrice(basePrice, size, licenseType),
                }
              : i
          ),
        }))
      },

      clearCart: () => {
        set({ items: [] })
      },

      setItemsFromServer: items => {
        set({ items })
      },

      totalCount: () => get().items.length,

      totalAmount: () => get().items.reduce((sum, item) => sum + item.price, 0),
    }),
    {
      name: 'jiangs-cart',
      storage: createJSONStorage(() => localStorage),
    }
  )
)
