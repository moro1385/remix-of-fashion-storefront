import { CatalogProduct } from "@/services/products";

export const mockProducts: CatalogProduct[] = [
  {
    node: {
      id: "mock-socks-1",
      title: "Everyday Crew Socks",
      description: "Comfortable and breathable crew socks for everyday wear.",
      handle: "everyday-crew-socks",
      productType: "Socks",
      tags: ["socks"],
      priceRange: { minVariantPrice: { amount: "12.00", currencyCode: "USD" } },
      images: {
        edges: [
          { node: { url: "https://images.unsplash.com/photo-1582966772680-860e372bb558?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", altText: "Everyday Crew Socks" } }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "mock-socks-1-var-1",
              title: "White",
              price: { amount: "12.00", currencyCode: "USD" },
              availableForSale: true,
              selectedOptions: [{ name: "Color", value: "White" }]
            }
          }
        ]
      },
      options: [{ name: "Color", values: ["White"] }]
    }
  },
  {
    node: {
      id: "mock-underwear-1",
      title: "Essential Boxer Briefs",
      description: "Soft and supportive boxer briefs.",
      handle: "essential-boxer-briefs",
      productType: "Underwear",
      tags: ["underwear"],
      priceRange: { minVariantPrice: { amount: "25.00", currencyCode: "USD" } },
      images: {
        edges: [
          { node: { url: "https://images.unsplash.com/photo-1563212036-7b567dcb78f8?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", altText: "Essential Boxer Briefs" } }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "mock-underwear-1-var-1",
              title: "Black",
              price: { amount: "25.00", currencyCode: "USD" },
              availableForSale: true,
              selectedOptions: [{ name: "Color", value: "Black" }]
            }
          }
        ]
      },
      options: [{ name: "Color", values: ["Black"] }]
    }
  },
  {
    node: {
      id: "mock-pants-1",
      title: "Lounge Sweatpants",
      description: "Cozy sweatpants for relaxing at home.",
      handle: "lounge-sweatpants",
      productType: "Pants",
      tags: ["loungewear"],
      priceRange: { minVariantPrice: { amount: "65.00", currencyCode: "USD" } },
      images: {
        edges: [
          { node: { url: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", altText: "Lounge Sweatpants" } }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "mock-pants-1-var-1",
              title: "Grey",
              price: { amount: "65.00", currencyCode: "USD" },
              availableForSale: true,
              selectedOptions: [{ name: "Color", value: "Grey" }]
            }
          }
        ]
      },
      options: [{ name: "Color", values: ["Grey"] }]
    }
  },
  {
    node: {
      id: "mock-shorts-1",
      title: "Athletic Shorts",
      description: "Lightweight shorts for working out or hanging out.",
      handle: "athletic-shorts",
      productType: "Shorts",
      tags: ["shorts"],
      priceRange: { minVariantPrice: { amount: "40.00", currencyCode: "USD" } },
      images: {
        edges: [
          { node: { url: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", altText: "Athletic Shorts" } }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "mock-shorts-1-var-1",
              title: "Navy",
              price: { amount: "40.00", currencyCode: "USD" },
              availableForSale: true,
              selectedOptions: [{ name: "Color", value: "Navy" }]
            }
          }
        ]
      },
      options: [{ name: "Color", values: ["Navy"] }]
    }
  },
  {
    node: {
      id: "mock-tshirts-1",
      title: "Classic Cotton Tee",
      description: "A perfect fitting classic t-shirt.",
      handle: "classic-cotton-tee",
      productType: "T-Shirts",
      tags: ["undershirt"],
      priceRange: { minVariantPrice: { amount: "30.00", currencyCode: "USD" } },
      images: {
        edges: [
          { node: { url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", altText: "Classic Cotton Tee" } }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "mock-tshirts-1-var-1",
              title: "White",
              price: { amount: "30.00", currencyCode: "USD" },
              availableForSale: true,
              selectedOptions: [{ name: "Color", value: "White" }]
            }
          }
        ]
      },
      options: [{ name: "Color", values: ["White"] }]
    }
  },
  {
    node: {
      id: "mock-sets-1",
      title: "Weekend Lounge Set",
      description: "Matching set for maximum comfort.",
      handle: "weekend-lounge-set",
      productType: "Sets",
      tags: ["set"],
      priceRange: { minVariantPrice: { amount: "90.00", currencyCode: "USD" } },
      images: {
        edges: [
          { node: { url: "https://images.unsplash.com/photo-1434389678232-040150937a07?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80", altText: "Weekend Lounge Set" } }
        ]
      },
      variants: {
        edges: [
          {
            node: {
              id: "mock-sets-1-var-1",
              title: "Olive",
              price: { amount: "90.00", currencyCode: "USD" },
              availableForSale: true,
              selectedOptions: [{ name: "Color", value: "Olive" }]
            }
          }
        ]
      },
      options: [{ name: "Color", values: ["Olive"] }]
    }
  }
];
