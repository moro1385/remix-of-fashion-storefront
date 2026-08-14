import { Link, useParams } from "react-router-dom";
import { Loader2 } from "lucide-react";
import ProductCard from "@/components/ProductCard";
import { useShopifyProducts } from "@/hooks/useShopifyProducts";
import { getCollection } from "@/data/collections";

export default function CollectionPage() {
  const { handle } = useParams();
  const collection = getCollection(handle);
  const { data: products, isLoading } = useShopifyProducts(collection?.query);

  if (!collection) {
    return (
      <div className="max-w-3xl mx-auto px-6 py-32 text-center">
        <h1 className="text-3xl font-light text-foreground">Collection not found</h1>
        <Link to="/shop" className="inline-block mt-6 text-sm underline text-muted-foreground">
          Browse the shop
        </Link>
      </div>
    );
  }

  return (
    <>
      <section className="relative w-full h-[60vh]">
        <img
          src={collection.image}
          alt={collection.name}
          width={1920}
          height={1080}
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-[hsl(30_30%_18%/0.4)] flex items-center justify-center">
          <div className="text-center text-primary-foreground px-6">
            <p className="text-xs uppercase tracking-[0.3em] mb-4">{collection.eyebrow}</p>
            <h1 className="text-4xl md:text-6xl font-light">{collection.name}</h1>
          </div>
        </div>
      </section>

      <section className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h2 className="text-2xl md:text-3xl font-light text-foreground mb-6">{collection.tagline}</h2>
        <p className="text-base leading-relaxed text-muted-foreground">{collection.description}</p>
      </section>

      <section className="max-w-7xl mx-auto px-6 pb-24">
        {isLoading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
          </div>
        ) : !products || products.length === 0 ? (
          <p className="text-center text-sm text-muted-foreground py-16">No products found</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {products.map((product) => (
              <ProductCard key={product.node.id} product={product} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}
