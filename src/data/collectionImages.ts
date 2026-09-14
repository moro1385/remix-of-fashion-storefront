import { collections } from "./collections";

export type Department = "men" | "women" | "kids";

interface DepartmentImageMap {
  men?: string;
  women?: string;
  kids?: string;
}

// همه‌ی این مسیرها از پوشه‌ی public خونده می‌شن.
// فقط کافیه یه پوشه به اسم "collections" داخل public بسازی
// و عکس‌ها رو با همین اسم‌ها توش بذاری.
// اگه اسم فایلت فرق داره، فقط خود رشته رو عوض کن.
export const collectionImages: Record<string, DepartmentImageMap> = {
  socks: {
    men: "/collections/men-socks.jpg",
    women: "/collections/women-socks.jpg",
    kids: "/collections/kids-socks.jpg",
  },
  underwear: {
    men: "/collections/men-underwear.jpg",
    women: "/collections/women-underwear.jpg",
    kids: "/collections/kids-underwear.jpg",
  },
  undershirts: {
    men: "/collections/men-undershirts.jpg",
    women: "/collections/women-undershirts.jpg",
    kids: "/collections/kids-undershirts.jpg",
  },
  pants: {
    men: "/collections/men-pants.jpg",
    women: "/collections/women-pants.jpg",
  },
  shorts: {
    men: "/collections/men-shorts.jpg",
    women: "/collections/women-shorts.jpg",
  },
  "t-shirts": {
    men: "/collections/men-tshirts.jpg",
    women: "/collections/women-tshirts.jpg",
  },
  "tank-tops": {
    men: "/collections/men-tanktops.jpg",
    women: "/collections/women-tanktops.jpg",
  },
  sets: {
    men: "/collections/men-sets.jpg",
    women: "/collections/women-sets.jpg",
  },
};

// اگه برای یه دسته/بخش خاص هنوز عکس ست نکرده باشی، خودش می‌ره سراغ
// همون عکس قدیمی مشترک (که الان استفاده می‌شه) تا چیزی خراب نشه.
export function getCollectionImage(
  department: string | null | undefined,
  handle: string | null | undefined
): string {
  if (!handle) return "";
  const deptMap = collectionImages[handle];
  const specific = department ? deptMap?.[department as Department] : undefined;
  if (specific) return specific;

  const base = collections.find((c) => c.handle === handle);
  return base?.gridImage || base?.image || "";
}