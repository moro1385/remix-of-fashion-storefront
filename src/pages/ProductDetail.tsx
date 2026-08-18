import { useMemo, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import { useProduct, useProducts } from "@/hooks/useProducts";
import { formatPrice, productImage, type CatalogProduct } from "@/services/products";
import { useCartStore } from "@/stores/cartStore";
import { useToast } from "@/hooks/use-toast";
import QuantitySelector from "@/components/QuantitySelector";
import ProductCard from "@/components/ProductCard";
import { cn } from "@/lib/utils";

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { data: product, isLoading } = useProduct(slug);
  const { data: allProducts } = useProducts();
  const addItem = useCartStore((s) => s.addItem);
  const isCartLoading = useCartStore((s) => s.isLoading);
  const { toast } = useToast();
  const [quantity, setQuantity] = useState(1);
  const [selected, setSelected] = useState<Record<string, string>>({});

  const variants = product?.node.variants.edges.map((e) => e.node) ?? [];
  const options = product?.node.options ?? [];

  const activeOptions = useMemo(() => {
    const result: Record<string, string> = {};
    options.forEach((o) => {
      result[o.name] = selected[o.name] ?? o.values[0];
    });
    return result;
  }, [options, selected]);

  const selectedVariant = useMemo(() => {
    if (variants.length === 0) return undefined;
    return (
      variants.find((v) =>
        v.selectedOptions.every((o) => activeOptions[o.name] === o.value)
      ) ?? variants[0]
    );
  }, [variants, activeOptions]);

  const related = useMemo(() => {
    if (!allProducts || !product) return [] as CatalogProduct[];
    return allProducts
      .filter(
        (p) =>
          p.node.handle !== product.node.handle &&
          p.node.productType === product.node.productType
      )
      .slice(0, 3);
  }, [allProducts, product]);

  if (isLoading) {
    return (
      <div className="flex justify-center py-32">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  if (!product) return <Navigate to="/shop" replace />;

  const isSoldOut = !selectedVariant?.availableForSale;
  const price = selectedVariant?.price ?? product.node.priceRange.minVariantPrice;

  const handleAddToCart = async () => {
    if (!selectedVariant || isSoldOut) return;
    await addItem({
      variantId: selectedVariant.id,
      productTitle: product.node.title,
      productHandle: product.node.handle,
      variantTitle: selectedVariant.title,
      image: productImage(product),
      price: selectedVariant.price,
      quantity,
      selectedOptions: selectedVariant.selectedOptions,
    });
    toast({
      title: "Added to cart",
      description: `${quantity}× ${product.node.title} added to your cart.`,
    });
    setQuantity(1);
  };

  return (
    <>
      <section className="max-w-6xl mx-auto px-6 py-8">
        <nav className="text-sm text-muted-foreground mb-6">
          <Link to="/shop" className="hover:text-foreground transition-colors">Shop</Link>
          <span className="mx-2">›</span>
          <span className="text-foreground">{product.node.title}</span>
        </nav>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-start">
          <div className="w-full aspect-[4/5] bg-warm-bg">
            <img
              src={productImage(product)}
              alt={product.node.title}
              className="w-full h-full object-cover"
            />
          </div>

          <div className="flex flex-col">
            <h1 className="text-2xl md:text-3xl font-bold uppercase tracking-wide text-foreground mb-4">
              {product.node.title}
            </h1>
            <p className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              {formatPrice(price.amount, price.currencyCode)}
            </p>
            {product.node.description && (
              <p className="text-base leading-relaxed text-muted-foreground mb-8">
                {product.node.description}
              </p>
            )}

            {options
              .filter((o) => o.name !== "Title")
              .map((option) => (
                <div key={option.name} className="mb-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    {option.name}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {option.values.map((value) => (
                      <button
                        key={value}
                        onClick={() => setSelected((prev) => ({ ...prev, [option.name]: value }))}
                        className={cn(
                          "px-4 py-2 text-sm border transition-colors",
                          activeOptions[option.name] === value
                            ? "border-foreground text-foreground"
                            : "border-border text-muted-foreground hover:text-foreground"
                        )}
                      >
                        {value}
                      </button>
                    ))}
                  </div>
                </div>
              ))}

            {!isSoldOut ? (
              <div className="flex items-stretch gap-3">
                <QuantitySelector quantity={quantity} onChange={setQuantity} />
                <button
                  onClick={handleAddToCart}
                  disabled={isCartLoading}
                  className="flex-1 py-3 bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-opacity disabled:opacity-60 flex items-center justify-center"
                >
                  {isCartLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : "Add To Cart"}
                </button>
              </div>
            ) : (
              <button
                disabled
                className="w-full py-3 bg-muted text-muted-foreground text-sm font-medium cursor-not-allowed"
              >
                Sold Out
              </button>
            )}
          </div>
        </div>
      </section>

      {related.length > 0 && (
        <section className="max-w-6xl mx-auto px-6 py-16">
          <h2 className="text-2xl font-light text-foreground mb-8">You Might Also Like</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {related.map((p) => (
              <ProductCard key={p.node.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </>
  );
}
