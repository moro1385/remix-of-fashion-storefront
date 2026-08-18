import { useQuery } from "@tanstack/react-query";
import {
  fetchActiveProducts,
  fetchFeaturedProducts,
  fetchProductBySlug,
  fetchProductsByCategory,
  type CatalogProduct,
} from "@/services/products";

/**
 * Legacy storefront-style query strings (e.g. "product_type:Socks", "tag:underwear OR tag:set")
 * are translated into plain search terms matched against category / product names.
 */
export function parseLegacyQuery(query?: string): string[] {
  if (!query) return [];
  return query
    .split(/\s+OR\s+|\s+AND\s+|,/i)
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => (part.includes(":") ? part.split(":").slice(1).join(":") : part))
    .map((part) => part.replace(/["']/g, "").trim())
    .filter(Boolean);
}

/** Drop-in replacement for the previous storefront products hook. */
export function useProducts(query?: string, first = 100) {
  const terms = parseLegacyQuery(query);

  const result = useQuery<CatalogProduct[]>({
    queryKey: ["products", terms, first],
    queryFn: () => fetchActiveProducts({ limit: first, terms }),
    staleTime: 60_000,
  });

  return { ...result, isEmpty: !result.isLoading && (result.data?.length ?? 0) === 0 };
}

export function useProduct(slug?: string) {
  return useQuery<CatalogProduct | null>({
    queryKey: ["product", slug],
    queryFn: () => fetchProductBySlug(slug!),
    enabled: !!slug,
    staleTime: 60_000,
  });
}

export function useFeaturedProducts(first = 8) {
  const result = useQuery<CatalogProduct[]>({
    queryKey: ["products", "featured", first],
    queryFn: () => fetchFeaturedProducts(first),
    staleTime: 60_000,
  });
  return { ...result, isEmpty: !result.isLoading && (result.data?.length ?? 0) === 0 };
}

export function useCategoryProducts(categorySlug?: string, first = 100) {
  const result = useQuery<CatalogProduct[]>({
    queryKey: ["products", "category", categorySlug, first],
    queryFn: () => fetchProductsByCategory(categorySlug!, first),
    enabled: !!categorySlug,
    staleTime: 60_000,
  });
  return { ...result, isEmpty: !result.isLoading && (result.data?.length ?? 0) === 0 };
}
