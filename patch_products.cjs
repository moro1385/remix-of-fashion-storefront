const fs = require('fs');
const filepath = 'src/services/products.ts';
let content = fs.readFileSync(filepath, 'utf8');

const search_select = `const PRODUCT_SELECT = \`
  id, name, slug, description, price, is_active, is_featured, created_at, tags, department, category, brand, pattern, type, sizes, colors,
  categories:category_id ( id, name, slug ),
  product_images ( id, image_url, alt_text, sort_order ),
  product_variants ( id, size, color, sku, price, stock_quantity )
\`;`;

const replace_select = `const PRODUCT_SELECT = \`
  id, name, slug, description, price, is_active, is_featured, is_new, images, created_at, tags, department, category, brand, pattern, type, sizes, colors,
  categories:category_id ( id, name, slug ),
  product_images ( id, image_url, alt_text, sort_order ),
  product_variants ( id, size, color, sku, price, stock_quantity )
\`;`;

content = content.replace(search_select, replace_select);


const search_row = `  is_active: boolean;
  is_featured: boolean;`;

const replace_row = `  is_active: boolean;
  is_featured: boolean;
  is_new: boolean;
  images: string[] | null;`;

content = content.replace(search_row, replace_row);


const search_map_images = `  const images = (row.product_images ?? [])
    .slice()
    .sort((a, b) => a.sort_order - b.sort_order)
    .map((i) => ({ node: { url: i.image_url, altText: i.alt_text } }));`;

const replace_map_images = `  const images = row.images?.length
    ? row.images.map(url => ({ node: { url, altText: null } }))
    : (row.product_images ?? [])
        .slice()
        .sort((a, b) => a.sort_order - b.sort_order)
        .map((i) => ({ node: { url: i.image_url, altText: i.alt_text } }));`;

content = content.replace(search_map_images, replace_map_images);


const search_query_options = `export interface ProductQueryOptions {
  limit?: number;
  featured?: boolean;`;

const replace_query_options = `export interface ProductQueryOptions {
  limit?: number;
  featured?: boolean;
  newest?: boolean;`;

content = content.replace(search_query_options, replace_query_options);

const search_destructure_options = `  const { limit = 100, featured, categorySlug, department, category, terms } = options;`;
const replace_destructure_options = `  const { limit = 100, featured, newest, categorySlug, department, category, terms } = options;`;

content = content.replace(search_destructure_options, replace_destructure_options);


const search_featured_filter = `  if (featured) query = query.eq("is_featured", true);`;
const replace_featured_filter = `  if (featured) query = query.eq("is_featured", true);
  if (newest) query = query.eq("is_new", true);`;

content = content.replace(search_featured_filter, replace_featured_filter);


const search_fetch_featured = `export async function fetchFeaturedProducts(limit = 8) {
  return fetchActiveProducts({ featured: true, limit });
}`;

const replace_fetch_featured = `export async function fetchFeaturedProducts(limit = 8) {
  return fetchActiveProducts({ featured: true, limit });
}

export async function fetchNewestProducts(limit = 8) {
  return fetchActiveProducts({ newest: true, limit });
}`;

content = content.replace(search_fetch_featured, replace_fetch_featured);

fs.writeFileSync(filepath, content);
console.log("Services updated");
