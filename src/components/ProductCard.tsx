import { Link } from "react-router-dom";
import { formatPrice, productImage, type CatalogProduct } from "@/services/products";
import { categoryNames } from "@/lib/translations";

export default function ProductCard({ product }: { product: CatalogProduct }) {
  const { title, handle, productType, priceRange, variants } = product.node;
  const inStock = variants.edges.some((v) => v.node.availableForSale);
  const price = priceRange.minVariantPrice;

  return (
    <Link to={`/product/${handle}`} className="group relative block">
      <div className="relative overflow-hidden rounded-2xl bg-[hsl(var(--warm-bg))]">
        <img
          src={productImage(product)}
          alt={title}
          className="w-full aspect-[4/5] object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
          width={400}
          height={500}
        />
      </div>
      {product.node.images?.edges && product.node.images.edges.length > 1 && (
        <div className="flex gap-2 mt-2">
          {product.node.images.edges.slice(0, 3).map((edge, index) => {
            const isLast = index === 2;
            const hasMore = product.node.images.edges.length > 3;
            return (
              <div key={index} className="relative w-12 h-12 rounded-lg overflow-hidden bg-[hsl(var(--warm-bg))] border border-border/50">
                <img
                  src={edge.node?.url}
                  alt={`${title} تصویر ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                  width={48}
                  height={48}
                />
                {isLast && hasMore && (
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <span className="text-white text-xs font-medium">+{product.node.images.edges.length - 3}</span>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-medium text-foreground">{title}</h3>
          {!inStock && <span className="text-xs text-accent font-medium">ناموجود</span>}
        </div>
        {productType && (
          <p className="text-xs text-muted-foreground mt-1">{categoryNames[productType.toLowerCase()] || productType}</p>
        )}
        <div className="flex items-center gap-2 mt-1">
          <span className="text-sm text-foreground">
            {formatPrice(price.amount, price.currencyCode)}
          </span>
        </div>
      </div>
    </Link>
  );
}
