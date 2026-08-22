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
  { name: "Socks", slug: "socks", description: "Everyday staple. Crew, quarter and ankle — built for every day.", image_url: "/src/assets/collections/socks.jpg" },
  { name: "Underwear", slug: "underwear", description: "Foundation layer. Underwear that disappears under everything.", image_url: "/src/assets/collections/underwear.jpg" },
  { name: "Pants", slug: "pants", description: "Off-duty. Loungewear pants for slow mornings.", image_url: "/src/assets/collections/pants.jpg" },
  { name: "Shorts", slug: "shorts", description: "Warm weather. Shorts that move with you.", image_url: "/src/assets/collections/shorts.jpg" },
  { name: "T-Shirts", slug: "t-shirts", description: "Second skin. Undershirts and athletic tees.", image_url: "/src/assets/collections/tshirts.jpg" },
  { name: "Sets", slug: "sets", description: "Start fresh. Complete sets, one simple decision.", image_url: "/src/assets/collections/sets.jpg" },
];

const dummyProducts = [
  {
    name: "Classic Crew Socks",
    slug: "classic-crew-socks",
    description: "Athletic, terry-cushioned socks in cotton.",
    price: 12.0,
    category_slug: "socks",
    is_active: true,
    is_featured: true,
    image_url: "/src/assets/collections/socks.jpg",
    variants: [
      { size: "S", color: "White", price: 12.0, stock_quantity: 100 },
      { size: "M", color: "White", price: 12.0, stock_quantity: 100 },
      { size: "L", color: "White", price: 12.0, stock_quantity: 100 },
    ]
  },
  {
    name: "Modal Boxer Briefs",
    slug: "modal-boxer-briefs",
    description: "Boxer briefs in sport and loose fits.",
    price: 24.0,
    category_slug: "underwear",
    is_active: true,
    is_featured: true,
    image_url: "/src/assets/collections/underwear.jpg",
    variants: [
      { size: "S", color: "Black", price: 24.0, stock_quantity: 50 },
      { size: "M", color: "Black", price: 24.0, stock_quantity: 50 },
      { size: "L", color: "Black", price: 24.0, stock_quantity: 50 },
    ]
  },
  {
    name: "Lounge Pants",
    slug: "lounge-pants",
    description: "Soft, breathable cotton cuts made for rest days and long evenings.",
    price: 55.0,
    category_slug: "pants",
    is_active: true,
    is_featured: false,
    image_url: "/src/assets/collections/pants.jpg",
    variants: [
      { size: "M", color: "Grey", price: 55.0, stock_quantity: 20 },
      { size: "L", color: "Grey", price: 55.0, stock_quantity: 20 },
    ]
  },
  {
    name: "Everyday Shorts",
    slug: "everyday-shorts",
    description: "Lightweight everyday shorts in warm, wearable tones.",
    price: 45.0,
    category_slug: "shorts",
    is_active: true,
    is_featured: true,
    image_url: "/src/assets/collections/shorts.jpg",
    variants: [
      { size: "S", color: "Navy", price: 45.0, stock_quantity: 30 },
      { size: "M", color: "Navy", price: 45.0, stock_quantity: 30 },
    ]
  },
  {
    name: "Essential T-Shirt",
    slug: "essential-t-shirt",
    description: "Short-sleeve styles in cotton.",
    price: 30.0,
    category_slug: "t-shirts",
    is_active: true,
    is_featured: true,
    image_url: "/src/assets/collections/tshirts.jpg",
    variants: [
      { size: "M", color: "White", price: 30.0, stock_quantity: 40 },
      { size: "L", color: "White", price: 30.0, stock_quantity: 40 },
      { size: "M", color: "Black", price: 30.0, stock_quantity: 40 },
    ]
  },
  {
    name: "Complete Restock Set",
    slug: "complete-restock-set",
    description: "Matched essentials bundled together — the easiest way to restock.",
    price: 120.0,
    category_slug: "sets",
    is_active: true,
    is_featured: true,
    image_url: "/src/assets/collections/sets.jpg",
    variants: [
      { size: "M", color: "Mixed", price: 120.0, stock_quantity: 10 },
    ]
  },
];

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
