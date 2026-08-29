import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export interface CartItem {
  id: string;
  productId: string;
  productTitle: string;
  productHandle: string;
  image: string;
  price: { amount: string; currencyCode: string };
  quantity: number;
  selectedSize: string | null;
  selectedColor: string | null;
}

interface CartStore {
  items: CartItem[];
  addItem: (item: Omit<CartItem, "id">) => void;
  updateQuantity: (id: string, quantity: number) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
}

export const useCartStore = create<CartStore>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (item) => {
        const id = `${item.productId}::${item.selectedSize ?? "none"}::${item.selectedColor ?? "none"}`;
        set((state) => {
          const existingItem = state.items.find((i) => i.id === id);
          if (existingItem) {
            return {
              items: state.items.map((i) =>
                i.id === id ? { ...i, quantity: i.quantity + item.quantity } : i
              ),
            };
          }
          return { items: [...state.items, { ...item, id }] };
        });
      },

      updateQuantity: (id, quantity) => {
        if (quantity <= 0) {
          get().removeItem(id);
          return;
        }
        set((state) => ({
          items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
        }));
      },

      removeItem: (id) => {
        set((state) => ({
          items: state.items.filter((i) => i.id !== id),
        }));
      },

      clearCart: () => set({ items: [] }),
    }),
    {
      name: "shopify-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ items: state.items }),
    }
  )
);