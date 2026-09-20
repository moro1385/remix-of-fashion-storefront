import { useEffect, useRef } from "react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore, CartItem } from "@/stores/cartStore";
import { supabase } from "@/integrations/supabase/client";

export default function CartSync() {
  const user = useAuthStore((s) => s.user);
  const session = useAuthStore((s) => s.session);
  const isAuthenticated = !!(session && user);
  const userId = user?.id;

  const previousAuthRef = useRef(false);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Ref to keep track of if we're currently fetching to avoid race conditions
  const isFetchingRef = useRef(false);

  // Sync on auth change
  useEffect(() => {
    const wasAuthenticated = previousAuthRef.current;
    previousAuthRef.current = isAuthenticated;

    const handleAuthChange = async () => {
      // Transition from unauthenticated to authenticated
      if (!wasAuthenticated && isAuthenticated && userId) {
        if (isFetchingRef.current) return;
        isFetchingRef.current = true;

        try {
          const { data, error } = await supabase
            .from("carts")
            .select("items")
            .eq("user_id", userId)
            .maybeSingle();

          if (error) {
            console.error("Error fetching server cart:", error);
            return;
          }

          const localItems = useCartStore.getState().items;
          const serverItems: CartItem[] = data?.items ? (data.items as unknown as CartItem[]) : [];

          if (serverItems.length > 0 && localItems.length > 0) {
            // MERGE
            const mergedMap = new Map<string, CartItem>();
            serverItems.forEach(item => mergedMap.set(item.id, item));

            localItems.forEach(localItem => {
              if (mergedMap.has(localItem.id)) {
                const existing = mergedMap.get(localItem.id)!;
                mergedMap.set(localItem.id, {
                  ...existing,
                  quantity: existing.quantity + localItem.quantity
                });
              } else {
                mergedMap.set(localItem.id, localItem);
              }
            });

            useCartStore.getState().setItems(Array.from(mergedMap.values()));
          } else if (serverItems.length > 0) {
            // REPLACE WITH SERVER ITEMS
            useCartStore.getState().setItems(serverItems);
          }
          // If only local has items, we do nothing to local items,
          // they will be synced up in the subscription useEffect.
        } finally {
          isFetchingRef.current = false;
        }
      }
    };

    handleAuthChange();
  }, [isAuthenticated, userId]);

  const currentItems = useCartStore((s) => s.items);

  // Sync to server when items change
  useEffect(() => {
    if (isAuthenticated && userId) {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(async () => {
        // Only sync if not currently actively handling initial fetch/merge
        if (isFetchingRef.current) return;

        const { error } = await supabase.from("carts").upsert({
          user_id: userId,
          items: currentItems,
          updated_at: new Date().toISOString(),
        });

        if (error) {
          console.error("Error syncing cart to server:", error);
        }
      }, 600);
    }

    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }
    };
  }, [currentItems, isAuthenticated, userId]);

  return null;
}
