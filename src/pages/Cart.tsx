import { Link, useNavigate } from "react-router-dom";
import { ExternalLink, Loader2, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/services/products";
import QuantitySelector from "@/components/QuantitySelector";

export default function Cart() {
const navigate = useNavigate();
  const items = useCartStore((s) => s.items) || [];
  const updateQuantity = useCartStore((s) => s.updateQuantity);
  const removeItem = useCartStore((s) => s.removeItem);

  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "USD";

  const handleCheckout = () => {
    navigate("/checkout");
  };

  if (!items || items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24">
        <h1 className="text-2xl font-medium text-foreground mb-4">سبد خرید</h1>
        <p className="text-sm text-foreground mb-8">شما هیچ محصولی در سبد خرید خود ندارید.</p>
        <Link
          to="/shop"
          className="inline-block px-8 py-4 bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity rounded-full"
        >
          ادامه خرید
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <h1 className="text-2xl font-medium text-foreground mb-12">سبد خرید</h1>
      <div className="space-y-8">
        {items.map((item) => (
          <div key={item.id} className="flex gap-6 border-b border-border pb-8">
            <img
              src={item.image}
              alt={item.productTitle}
              className="w-24 h-24 object-cover bg-[hsl(var(--warm-bg))] rounded-2xl"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-medium text-foreground">
                    <Link to={`/product/${item.productHandle}`} className="hover:underline">
                      {item.productTitle}
                    </Link>
                  </h3>
                  {(item.selectedSize || item.selectedColor) && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {[item.selectedSize, item.selectedColor].filter(Boolean).join(" • ")}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatPrice(item.price.amount, item.price.currencyCode)}
                  </p>
                </div>
                <button onClick={() => removeItem(item.id)} aria-label="Remove item">
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              </div>
              <div className="mt-4">
                <QuantitySelector
                  quantity={item.quantity}
                  onChange={(q) => updateQuantity(item.id, q)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 flex flex-col items-end gap-4">
        <p className="text-lg text-foreground">
          جمع کل: <span className="font-medium">{formatPrice(subtotal, currency)}</span>
        </p>
        <button
          onClick={handleCheckout}
          className="px-8 py-4 bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity flex items-center gap-2 rounded-full"
        >
          تسویه حساب
        </button>
      </div>
    </div>
  );
}
