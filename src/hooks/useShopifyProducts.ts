import { useQuery } from "@tanstack/react-query";
import { fetchProductByHandle, fetchProducts } from "@/lib/shopify";

export function useShopifyProducts(query?: string, first = 100) {
  return useQuery({
    queryKey: ["shopify-products", query ?? "all", first],
    queryFn: () => fetchProducts(query, first),
    staleTime: 60_000,
  });
}

export function useShopifyProduct(handle?: string) {
  return useQuery({
    queryKey: ["shopify-product", handle],
    queryFn: () => fetchProductByHandle(handle!),
    enabled: !!handle,
    staleTime: 60_000,
  });
}
