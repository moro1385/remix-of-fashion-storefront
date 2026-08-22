import { supabase } from "@/integrations/supabase/client";
import { mockProducts } from "@/data/mockProducts";

/* ---------------- Types (shape-compatible with the previous storefront layer) ---------------- */

export interface CatalogVariant {
  id: string;
  title: string;
  price: { amount: string; currencyCode: string };
  availableForSale: boolean;
  selectedOptions: Array<{ name: string; value: string }>;
}

export interface CatalogProduct {
  node: {
    id: string;
    title: string;
    description: string;
    handle: string;
    productType: string;
    tags: string[];
    priceRange: { minVariantPrice: { amount: string; currencyCode: string } };
    images: { edges: Array<{ node: { url: string; altText: string | null } }> };
    variants: { edges: Array<{ node: CatalogVariant }> };
    options: Array<{ name: string; values: string[] }>;
  };
}

export const CURRENCY_CODE = "USD";

const PRODUCT_SELECT = `
  id, name, slug, description, price, is_active, is_featured, created_at,
  categories:category_id ( id, name, slug ),
  product_images ( id, image_url, alt_text, sort_order ),
  product_variants ( id, size, color, sku, price, stock_quantity )
`;

type Row = {
  id: string;
  name: string;
  slug: string;
  description: string | null;
  price: number | null;
  is_active: boolean;
  is_featured: boolean;
  categories: { id: string; name: string; slug: string } | null;
  product_images: Array<{ id: string; image_url: string; alt_text: string | null; sort_order: number }> | null;
  product_variants: Array<{
    id: string;
    size: string | null;
    color: string | null;
    sku: string | null;
    price: number | null;
    stock_quantity: number;
  }> | null;
};

/* ---------------- Mapping ---------------- */

function money(amount: number | null | undefined) {
  return { amount: String(amount ?? 0), currencyCode: CURRENCY_CODE };
}

function mapProduct(row: Row): CatalogProduct {
  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => ({ node: { url: i.image_url, altText: i.alt_text } }));

  const rawVariants = row.product_variants ?? [];

  const variants: CatalogVariant[] = rawVariants.map((v) => {
    const selectedOptions: Array<{ name: string; value: string }> = [];
    if (v.size) selectedOptions.push({ name: "Size", value: v.size });
    if (v.color) selectedOptions.push({ name: "Color", value: v.color });
    return {
      id: v.id,
      title: selectedOptions.map((o) => o.value).join(" / ") || "Default",
      price: money(v.price ?? row.price),
      availableForSale: (v.stock_quantity ?? 0) > 0,
      selectedOptions,
    };
  });

  if (variants.length === 0) {
    variants.push({
      id: row.id,
      title: "Default",
      price: money(row.price),
      availableForSale: true,
      selectedOptions: [],
    });
  }

  const options: Array<{ name: string; values: string[] }> = [];
  for (const name of ["Size", "Color"]) {
    const values = Array.from(
      new Set(
        variants
          .flatMap((v) => v.selectedOptions)
          .filter((o) => o.name === name)
          .map((o) => o.value)
      )
    );
    if (values.length > 0) options.push({ name, values });
  }

  const minPrice = Math.min(...variants.map((v) => parseFloat(v.price.amount) || 0));

  return {
    node: {
      id: row.id,
      title: row.name,
      description: row.description ?? "",
      handle: row.slug,
      productType: row.categories?.name ?? "",
      tags: row.categories?.slug ? [row.categories.slug] : [],
      priceRange: { minVariantPrice: money(Number.isFinite(minPrice) ? minPrice : row.price ?? 0) },
      images: { edges: images },
      variants: { edges: variants.map((node) => ({ node })) },
      options,
    },
  };
}

/* ---------------- Queries ---------------- */

export interface ProductQueryOptions {
  limit?: number;
  featured?: boolean;
  categorySlug?: string;
  /** Free-text terms matched against product name / category name or slug */
  terms?: string[];
}

export async function fetchActiveProducts(options: ProductQueryOptions = {}): Promise<CatalogProduct[]> {
  const { limit = 100, featured, categorySlug, terms } = options;

  /*
  let query = supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("is_active", true)
    .order("created_at", { ascending: false })
    .limit(limit);

  if (featured) query = query.eq("is_featured", true);

  if (categorySlug) {
    const { data: category, error: categoryError } = await supabase
      .from("categories")
      .select("id")
      .eq("slug", categorySlug)
      .maybeSingle();
    if (categoryError) throw categoryError;
    if (!category) return [];
    query = query.eq("category_id", category.id);
  }

  const { data, error } = await query;
  if (error) throw error;

  let products = ((data ?? []) as unknown as Row[]).map(mapProduct);
  */

  let products = [...mockProducts];

  if (terms && terms.length > 0) {
    const needles = terms.map((t) => t.toLowerCase()).filter(Boolean);
    products = products.filter((p) =>
      needles.some(
        (n) =>
          p.node.title.toLowerCase().includes(n) ||
          p.node.productType.toLowerCase().includes(n) ||
          p.node.tags.some((tag) => tag.toLowerCase().includes(n))
      )
    );
  }

  return products.slice(0, limit);
}

export async function fetchFeaturedProducts(limit = 8) {
  return fetchActiveProducts({ featured: true, limit });
}

export async function fetchProductsByCategory(categorySlug: string, limit = 100) {
  return fetchActiveProducts({ categorySlug, limit });
}

export async function fetchProductBySlug(slug: string): Promise<CatalogProduct | null> {
  /*
  const { data, error } = await supabase
    .from("products")
    .select(PRODUCT_SELECT)
    .eq("slug", slug)
    .eq("is_active", true)
    .maybeSingle();
  if (error) throw error;
  return data ? mapProduct(data as unknown as Row) : null;
  */
  const product = mockProducts.find(p => p.node.handle === slug);
  return product || null;
}

export async function fetchProductImages(productId: string) {
  /*
  const { data, error } = await supabase
    .from("product_images")
    .select("id, image_url, alt_text, sort_order")
    .eq("product_id", productId)
    .order("sort_order", { ascending: true });
  if (error) throw error;
  return data ?? [];
  */
  return [];
}

export async function fetchProductVariants(productId: string) {
  /*
  const { data, error } = await supabase
    .from("product_variants")
    .select("id, size, color, sku, price, stock_quantity")
    .eq("product_id", productId);
  if (error) throw error;
  return data ?? [];
  */
  return [];
}

export async function fetchCategories() {
  /*
  const { data, error } = await supabase
    .from("categories")
    .select("id, name, slug, description, image_url")
    .order("name", { ascending: true });
  if (error) throw error;
  return data ?? [];
  */
  return [];
}

/* ---------------- Presentation helpers ---------------- */

export function formatPrice(amount: string | number, currencyCode = CURRENCY_CODE) {
  const value = typeof amount === "string" ? parseFloat(amount) : amount;
  try {
    return new Intl.NumberFormat(undefined, { style: "currency", currency: currencyCode }).format(value);
  } catch {
    return `${currencyCode} ${value.toFixed(2)}`;
  }
}

export function productImage(product: CatalogProduct) {
  return product.node.images?.edges?.[0]?.node?.url ?? "/placeholder.svg";
}
