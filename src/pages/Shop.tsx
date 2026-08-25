import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const departmentQuery = searchParams.get("department");
  const categoryQuery = searchParams.get("category");

  // If a department or category is selected via URL, we might want to query for those specifically.
  // We can pass them as a combined string to `useProducts` or just fetch all and filter client-side.
  // Since the user is asking to "filter dynamically based on these parameters", let's combine them into a query.
  // e.g. "department category" or just filter on client side.
  // The useProducts hook uses fetchActiveProducts with "terms".
  const queryParts = [];
  if (departmentQuery) queryParts.push(departmentQuery.replace(/-/g, ' '));
  if (categoryQuery) {
    if (categoryQuery === 't-shirts') {
      queryParts.push('t-shirts');
    } else {
      queryParts.push(categoryQuery.replace(/-/g, ' '));
    }
  }
  const queryStr = queryParts.join(" ");

  const { data: products, isLoading, error } = useProducts(queryStr);
  const [activeType, setActiveType] = useState<string>("All");

  const types = useMemo(() => {
    const set = new Set((products ?? []).map((p) => p.node.productType).filter(Boolean));
    return ["All", ...Array.from(set)];
  }, [products]);

  // Reset activeType when URL params change so the new category shows up correctly
  useEffect(() => {
    if (categoryQuery && products) {
      // Find matching type if it exists, otherwise leave it or set to "All"
      const targetCategory = categoryQuery === 't-shirts' ? 't-shirts' : categoryQuery.replace(/-/g, ' ');
      const matchingType = Array.from(types).find(
        (t) => t.toLowerCase() === targetCategory.toLowerCase()
      );
      if (matchingType) {
        setActiveType(matchingType);
      } else {
         setActiveType("All");
      }
    } else {
        setActiveType("All");
    }
  }, [categoryQuery, types, products]);

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
          {departmentQuery || categoryQuery
            ? `${(departmentQuery || '').replace(/-/g, ' ')} ${(categoryQuery || '').replace(/-/g, ' ')}`.trim().toUpperCase()
            : 'Socks, underwear, undershirts, loungewear and shorts'
          }
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-x-6 gap-y-10">
            {visible.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
