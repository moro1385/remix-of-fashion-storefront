import { createClient } from "@supabase/supabase-js";

const SHOPIFY_API_VERSION = "2025-07";

const SHOPIFY_STORE_PERMANENT_DOMAIN = process.env.SHOPIFY_STORE_DOMAIN;
const SHOPIFY_STOREFRONT_TOKEN = process.env.SHOPIFY_STOREFRONT_TOKEN;
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SHOPIFY_STORE_PERMANENT_DOMAIN || !SHOPIFY_STOREFRONT_TOKEN || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Error: The following environment variables are required:");
  console.error("- SHOPIFY_STORE_DOMAIN");
  console.error("- SHOPIFY_STOREFRONT_TOKEN");
  console.error("- SUPABASE_URL");
  console.error("- SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const SHOPIFY_STOREFRONT_URL = `https://${SHOPIFY_STORE_PERMANENT_DOMAIN}/api/${SHOPIFY_API_VERSION}/graphql.json`;
const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

const PRODUCT_FIELDS = `
  id
  title
  description
  handle
  productType
  tags
  priceRange { minVariantPrice { amount currencyCode } }
  images(first: 20) { edges { node { url altText } } }
  variants(first: 100) {
    edges {
      node {
        id
        title
        price { amount currencyCode }
        availableForSale
        selectedOptions { name value }
      }
    }
  }
  options { name values }
`;

const PRODUCTS_QUERY = `
  query GetProducts($first: Int!) {
    products(first: $first) {
      edges { node { ${PRODUCT_FIELDS} } }
    }
  }
`;

async function fetchShopifyProducts() {
  const response = await fetch(SHOPIFY_STOREFRONT_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Shopify-Storefront-Access-Token": SHOPIFY_STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query: PRODUCTS_QUERY, variables: { first: 250 } }),
  });

  if (!response.ok) {
    throw new Error(`Shopify API HTTP error! status: ${response.status}`);
  }

  const data = await response.json();
  if (data.errors) {
    throw new Error(`Shopify API Error: ${data.errors.map(e => e.message).join(", ")}`);
  }

  return data.data.products.edges.map(e => e.node);
}

function slugify(text) {
  return text.toString().toLowerCase()
    .replace(/\s+/g, '-')           // Replace spaces with -
    .replace(/[^\w\-]+/g, '')       // Remove all non-word chars
    .replace(/\-\-+/g, '-')         // Replace multiple - with single -
    .replace(/^-+/, '')             // Trim - from start of text
    .replace(/-+$/, '');            // Trim - from end of text
}

async function uploadImageToSupabase(imageUrl, handle, index) {
  try {
    const response = await fetch(imageUrl);
    if (!response.ok) throw new Error(`Failed to fetch image: ${response.statusText}`);

    const arrayBuffer = await response.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Extract extension from url or default to jpg
    let ext = 'jpg';
    const match = imageUrl.match(/\.([a-zA-Z0-9]+)(\?.*)?$/);
    if (match && match[1]) {
      ext = match[1];
      if (ext.length > 5) ext = 'jpg'; // Basic safeguard
    }

    // Deterministic path based on product handle and image index
    const path = `${handle}/${index}.${ext}`;

    const { data, error } = await supabase.storage
      .from('product-images')
      .upload(path, buffer, {
        contentType: response.headers.get('content-type') || 'image/jpeg',
        upsert: true // Overwrite if it already exists to maintain idempotency
      });

    if (error) {
       console.error(`Failed to upload image ${imageUrl}:`, error);
       return null;
    }

    return path;
  } catch (error) {
    console.error(`Error processing image ${imageUrl}:`, error);
    return null;
  }
}

