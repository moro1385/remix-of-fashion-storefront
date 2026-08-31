const fs = require('fs');
const filepath = 'src/hooks/useProducts.ts';
let content = fs.readFileSync(filepath, 'utf8');

const search = `import {
  fetchActiveProducts,
  fetchFeaturedProducts,
  fetchProductBySlug,
  fetchProductsByCategory,
  type CatalogProduct,
} from "@/services/products";`;

const replace = `import {
  fetchActiveProducts,
  fetchFeaturedProducts,
  fetchNewestProducts,
  fetchProductBySlug,
  fetchProductsByCategory,
  type CatalogProduct,
} from "@/services/products";`;

content = content.replace(search, replace);

const append = `
export function useNewestProducts(first = 8) {
  const result = useQuery<CatalogProduct[]>({
    queryKey: ["products", "newest", first],
    queryFn: () => fetchNewestProducts(first),
    staleTime: 60_000,
  });
  return { ...result, isEmpty: !result.isLoading && (result.data?.length ?? 0) === 0 };
}
`;

content = content + append;

fs.writeFileSync(filepath, content);
console.log("Hooks updated");
