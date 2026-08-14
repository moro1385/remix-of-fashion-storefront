import socksImg from "@/assets/collections/socks.jpg";
import underwearImg from "@/assets/collections/underwear.jpg";
import pantsImg from "@/assets/collections/pants.jpg";
import shortsImg from "@/assets/collections/shorts.jpg";
import tshirtsImg from "@/assets/collections/tshirts.jpg";
import setsImg from "@/assets/collections/sets.jpg";

export interface Collection {
  handle: string;
  name: string;
  eyebrow: string;
  tagline: string;
  description: string;
  image: string;
  /** Shopify Storefront search query used to populate the collection */
  query: string;
}

export const collections: Collection[] = [
  {
    handle: "socks",
    name: "Socks",
    eyebrow: "Everyday staple",
    tagline: "Crew, quarter and ankle — built for every day.",
    description:
      "Athletic, terry-cushioned and wool socks in cotton, bamboo fiber and nano-fabric.",
    image: socksImg,
    query: "product_type:Socks",
  },
  {
    handle: "underwear",
    name: "Underwear",
    eyebrow: "Foundation layer",
    tagline: "Underwear that disappears under everything.",
    description: "Boxer briefs, trunks and briefs in sport and loose fits, plus women's classic cut.",
    image: underwearImg,
    query: "tag:underwear",
  },
  {
    handle: "pants",
    name: "Pants",
    eyebrow: "Off-duty",
    tagline: "Loungewear pants for slow mornings.",
    description: "Soft, breathable cotton cuts made for rest days and long evenings.",
    image: pantsImg,
    query: "tag:loungewear OR product_type:Pants",
  },
  {
    handle: "shorts",
    name: "Shorts",
    eyebrow: "Warm weather",
    tagline: "Shorts that move with you.",
    description: "Lightweight everyday shorts in warm, wearable tones.",
    image: shortsImg,
    query: "product_type:Shorts OR tag:shorts",
  },
  {
    handle: "t-shirts",
    name: "T-Shirts",
    eyebrow: "Second skin",
    tagline: "Undershirts and athletic tees.",
    description: "Short-sleeve, tank and square-neck styles in cotton or modal.",
    image: tshirtsImg,
    query: "tag:undershirt OR product_type:T-Shirts",
  },
  {
    handle: "sets",
    name: "Sets",
    eyebrow: "Start fresh",
    tagline: "Complete sets, one simple decision.",
    description: "Matched essentials bundled together — the easiest way to restock.",
    image: setsImg,
    query: "tag:set OR tag:underwear",
  },
];

export function getCollection(handle?: string) {
  return collections.find((c) => c.handle === handle);
}
