import { Link } from "react-router-dom";
import { formatPrice, productImage, type ShopifyProduct } from "@/lib/shopify";

export default function ProductCard({ product }: { product: ShopifyProduct }) {
  const { title, handle, productType, priceRange, variants } = product.node;
  const inStock = variants.edges.some((v) => v.node.availableForSale);
  const price = priceRange.minVariantPrice;

  return (
    <Link to={`/product/${handle}`} className="group relative block">
      <div className="relative overflow-hidden bg-[hsl(var(--warm-bg))]">
        <img
          src={productImage(product)}
          alt={title}
          className="w-full aspect-square object-cover transition-transform duration-500 group-hover:scale-105"
          loading="lazy"
        />
      </div>
      <div className="mt-4">
        <div className="flex items-baseline justify-between gap-2">
          <h3 className="text-base font-medium text-foreground">{title}</h3>
          {!inStock && <span className="text-xs text-accent font-medium">Sold out</span>}
        </div>
        {productType && (
          <p className="text-xs uppercase tracking-wider text-muted-foreground mt-1">{productType}</p>
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
