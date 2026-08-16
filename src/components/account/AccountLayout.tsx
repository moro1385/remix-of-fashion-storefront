import { Link, NavLink, useNavigate } from "react-router-dom";
import type { ReactNode } from "react";
import { CreditCard, LogOut, MapPin, Package, ShoppingCart, User } from "lucide-react";
import { useAuthStore } from "@/stores/authStore";
import { formatPhone } from "@/lib/phone";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const navItems = [
  { to: "/account", label: "Personal information", icon: User, end: true },
  { to: "/account/addresses", label: "Addresses", icon: MapPin },
  { to: "/account/wallet", label: "Wallet", icon: CreditCard },
  { to: "/cart", label: "Shopping cart", icon: ShoppingCart },
  { to: "/account/orders", label: "Orders", icon: Package },
];

interface AccountLayoutProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export default function AccountLayout({ title, description, children }: AccountLayoutProps) {
  const navigate = useNavigate();
  const user = useAuthStore((s) => s.user);
  const signOut = useAuthStore((s) => s.signOut);

  const displayName = [user?.firstName, user?.lastName].filter(Boolean).join(" ");

  const handleSignOut = async () => {
    await signOut();
    toast.success("You've been signed out");
    navigate("/", { replace: true });
  };

  return (
    <div className="bg-[hsl(var(--warm-bg))] min-h-[calc(100vh-104px)]">
      <div className="max-w-6xl mx-auto px-6 py-16 md:py-24">
        <p className="text-[11px] uppercase tracking-[0.3em] text-accent">My account</p>
        <h1 className="mt-4 text-3xl md:text-4xl font-light text-foreground">
          {displayName || "Welcome"}
        </h1>
        {user?.phone && (
          <p className="mt-2 text-sm text-muted-foreground">{formatPhone(user.phone)}</p>
        )}

        <div className="mt-12 grid gap-10 lg:grid-cols-[260px_1fr]">
          <nav className="lg:sticky lg:top-32 h-max">
            <ul className="flex lg:flex-col gap-1 overflow-x-auto lg:overflow-visible bg-background border border-border p-2">
              {navItems.map((item) => (
                <li key={item.to} className="shrink-0 lg:shrink">
                  <NavLink
                    to={item.to}
                    end={item.end}
                    className={({ isActive }) =>
                      cn(
                        "flex items-center gap-3 px-4 py-3 text-xs uppercase tracking-[0.15em] whitespace-nowrap transition-colors",
                        isActive
                          ? "bg-primary text-primary-foreground"
                          : "text-muted-foreground hover:text-foreground hover:bg-muted"
                      )
                    }
                  >
                    <item.icon className="w-4 h-4 shrink-0" strokeWidth={1.5} />
                    {item.label}
                  </NavLink>
                </li>
              ))}
            </ul>

            <button
              onClick={handleSignOut}
              className="mt-4 w-full flex items-center gap-3 px-4 py-3 border border-border bg-background text-xs uppercase tracking-[0.15em] text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-colors"
            >
              <LogOut className="w-4 h-4" strokeWidth={1.5} />
              Sign out
            </button>

            <Link
              to="/shop"
              className="mt-4 inline-block text-xs uppercase tracking-[0.2em] text-muted-foreground hover:text-foreground transition-colors"
            >
              Continue shopping
            </Link>
          </nav>

          <section className="bg-background border border-border p-6 md:p-10 animate-in fade-in duration-300">
            <header className="pb-6 border-b border-border">
              <h2 className="text-xl font-light text-foreground">{title}</h2>
              {description && <p className="mt-2 text-sm text-muted-foreground">{description}</p>}
            </header>
            <div className="pt-8">{children}</div>
          </section>
        </div>
      </div>
    </div>
  );
}
