import { Link } from "react-router-dom";
import { ExternalLink, Loader2, X } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { formatPrice } from "@/lib/shopify";
import QuantitySelector from "@/components/QuantitySelector";

export default function Cart() {
  const { items, updateQuantity, removeItem, getCheckoutUrl, isLoading, isSyncing } = useCartStore();

  const subtotal = items.reduce((sum, i) => sum + parseFloat(i.price.amount) * i.quantity, 0);
  const currency = items[0]?.price.currencyCode ?? "USD";

  const handleCheckout = () => {
    const checkoutUrl = getCheckoutUrl();
    if (checkoutUrl) window.open(checkoutUrl, "_blank");
  };

  if (items.length === 0) {
    return (
      <div className="max-w-6xl mx-auto px-6 py-24">
        <h1 className="text-2xl font-medium text-foreground mb-4">Shopping Cart</h1>
        <p className="text-sm text-foreground mb-8">You have nothing in your shopping cart.</p>
        <Link
          to="/shop"
          className="inline-block px-8 py-4 bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity"
        >
          Continue Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-6 py-24">
      <h1 className="text-2xl font-medium text-foreground mb-12">Shopping Cart</h1>
      <div className="space-y-8">
        {items.map((item) => (
          <div key={item.variantId} className="flex gap-6 border-b border-border pb-8">
            <img
              src={item.image}
              alt={item.productTitle}
              className="w-24 h-24 object-cover bg-[hsl(var(--warm-bg))]"
            />
            <div className="flex-1">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-base font-medium text-foreground">
                    <Link to={`/product/${item.productHandle}`} className="hover:underline">
                      {item.productTitle}
                    </Link>
                  </h3>
                  {item.selectedOptions.length > 0 && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {item.selectedOptions.map((o) => o.value).join(" • ")}
                    </p>
                  )}
                  <p className="text-sm text-muted-foreground mt-1">
                    {formatPrice(item.price.amount, item.price.currencyCode)}
                  </p>
                </div>
                <button onClick={() => removeItem(item.variantId)} aria-label="Remove item">
                  <X className="w-5 h-5 text-muted-foreground hover:text-foreground transition-colors" />
                </button>
              </div>
              <div className="mt-4">
                <QuantitySelector
                  quantity={item.quantity}
                  onChange={(q) => updateQuantity(item.variantId, q)}
                />
              </div>
            </div>
          </div>
        ))}
      </div>
      <div className="mt-12 flex flex-col items-end gap-4">
        <p className="text-lg text-foreground">
          Subtotal: <span className="font-medium">{formatPrice(subtotal, currency)}</span>
        </p>
        <button
          onClick={handleCheckout}
          disabled={isLoading || isSyncing}
          className="px-8 py-4 bg-accent text-accent-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center gap-2"
        >
          {isLoading || isSyncing ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <>
              <ExternalLink className="w-4 h-4" />
              Checkout
            </>
          )}
        </button>
      </div>
    </div>
  );
}
