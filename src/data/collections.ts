import socksImg from "@/assets/collections/socks.webp";
import underwearImg from "@/assets/collections/underwear.webp";
import pantsImg from "@/assets/collections/pants.webp";
import shortsImg from "@/assets/collections/shorts.webp";
import tshirtsImg from "@/assets/collections/tshirts.webp";
import undershirtsImg from "@/assets/collections/undershirts.webp";
import setsImg from "@/assets/collections/sets.jpg";

export interface Collection {
  handle: string;
  name: string;
  eyebrow: string;
  tagline: string;
  description: string;
  image: string;
  gridImage: string;
  /** Shopify Storefront search query used to populate the collection */
  query: string;
}

export const collections: Collection[] = [
{
    handle: "socks",
    name: "جوراب ",
    eyebrow: "نیاز روزمره شما",
    tagline: "از مچی تا ساقدار؛ بافته‌شده برای راحتیِ هر روز",
    description: "جوراب‌های ورزشی، حوله‌ای و پشمی، تولیدشده از الیاف پنبه، بامبو و پارچه‌های نانو.",
    image: socksImg,
    gridImage: socksImg,
    query: "product_type:Socks",
  },
  {
    handle: "underwear",
    name: "لباس زیر",
    eyebrow: "پایه راحتی",
    tagline: "راحتیِ نامرئی زیر لباس‌های شما",
    description: "انواع شورت‌های باکسر، پادار و اسلیپ در قواره‌های ورزشی و آزاد، به همراه برش‌های کلاسیک زنانه.",
    image: underwearImg,
    gridImage: underwearImg,
    query: "tag:underwear",
  },
  {
    handle: "undershirts",
    name: "زیرپوش",
    eyebrow: "لایه اول",
    tagline: "سبک و تنفس‌پذیر برای راحتیِ تمام روز",
    description: "زیرپوش‌های نرم و خوش‌دوخت، طراحی‌شده برای اینکه کاملاً روی بدن بخوابند و زیر لباس جمع نشوند.",
    image: undershirtsImg,
    gridImage: undershirtsImg,
    query: "tag:undershirt",
  },
 {
    handle: "pants",
    name: "شلوار",
    eyebrow: "استایل اکتیو",
    tagline: "شلوارهای ورزشی برای اوج عملکرد و راحتی",
    description: "شلوارهای ورزشی و جاگرهای تنفس‌پذیر، طراحی‌شده برای تمرینات باشگاهی، دویدن و روزهای پرتحرک.",
    image: pantsImg,
    gridImage: pantsImg,
    query: "tag:loungewear OR product_type:Pants",
  },
  {
    handle: "shorts",
    name: "شلوارک",
    eyebrow: "آزادی حرکت",
    tagline: "شلوارک‌هایی که پابه‌پای شما می‌آیند",
    description: "شلوارک‌های ورزشیِ سبک و منعطف، انتخابی ایده‌آل برای تمرینات پرفشار و فعالیت‌های ورزشی.",
    image: shortsImg,
    gridImage: shortsImg,
    query: "product_type:Shorts OR tag:shorts",
  },
  {
    handle: "t-shirts",
    name: "تیشرت",
    eyebrow: "پوست دوم شما",
    tagline: "تیشرت‌های روزمره و ورزشی",
    description: "مدل‌های آستین‌کوتاه، تاپ و یقه‌خشتی از جنس نخ‌پنبه یا مودال.",
    image: tshirtsImg,
    gridImage: tshirtsImg,
    query: "tag:undershirt OR product_type:T-Shirts",
  },
  {
    handle: "sets",
    name: "ست‌ها",
    eyebrow: "یک شروع تازه",
    tagline: "ست‌های کامل؛ یک انتخاب ساده",
    description: "پوشاکِ ضروری و هماهنگ در یک بسته‌بندی — راحت‌ترین راه برای تکمیل کمد لباس‌هایتان.",
    image: setsImg,
    gridImage: setsImg,
    query: "tag:set OR tag:underwear",
  },
];

export function getCollection(handle?: string) {
  return collections.find((c) => c.handle === handle);
}