async function runMigration() {
  console.log("Starting Shopify to Supabase migration...");

  try {
    console.log("Fetching products from Shopify...");
    const shopifyProducts = await fetchShopifyProducts();
    console.log(`Found ${shopifyProducts.length} products to migrate.`);

    let categoriesUpserted = 0;
    let productsUpserted = 0;
    let variantsUpserted = 0;
    let imagesUpserted = 0;

    // 1. Process Categories
    const productTypes = new Set(shopifyProducts.map(p => p.productType).filter(Boolean));
    const categoryMap = new Map(); // slug -> id

    console.log(`Found ${productTypes.size} unique categories.`);
    for (const type of productTypes) {
      const slug = slugify(type);

      const { data, error } = await supabase
        .from('categories')
        .select('id')
        .eq('slug', slug)
        .maybeSingle();

      if (error) throw new Error(`Error fetching category ${slug}: ${error.message}`);

      let categoryId;
      if (data) {
        categoryId = data.id;
      } else {
        const { data: newCat, error: insertError } = await supabase
          .from('categories')
          .insert({ name: type, slug })
          .select('id')
          .single();

        if (insertError) throw new Error(`Error inserting category ${slug}: ${insertError.message}`);
        categoryId = newCat.id;
        categoriesUpserted++;
      }

      categoryMap.set(slug, categoryId);
    }

    // 2. Process Products
    for (const sp of shopifyProducts) {
      console.log(`Processing product: ${sp.title} (${sp.handle})`);

      let categoryId = null;
      if (sp.productType) {
        categoryId = categoryMap.get(slugify(sp.productType));
      }

      const price = parseFloat(sp.priceRange.minVariantPrice.amount);

      // Upsert product
      const { data: productData, error: productError } = await supabase
        .from('products')
        .select('id')
        .eq('slug', sp.handle)
        .maybeSingle();

      if (productError) throw new Error(`Error fetching product ${sp.handle}: ${productError.message}`);

      let productId;
      if (productData) {
        // Update
        const { error: updateError } = await supabase
          .from('products')
          .update({
            name: sp.title,
            description: sp.description,
            price: isNaN(price) ? 0 : price,
            category_id: categoryId,
            is_active: true
          })
          .eq('id', productData.id);

        if (updateError) throw new Error(`Error updating product ${sp.handle}: ${updateError.message}`);
        productId = productData.id;
      } else {
        // Insert
        const { data: newProduct, error: insertError } = await supabase
          .from('products')
          .insert({
            name: sp.title,
            slug: sp.handle,
            description: sp.description,
            price: isNaN(price) ? 0 : price,
            category_id: categoryId,
            is_active: true
          })
          .select('id')
          .single();

        if (insertError) throw new Error(`Error inserting product ${sp.handle}: ${insertError.message}`);
        productId = newProduct.id;
        productsUpserted++;
      }

      // 3. Process Variants
      const variants = sp.variants.edges.map(e => e.node);

      for (const sv of variants) {
        let size = null;
        let color = null;

        for (const opt of sv.selectedOptions) {
          if (opt.name.toLowerCase() === 'size') size = opt.value;
          if (opt.name.toLowerCase() === 'color') color = opt.value;
        }

        const vPrice = parseFloat(sv.price.amount);

        // Find existing variant using the stable Shopify variant ID metadata
        const { data: existingVariant, error: vSearchError } = await supabase
          .from('product_variants')
          .select('id')
          .eq('shopify_variant_id', sv.id)
          .maybeSingle();

        if (vSearchError) throw new Error(`Error searching variant for ${sp.handle}: ${vSearchError.message}`);

        if (existingVariant) {
          // Update existing variant based strictly on shopify_variant_id
          const { error: vUpdateError } = await supabase
            .from('product_variants')
            .update({
              price: isNaN(vPrice) ? null : vPrice,
              size,
              color,
              // Intentionally leaving stock_quantity as is or 0
            })
            .eq('id', existingVariant.id);

          if (vUpdateError) throw new Error(`Error updating variant: ${vUpdateError.message}`);
        } else {
          // Insert
          const { error: vInsertError } = await supabase
            .from('product_variants')
            .insert({
              product_id: productId,
              shopify_variant_id: sv.id,
              size,
              color,
              price: isNaN(vPrice) ? null : vPrice,
              stock_quantity: 0 // Limitation: Storefront API doesn't expose inventory
              // sku: null // Limitation: Storefront API doesn't expose real SKU
            });

          if (vInsertError) throw new Error(`Error inserting variant: ${vInsertError.message}`);
          variantsUpserted++;
        }
      }

      // 4. Process Images
      const images = sp.images.edges.map(e => e.node);

      const { data: existingImages, error: eiError } = await supabase
        .from('product_images')
        .select('id, sort_order, alt_text')
        .eq('product_id', productId);

      if (eiError) throw new Error(`Error fetching existing images for ${sp.handle}: ${eiError.message}`);

      // To handle partial migrations smoothly:
      // Loop over expected images. Map index -> sort_order.
      for (let i = 0; i < images.length; i++) {
        const img = images[i];

        // Check if this particular index/sort_order already exists in the database
        const existingRecord = existingImages?.find(dbImg => dbImg.sort_order === i);

        let shouldUploadAndInsert = false;

        if (!existingRecord) {
          shouldUploadAndInsert = true;
        } else if (existingRecord.alt_text !== img.altText) {
          // If it exists but metadata is different, we can simply update the row
          const { error: updateImgError } = await supabase
            .from('product_images')
            .update({ alt_text: img.altText })
            .eq('id', existingRecord.id);

          if (updateImgError) throw new Error(`Error updating image row: ${updateImgError.message}`);
          // Don't reupload the binary if just alt_text changed to save time, assuming storage is deterministic.
        }

        if (shouldUploadAndInsert) {
          const storagePath = await uploadImageToSupabase(img.url, sp.handle, i);

          if (storagePath) {
            const { error: imgInsertError } = await supabase
              .from('product_images')
              .insert({
                product_id: productId,
                image_url: storagePath,
                alt_text: img.altText,
                sort_order: i
              });

            if (imgInsertError) throw new Error(`Error inserting image for ${sp.handle}: ${imgInsertError.message}`);
            imagesUpserted++;
          }
        }
      }
    }

    console.log("\n==================================================");
    console.log("MIGRATION REPORT");
    console.log("==================================================");
    console.log(`Total Products found in Shopify:   ${shopifyProducts.length}`);
    console.log(`New Categories created:            ${categoriesUpserted}`);
    console.log(`New Products created:              ${productsUpserted}`);
    console.log(`New Variants created:              ${variantsUpserted}`);
    console.log(`New Images uploaded & mapped:      ${imagesUpserted}`);
    console.log("\nLIMITATIONS (Action Required):");
    console.log("- SKU and exact inventory quantities are NOT exposed by the current Shopify Storefront API token.");
    console.log("- Therefore, stock_quantity is set to 0 and sku is null for all migrated variants.");
    console.log("- If real inventory/SKU is required, you must run a secondary sync using a Shopify Admin API token with read_inventory access.");
    console.log("- Images are stored in a private Supabase bucket and paths are saved in product_images.image_url.");
    console.log("- The frontend currently expects direct URLs for images, but now it receives storage paths.");
    console.log("- Next phase: The product service must generate signed URLs for these private images to work in the frontend.");
    console.log("==================================================\n");

  } catch (error) {
    console.error("Migration failed:", error);
    process.exit(1);
  }
}

// NOTE: This script is for dry-run/syntax verification purposes during development only.
// DO NOT execute against real production environments unintentionally!
runMigration();
