import { useEffect, useRef } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { CheckCircle2 } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useCheckoutStore } from "@/stores/checkoutStore";

export default function CheckoutSuccess() {
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get("order");

  const clearCart = useCartStore((s) => s.clearCart);
  const clearCheckout = useCheckoutStore((s) => s.clearCheckout);

  const clearedRef = useRef(false);

  useEffect(() => {
    if (!clearedRef.current) {
      clearCart();
      clearCheckout();
      clearedRef.current = true;
    }
  }, [clearCart, clearCheckout]);

  return (
    <div className="max-w-4xl mx-auto px-6 py-24 min-h-[60vh] flex flex-col items-center justify-center text-center">
      <CheckCircle2 className="w-20 h-20 text-green-500 mb-6" />

      <h1 className="text-3xl font-medium text-foreground mb-4">
        پرداخت با موفقیت انجام شد
      </h1>

      {orderId && (
        <p className="text-muted-foreground mb-8">
          شماره سفارش: <span className="font-mono bg-muted px-2 py-1 rounded text-foreground">{orderId}</span>
        </p>
      )}

      <Link
        to="/account/orders"
        className="h-12 px-8 bg-foreground text-background text-sm font-medium hover:opacity-90 transition-opacity flex items-center justify-center rounded-full"
      >
        مشاهده سفارشات من
      </Link>
    </div>
  );
}
