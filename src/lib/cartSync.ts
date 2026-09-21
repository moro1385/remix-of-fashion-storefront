import { supabase } from "@/integrations/supabase/client";
import { useCartStore } from "@/stores/cartStore";

export async function flushCartToServer(userId: string): Promise<void> {
  const items = useCartStore.getState().items;
  const { error } = await supabase.from("carts").upsert({
    user_id: userId,
    items,
    updated_at: new Date().toISOString(),
  });
  if (error) {
    console.error("Error flushing cart to server:", error);
  }
}
