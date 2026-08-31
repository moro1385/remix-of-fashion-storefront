import { Link } from "react-router-dom";
import { collections } from "@/data/collections";

// Explode standard collections into department-specific routes as requested
const collectionCards = [
  // Men's
  { dept: "men", deptLabel: "Men's", handle: "socks" },
  { dept: "men", deptLabel: "Men's", handle: "underwear" },
  { dept: "men", deptLabel: "Men's", handle: "undershirts" },
  { dept: "men", deptLabel: "Men's", handle: "pants" },
  { dept: "men", deptLabel: "Men's", handle: "shorts" },
  { dept: "men", deptLabel: "Men's", handle: "t-shirts" },
  { dept: "men", deptLabel: "Men's", handle: "tank-tops", labelOverride: "Tank Tops" },
  { dept: "men", deptLabel: "Men's", handle: "sets" },
  // Women's
  { dept: "women", deptLabel: "Women's", handle: "socks" },
  { dept: "women", deptLabel: "Women's", handle: "underwear" },
  { dept: "women", deptLabel: "Women's", handle: "undershirts" },
  { dept: "women", deptLabel: "Women's", handle: "pants" },
  { dept: "women", deptLabel: "Women's", handle: "shorts" },
  { dept: "women", deptLabel: "Women's", handle: "t-shirts" },
  { dept: "women", deptLabel: "Women's", handle: "tank-tops", labelOverride: "Tank Tops" },
  { dept: "women", deptLabel: "Women's", handle: "sets" },
  // Kids'
  { dept: "kids", deptLabel: "Kids'", handle: "socks" },
  { dept: "kids", deptLabel: "Kids'", handle: "underwear", labelOverride: "Underwear/Shorts" },
  { dept: "kids", deptLabel: "Kids'", handle: "undershirts" },
].map((item) => {
  // Use 't-shirts' image for 'tank-tops' fallback if needed, but get base from collections
  const baseCollection = collections.find((c) => c.handle === item.handle) ||
                         collections.find((c) => c.handle === (item.handle === 'tank-tops' ? 't-shirts' : item.handle));
  return {
    ...item,
    name: item.labelOverride || baseCollection?.name || item.handle,
    image: baseCollection?.image || '',
    eyebrow: baseCollection?.eyebrow || 'نیاز روزمره شما',
  };
});

export default function CollectionCardsRow() {
  return (
    <section className="py-20 bg-[hsl(var(--warm-bg))]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Browse</p>
            <h2 className="text-3xl md:text-4xl font-light text-foreground">All Collections</h2>
          </div>
        </div>

        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
          {collectionCards.map((card, idx) => (
            <Link
              key={`${card.dept}-${card.handle}-${idx}`}
              to={`/shop?department=${card.dept}&category=${card.handle}`}
              className="group snap-start shrink-0 w-[70%] sm:w-[45%] lg:w-[24%]"
            >
              <div className="overflow-hidden">
                <img
                  src={card.image}
                  alt={`${card.deptLabel} ${card.name}`}
                  width={1920}
                  height={1080}
                  loading="lazy"
                  className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <h3 className="mt-4 text-lg font-light text-foreground">{card.deptLabel} {card.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{card.eyebrow}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
