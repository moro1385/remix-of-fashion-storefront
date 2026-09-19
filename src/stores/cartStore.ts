import { create } from "zustand";
import { supabase } from "@/integrations/supabase/client";
import { useAuthStore } from "./authStore";

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
  initializeCart: () => Promise<void>;
  addItem: (item: Omit<CartItem, "id">) => Promise<void>;
  updateQuantity: (id: string, quantity: number) => Promise<void>;
  removeItem: (id: string) => Promise<void>;
  clearCart: () => void;
}

const getOrCreateCartId = async (userId: string) => {
  const { data: existingCart } = await supabase
    .from("carts")
    .select("id")
    .eq("user_id", userId)
    .single();

  if (existingCart) return existingCart.id;

  const { data: newCart, error } = await supabase
    .from("carts")
    .insert({ user_id: userId })
    .select("id")
    .single();

  if (error || !newCart) throw new Error("Failed to create cart");
  return newCart.id;
};

export const useCartStore = create<CartStore>()((set, get) => ({
  items: [],

  initializeCart: async () => {
    const user = useAuthStore.getState().user;
    if (!user) {
      set({ items: [] });
      return;
    }

    try {
      const { data: cart } = await supabase
        .from("carts")
        .select("id")
        .eq("user_id", user.id)
        .single();

      if (!cart) {
        set({ items: [] });
        return;
      }

      const { data: cartItems } = await supabase
        .from("cart_items")
        .select(`
          id,
          product_id,
          quantity,
          selected_size,
          selected_color,
          products (
            title,
            slug,
            price,
            images
          )
        `)
        .eq("cart_id", cart.id);

      if (cartItems) {
        const mappedItems: CartItem[] = cartItems.map((item: any) => {
          const product = item.products;
          const image = product?.images?.[0] || "";
          const id = `${item.product_id}::${item.selected_size ?? "none"}::${item.selected_color ?? "none"}`;
          return {
            id,
            productId: item.product_id,
            productTitle: product?.title || "Unknown Product",
            productHandle: product?.slug || "",
            image,
            price: { amount: (product?.price || 0).toString(), currencyCode: "IRR" },
            quantity: item.quantity,
            selectedSize: item.selected_size,
            selectedColor: item.selected_color,
          };
        });
        set({ items: mappedItems });
      } else {
        set({ items: [] });
      }
    } catch (error) {
      console.error("Failed to initialize cart:", error);
      set({ items: [] });
    }
  },

  addItem: async (item) => {
    const id = `${item.productId}::${item.selectedSize ?? "none"}::${item.selectedColor ?? "none"}`;

    // Optimistic local update
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

    // Async Supabase update
    const user = useAuthStore.getState().user;
    if (user) {
      try {
        const cartId = await getOrCreateCartId(user.id);
        let query = supabase
          .from("cart_items")
          .select("id, quantity")
          .eq("cart_id", cartId)
          .eq("product_id", item.productId);

        if (item.selectedSize) {
          query = query.eq("selected_size", item.selectedSize);
        } else {
          query = query.is("selected_size", null);
        }

        if (item.selectedColor) {
          query = query.eq("selected_color", item.selectedColor);
        } else {
          query = query.is("selected_color", null);
        }

        const { data: existingDbItem } = await query.maybeSingle();

        if (existingDbItem) {
          await supabase
            .from("cart_items")
            .update({ quantity: existingDbItem.quantity + item.quantity })
            .eq("id", existingDbItem.id);
        } else {
          await supabase
            .from("cart_items")
            .insert({
              cart_id: cartId,
              product_id: item.productId,
              quantity: item.quantity,
              selected_size: item.selectedSize,
              selected_color: item.selectedColor,
            });
        }
      } catch (error) {
        console.error("Failed to sync addItem to DB:", error);
      }
    }
  },

  updateQuantity: async (id, quantity) => {
    if (quantity <= 0) {
      get().removeItem(id);
      return;
    }

    const itemToUpdate = get().items.find((i) => i.id === id);
    if (!itemToUpdate) return;

    // Optimistic local update
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? { ...i, quantity } : i)),
    }));

    // Async Supabase update
    const user = useAuthStore.getState().user;
    if (user) {
      try {
        const cartId = await getOrCreateCartId(user.id);
        let query = supabase
          .from("cart_items")
          .update({ quantity })
          .eq("cart_id", cartId)
          .eq("product_id", itemToUpdate.productId);

        if (itemToUpdate.selectedSize) {
          query = query.eq("selected_size", itemToUpdate.selectedSize);
        } else {
          query = query.is("selected_size", null);
        }

        if (itemToUpdate.selectedColor) {
          query = query.eq("selected_color", itemToUpdate.selectedColor);
        } else {
          query = query.is("selected_color", null);
        }

        await query;
      } catch (error) {
        console.error("Failed to sync updateQuantity to DB:", error);
      }
    }
  },

  removeItem: async (id) => {
    const itemToRemove = get().items.find((i) => i.id === id);
    if (!itemToRemove) return;

    // Optimistic local update
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));

    // Async Supabase update
    const user = useAuthStore.getState().user;
    if (user) {
      try {
        const cartId = await getOrCreateCartId(user.id);
        let query = supabase
          .from("cart_items")
          .delete()
          .eq("cart_id", cartId)
          .eq("product_id", itemToRemove.productId);

        if (itemToRemove.selectedSize) {
          query = query.eq("selected_size", itemToRemove.selectedSize);
        } else {
          query = query.is("selected_size", null);
        }

        if (itemToRemove.selectedColor) {
          query = query.eq("selected_color", itemToRemove.selectedColor);
        } else {
          query = query.is("selected_color", null);
        }

        await query;
      } catch (error) {
        console.error("Failed to sync removeItem to DB:", error);
      }
    }
  },

  clearCart: () => set({ items: [] }),
}));
