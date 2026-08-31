import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const SUPABASE_URL = process.env.SUPABASE_URL || process.env.VITE_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error("Missing SUPABASE_URL or SUPABASE_KEY in .env");
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const dummyCategories = [
  { name: "Socks", slug: "socks", description: "Everyday staple. Crew, quarter and ankle — built for every day.", image_url: "/src/assets/collections/socks.png" },
  { name: "Underwear", slug: "underwear", description: "Foundation layer. Underwear that disappears under everything.", image_url: "/src/assets/collections/underwear.png" },
  { name: "Pants", slug: "pants", description: "Off-duty. Loungewear pants for slow mornings.", image_url: "/src/assets/collections/pants.png" },
  { name: "Shorts", slug: "shorts", description: "Warm weather. Shorts that move with you.", image_url: "/src/assets/collections/shorts.jfif" },
  { name: "T-Shirts", slug: "t-shirts", description: "Second skin. Undershirts and athletic tees.", image_url: "/src/assets/collections/tshirts.jpg" },
  { name: "Sets", slug: "sets", description: "Start fresh. Complete sets, one simple decision.", image_url: "/src/assets/collections/sets.jpg" },
];

const dummyProducts = [];

async function seed() {
  console.log("Seeding Database...");

  // Insert Categories
  for (const cat of dummyCategories) {
    // Delete existing to avoid upsert complexities on non-unique fields if not matching
    await supabase.from("categories").delete().eq("slug", cat.slug);

    const { data, error } = await supabase
      .from("categories")
      .insert({ name: cat.name, slug: cat.slug, description: cat.description, image_url: cat.image_url })
      .select()
      .single();
    if (error) {
      console.error("Error inserting category", cat.name, error);
    } else {
      cat.id = data.id;
    }
  }
  console.log("Categories seeded!");

  // Insert Products
  for (const prod of dummyProducts) {
    const category = dummyCategories.find(c => c.slug === prod.category_slug);
    if (!category) continue;

    await supabase.from("products").delete().eq("slug", prod.slug);

    const { data: productData, error: productError } = await supabase
      .from("products")
      .insert({
        name: prod.name,
        slug: prod.slug,
        description: prod.description,
        price: prod.price,
        category_id: category.id,
        is_active: prod.is_active,
        is_featured: prod.is_featured
      })
      .select()
      .single();

    if (productError) {
      console.error("Error inserting product", prod.name, productError);
      continue;
    }

    // Insert Product Image
    await supabase.from("product_images").delete().eq("product_id", productData.id);
    await supabase
      .from("product_images")
      .insert({
        product_id: productData.id,
        image_url: prod.image_url,
        sort_order: 0,
        alt_text: prod.name
      });

    // Insert Product Variants
    await supabase.from("product_variants").delete().eq("product_id", productData.id);
    const variantsToInsert = prod.variants.map(v => ({
      product_id: productData.id,
      size: v.size,
      color: v.color,
      price: v.price,
      stock_quantity: v.stock_quantity,
    }));

    await supabase
      .from("product_variants")
      .insert(variantsToInsert);
  }

  console.log("Products, images, and variants seeded!");
  console.log("Done.");
}

seed().catch(console.error);
