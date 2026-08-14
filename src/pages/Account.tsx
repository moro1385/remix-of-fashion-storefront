import { Link } from "react-router-dom";
import { Heart, LogIn, Package, Settings, User } from "lucide-react";

const sections = [
  { icon: Package, title: "Orders", body: "Track shipments and revisit past purchases." },
  { icon: Heart, title: "Saved items", body: "Keep the pieces you want to come back to." },
  { icon: Settings, title: "Preferences", body: "Sizes, addresses and notification settings." },
];

export default function Account() {
  return (
    <div className="min-h-screen bg-[hsl(var(--warm-bg))]">
      <div className="max-w-4xl mx-auto px-6 py-24">
        <div className="text-center">
          <div className="w-16 h-16 mx-auto flex items-center justify-center border border-border bg-background">
            <User className="w-7 h-7 text-foreground" strokeWidth={1.5} />
          </div>
          <h1 className="mt-8 text-4xl md:text-5xl font-light text-foreground">Your Account</h1>
          <p className="mt-4 text-sm text-muted-foreground max-w-md mx-auto">
            Sign in to follow your orders, save favourites and check out faster next time.
          </p>
          <button
            type="button"
            className="inline-flex items-center gap-2 mt-8 px-8 py-3 bg-primary text-primary-foreground text-xs uppercase tracking-[0.2em] hover:opacity-90 transition-opacity"
          >
            <LogIn className="w-4 h-4" />
            Sign in
          </button>
          <p className="mt-4 text-xs text-muted-foreground">Accounts are coming soon.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-20">
          {sections.map((section) => (
            <div key={section.title} className="bg-background p-8">
              <section.icon className="w-5 h-5 text-accent" strokeWidth={1.5} />
              <h2 className="mt-5 text-lg font-light text-foreground">{section.title}</h2>
              <p className="mt-2 text-sm text-muted-foreground">{section.body}</p>
            </div>
          ))}
        </div>

        <div className="text-center mt-16">
          <Link to="/shop" className="text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors">
            Continue shopping
          </Link>
        </div>
      </div>
    </div>
  );
}
