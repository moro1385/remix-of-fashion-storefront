import { createClient } from '@supabase/supabase-js';
import { writeFileSync } from 'fs';

const SUPABASE_URL = 'https://klfmscuogsocfjxqkuib.supabase.co';
const SUPABASE_KEY = 'sb_publishable_12kBSeTHqLjZS56Y-hE_og_cutIUoSN';
const BASE_URL = 'https://jamimode.ir';

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const staticPages = [
  '/', '/shop', '/about', '/contact', '/faq', '/size-guide',
  '/return-policy', '/privacy-policy', '/terms', '/order-tracking',
  '/wholesale', '/address',
];

const categoryHandles = {
  men: ['socks', 'underwear', 'undershirts', 'pants', 'shorts', 't-shirts', 'tank-tops', 'sets'],
  women: ['socks', 'underwear', 'undershirts', 'pants', 'shorts', 't-shirts', 'tank-tops', 'sets'],
  kids: ['socks', 'underwear', 'undershirts'],
};

async function generate() {
  const urls = [];

  for (const page of staticPages) {
    urls.push({ loc: encodeURI(`${BASE_URL}${page}`), priority: page === '/' ? '1.0' : '0.7' });
  }

  for (const [department, handles] of Object.entries(categoryHandles)) {
    for (const handle of handles) {
      urls.push({
        loc: encodeURI(`${BASE_URL}/shop?department=${department}&category=${handle}`),
        priority: '0.8',
      });
    }
  }

  const { data: products, error } = await supabase
    .from('products')
    .select('slug')
    .eq('is_active', true);

  if (error) {
    console.error('Failed to fetch products for sitemap:', error.message);
  } else {
    for (const product of products || []) {
      if (product.slug) {
        urls.push({ loc: encodeURI(`${BASE_URL}/product/${product.slug}`), priority: '0.6' });
      }
    }
  }

  // Escape XML entities in URLs (specifically '&' which becomes '&amp;')
  const escapeXml = (unsafe) => {
    return unsafe.replace(/[<>&'"]/g, function (c) {
      switch (c) {
        case '<': return '&lt;';
        case '>': return '&gt;';
        case '&': return '&amp;';
        case '\'': return '&apos;';
        case '"': return '&quot;';
        default: return c;
      }
    });
  };

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map(u => `  <url>\n    <loc>${escapeXml(u.loc)}</loc>\n    <priority>${u.priority}</priority>\n  </url>`).join('\n')}
</urlset>`;

  writeFileSync('public/sitemap.xml', xml, 'utf-8');
  console.log(`Sitemap generated with ${urls.length} URLs.`);
}

generate();
