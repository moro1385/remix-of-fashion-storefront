import { useMemo, useState } from "react";
import ProductCard from "@/components/ProductCard";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Shop() {
  const { data: products, isLoading, error } = useShopifyProducts();
  const [activeType, setActiveType] = useState<string>("All");

  const types = useMemo(() => {
    const set = new Set((products ?? []).map((p) => p.node.productType).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [products]);

  const visible = useMemo(() => {
    if (!products) return [];
    return activeType === "All"
      ? products
      : products.filter((p) => p.node.productType === activeType);
  }, [products, activeType]);

  return (
    <div className="min-h-screen bg-[hsl(var(--warm-bg))]">
      <div className="py-16 text-center">
        <h1 className="text-4xl md:text-5xl font-light text-foreground">Shop</h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Socks, underwear, undershirts, loungewear and shorts
        </p>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-24">
        {types.length > 1 && (
          <div className="flex flex-wrap gap-2 justify-center mb-12">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setActiveType(type)}
                className={cn(
                  "px-4 py-2 text-xs uppercase tracking-wider border transition-colors",
                  activeType === type
                    ? "border-foreground text-foreground"
                    : "border-border text-muted-foreground hover:text-foreground"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        )}

        {isLoading ? (
          <div className="flex justify-center py-24">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : error ? (
          <p className="text-center text-sm text-muted-foreground py-24">
            Products could not be loaded right now. Please try again.
          </p>
        ) : visible.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-24">No products found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
            {visible.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
