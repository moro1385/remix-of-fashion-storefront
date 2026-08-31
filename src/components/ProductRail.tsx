import { Link } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useProducts, useFeaturedProducts, useNewestProducts } from "@/hooks/useProducts";

interface ProductRailProps {
  eyebrow: string;
  title: string;
  query?: string;
  type?: 'featured' | 'newest' | 'query';
  count?: number;
  ctaTo?: string;
  ctaLabel?: string;
  className?: string;
}

export default function ProductRail({
  eyebrow,
  title,
  query,
  type = 'query',
  count = 4,
  ctaTo = "/shop",
  ctaLabel,
  className,
}: ProductRailProps) {
  const queryResult = useProducts({ query, first: count });
  const featuredResult = useFeaturedProducts(count);
  const newestResult = useNewestProducts(count);

  const result = type === 'featured' ? featuredResult : type === 'newest' ? newestResult : queryResult;
  const { data: products, isLoading } = result;

  const items = (products ?? []).slice(0, count);

  return (
    <section className={className ?? "py-20"}>
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">{eyebrow}</p>
            <h2 className="text-3xl md:text-4xl font-light text-foreground">{title}</h2>
          </div>
          {ctaLabel && (
            <Link
              to={ctaTo}
              className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors whitespace-nowrap"
            >
              {ctaLabel}
            </Link>
          )}
        </div>

        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : items.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products found</p>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
            {items.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
