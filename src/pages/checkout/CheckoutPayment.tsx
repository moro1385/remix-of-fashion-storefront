import { useState } from "react";
import { useNavigate, Navigate } from "react-router-dom";
import { ChevronRight, CreditCard, Wallet, Loader2 } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function CheckoutPayment() {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const rawItems = useCartStore((s) => s.items);
  const clearCart = useCartStore((s) => s.clearCart);

  const selectedAddress = useCheckoutStore((s) => s.selectedAddress);
  const shippingMethod = useCheckoutStore((s) => s.shippingMethod);
  const shippingCost = useCheckoutStore((s) => s.shippingCost);
  const clearCheckout = useCheckoutStore((s) => s.clearCheckout);

  const items = rawItems || [];

  const [busy, setBusy] = useState(false);

  // If we arrived here without an address/shipping selected, kick back to step 1
  if (!selectedAddress || !shippingMethod || !items || items.length === 0) {
    return <Navigate to="/checkout" replace />;
  }

  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);
  const finalTotal = subtotal + shippingCost;
  const walletBalance = user?.wallet.balance ?? 0;

  const canUseWallet = walletBalance >= finalTotal;

  const handleCompleteOrder = async (method: "wallet" | "gateway") => {
    if (!user) return;

    setBusy(true);
    try {
      // 1. Create order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          total_amount: finalTotal,
          shipping_cost: shippingCost,
          shipping_method: shippingMethod,
          payment_method: method,
          status: "confirmed",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // 2. Insert order items
      const orderItems = items.map(item => ({
        order_id: orderData.id,
        // Using variant_id string only if it matches uuid format, otherwise null to satisfy type
        variant_id: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(item.variantId) ? item.variantId : null,
        quantity: item.quantity,
        price: parseFloat(item.price.amount),
        title: item.productTitle,
        variant_title: [item.selectedSize, item.selectedColor].filter(Boolean).join(" / ") || "Default",
        image_url: item.image,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // 3. Deduct wallet balance if used
      if (method === "wallet") {
        const newBalance = walletBalance - finalTotal;
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ wallet_balance: newBalance })
          .eq("id", user.id);

        if (updateError) throw updateError;

        // Reload auth store to get fresh profile data (like new wallet balance)
        useAuthStore.getState().bootstrap();
      }

      // 4. Clear carts
      clearCart();
      clearCheckout();

      toast.success("Order placed successfully!");
      navigate("/account/orders", { replace: true });

    } catch (err) {
      console.error("Order error", err);
      toast.error("Failed to place order. Please try again.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-6 py-24">
      <h1 className="text-2xl font-medium text-foreground mb-8">Checkout</h1>

      <div className="flex items-center gap-2 mb-12 text-sm text-muted-foreground">
        <button onClick={() => navigate("/checkout")} className="hover:text-foreground transition-colors">
          1. Address & Shipping
        </button>
        <ChevronRight className="w-4 h-4" />
        <span className="text-foreground font-medium">2. Review & Payment</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-7 space-y-8">
          <section>
            <h2 className="text-lg font-medium text-foreground mb-6">Payment Method</h2>

            <div className="space-y-4">
              {/* Wallet Option */}
              <div className={cn(
                "border p-6",
                !canUseWallet ? "opacity-60 bg-muted/30 border-border" : "border-foreground"
              )}>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <Wallet className="w-5 h-5" />
                    <span className="font-medium">پرداخت از کیف پول</span>
                  </div>
                  <span className="text-sm">
                    موجودی: {new Intl.NumberFormat('fa-IR').format(walletBalance)} ریال
                  </span>
                </div>

                {!canUseWallet && (
                  <p className="text-sm text-destructive mb-4">موجودی کیف پول شما کافی نیست.</p>
                )}

                <button
                  onClick={() => handleCompleteOrder("wallet")}
                  disabled={!canUseWallet || busy}
                  className="w-full h-12 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "پرداخت از کیف پول"}
                </button>
              </div>

              {/* Gateway Option */}
              <div className="border border-border p-6">
                <div className="flex items-center gap-3 mb-6">
                  <CreditCard className="w-5 h-5" />
                  <span className="font-medium">پرداخت اینترنتی</span>
                </div>

                <button
                  onClick={() => handleCompleteOrder("gateway")}
                  disabled={busy}
                  className="w-full h-12 bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : "پرداخت از طریق درگاه"}
                </button>
              </div>
            </div>
          </section>
        </div>

        {/* Order Summary Sidebar */}
        <div className="lg:col-span-5">
          <div className="bg-muted/30 p-6 border border-border sticky top-24">
            <h3 className="text-lg font-medium text-foreground mb-6">Order Summary</h3>

            <ul className="divide-y divide-border mb-6">
              {items.map((item) => (
                <li key={item.variantId} className="py-4 flex gap-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium line-clamp-1">{item.productTitle}</p>
                    <p className="text-xs text-muted-foreground mt-1">Qty: {item.quantity}</p>
                  </div>
                  <p className="text-sm font-medium whitespace-nowrap">
                    {new Intl.NumberFormat('fa-IR').format(parseFloat(item.price.amount) * item.quantity)} ریال
                  </p>
                </li>
              ))}
            </ul>

            <div className="space-y-3 text-sm pb-6 border-b border-border">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{new Intl.NumberFormat('fa-IR').format(subtotal)} ریال</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>{new Intl.NumberFormat('fa-IR').format(shippingCost)} ریال</span>
              </div>
            </div>

            <div className="flex justify-between items-end pt-6">
              <span className="text-base font-medium">Total</span>
              <span className="text-xl font-medium">
                {new Intl.NumberFormat('fa-IR').format(finalTotal)} ریال
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
