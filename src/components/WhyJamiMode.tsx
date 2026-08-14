import { Link } from "react-router-dom";
import { Leaf, Package, RefreshCcw, Ruler } from "lucide-react";

const reasons = [
  {
    icon: Leaf,
    title: "Materials that last",
    body: "Combed cotton, bamboo fiber and modal — chosen for breathability, softness and a shape that holds after wash number fifty.",
  },
  {
    icon: Ruler,
    title: "Fit worked out for you",
    body: "Every model is cut and re-cut on real bodies, so sizing is honest and predictable across the whole range.",
  },
  {
    icon: Package,
    title: "Restock in one order",
    body: "Socks, underwear, undershirts and loungewear in one place. Refill your drawer without hunting five different brands.",
  },
  {
    icon: RefreshCcw,
    title: "Easy, no-drama returns",
    body: "Didn't land right? Send it back within 30 days. We'd rather you wear something you love every single day.",
  },
];

export default function WhyJamiMode() {
  return (
    <section className="py-24">
      <div className="max-w-7xl mx-auto px-6">
        <div className="max-w-2xl">
          <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground mb-4">
            Why Jami Mode
          </p>
          <h2 className="text-3xl md:text-5xl font-light text-foreground leading-tight">
            The layer nobody sees deserves the most care.
          </h2>
          <p className="mt-6 text-base leading-relaxed text-muted-foreground">
            Basics get worn more than anything else in your wardrobe, and they wear out first. We
            build ours to outlast the trend cycle: warm, quiet colours, honest fabrics and a fit
            you forget you're wearing. Buy less, replace it less often, feel better all day.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10 mt-16">
          {reasons.map((reason) => (
            <div key={reason.title}>
              <reason.icon className="w-6 h-6 text-accent" strokeWidth={1.5} />
              <h3 className="mt-5 text-lg font-light text-foreground">{reason.title}</h3>
              <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{reason.body}</p>
            </div>
          ))}
        </div>

        <div className="mt-16 border-t border-border pt-12 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <p className="text-xl md:text-2xl font-light text-foreground max-w-xl">
            Start with one pair. You'll come back for the drawer.
          </p>
          <Link
            to="/shop"
            className="self-start px-8 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
          >
            Shop everything
          </Link>
        </div>
      </div>
    </section>
  );
}
