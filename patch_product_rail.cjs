const fs = require('fs');
const filepath = 'src/components/ProductRail.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const search = `import { useProducts } from "@/hooks/useProducts";`;
const replace = `import { useProducts, useFeaturedProducts, useNewestProducts } from "@/hooks/useProducts";`;
content = content.replace(search, replace);

const search_props = `  query?: string;`;
const replace_props = `  query?: string;
  type?: 'featured' | 'newest' | 'query';`;
content = content.replace(search_props, replace_props);

const search_destructure = `  query,
  count = 4,`;
const replace_destructure = `  query,
  type = 'query',
  count = 4,`;
content = content.replace(search_destructure, replace_destructure);

const search_logic = `  const { data: products, isLoading } = useProducts(query, count);
  const items = (products ?? []).slice(0, count);`;
const replace_logic = `  const queryResult = useProducts({ query, first: count });
  const featuredResult = useFeaturedProducts(count);
  const newestResult = useNewestProducts(count);

  const result = type === 'featured' ? featuredResult : type === 'newest' ? newestResult : queryResult;
  const { data: products, isLoading } = result;

  const items = (products ?? []).slice(0, count);`;
content = content.replace(search_logic, replace_logic);


fs.writeFileSync(filepath, content);
console.log("ProductRail updated");
