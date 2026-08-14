import { Link } from "react-router-dom";
import { collections } from "@/data/collections";

export default function CollectionCardsRow() {
  return (
    <section className="py-20 bg-[hsl(var(--warm-bg))]">
      <div className="max-w-7xl mx-auto px-6">
        <div className="flex items-end justify-between gap-6 mb-10">
          <div>
            <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-3">Browse</p>
            <h2 className="text-3xl md:text-4xl font-light text-foreground">All Collections</h2>
          </div>
          <Link
            to="/shop"
            className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>

        <div className="flex gap-5 overflow-x-auto snap-x snap-mandatory pb-4 -mx-6 px-6">
          {collections.map((collection) => (
            <Link
              key={collection.handle}
              to={`/collections/${collection.handle}`}
              className="group snap-start shrink-0 w-[70%] sm:w-[45%] lg:w-[24%]"
            >
              <div className="overflow-hidden">
                <img
                  src={collection.image}
                  alt={collection.name}
                  width={1920}
                  height={1080}
                  loading="lazy"
                  className="w-full aspect-[3/4] object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                />
              </div>
              <h3 className="mt-4 text-lg font-light text-foreground">{collection.name}</h3>
              <p className="text-xs text-muted-foreground mt-1">{collection.eyebrow}</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
