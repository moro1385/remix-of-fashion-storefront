import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Loader2 } from "lucide-react";
import { format } from "date-fns";

type OrderItemWithProduct = {
  id: string;
  order_id: string;
  price: number;
  quantity: number;
  product_id: string | null;
  variant_id: string | null;
  products: {
    name: string;
  } | null;
  product_variants: {
    size: string | null;
    color: string | null;
    sku: string | null;
  } | null;
};

interface OrderDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  orderId: string | null;
}

export function OrderDetailsDialog({ open, onOpenChange, orderId }: OrderDetailsDialogProps) {
  const [items, setItems] = useState<OrderItemWithProduct[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (open && orderId) {
      fetchOrderDetails();
    }
  }, [open, orderId]);

  async function fetchOrderDetails() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("order_items")
        .select(`
          id,
          order_id,
          price,
          quantity,
          product_id,
          variant_id,
          products ( name ),
          product_variants ( size, color, sku )
        `)
        .eq("order_id", orderId);

      if (error) throw error;
      setItems(data as unknown as OrderItemWithProduct[]);
    } catch (err) {
      console.error("Error fetching order details:", err);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Order Details</DialogTitle>
          <DialogDescription>
            ID: <span className="font-mono">{orderId}</span>
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="flex justify-center p-8">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <h3 className="text-sm font-medium border-b pb-2">Items Ordered</h3>

            {items.length === 0 ? (
               <p className="text-sm text-muted-foreground text-center py-4">No items found for this order.</p>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex justify-between items-start text-sm">
                    <div>
                      <p className="font-medium">{item.products?.name || "Unknown Product"}</p>
                      <div className="text-muted-foreground text-xs space-x-2">
                        {item.product_variants?.sku && <span>SKU: {item.product_variants.sku}</span>}
                        {item.product_variants?.size && <span>Size: {item.product_variants.size}</span>}
                        {item.product_variants?.color && <span>Color: {item.product_variants.color}</span>}
                      </div>
                      <p className="text-muted-foreground mt-1">Qty: {item.quantity}</p>
                    </div>
                    <div className="font-medium text-right">
                      ${(item.price * item.quantity).toFixed(2)}
                    </div>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t pt-4 mt-4 flex justify-between items-center font-medium">
               <span>Total</span>
               <span>${items.reduce((sum, item) => sum + (item.price * item.quantity), 0).toFixed(2)}</span>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
