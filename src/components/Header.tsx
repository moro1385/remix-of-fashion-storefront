import { Link, useLocation } from "react-router-dom";
import { ShoppingCart, Menu, X, Instagram, User, ChevronDown } from "lucide-react";
import { useCartStore } from "@/stores/cartStore";
import { useAuthStore } from "@/stores/authStore";
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";

const shopDepartments = [
  {
    name: "Men",
    label: "مردانه",
    categories: [
      { name: "Socks", label: "Socks" },
      { name: "Pants", label: "Pants" },
      { name: "Shorts", label: "Shorts" },
      { name: "T-Shirts", label: "T-Shirts" },
      { name: "Tank Tops", label: "Tank Tops" },
      { name: "Underwear", label: "Underwear" },
      { name: "Undershirts", label: "Undershirts" },
      { name: "Swimwear", label: "Swimwear" },
      { name: "Sets", label: "Sets" },
    ],
  },
  {
    name: "Women",
    label: "زنانه",
    categories: [
      { name: "Socks", label: "Socks" },
      { name: "Pants", label: "Pants" },
      { name: "Shorts", label: "Shorts" },
      { name: "T-Shirts", label: "T-Shirts" },
      { name: "Tank Tops", label: "Tank Tops" },
      { name: "Underwear", label: "Underwear" },
      { name: "Undershirts", label: "Undershirts" },
      { name: "Sets", label: "Sets" },
    ],
  },
  {
    name: "Kids",
    label: "بچه گانه",
    categories: [
      { name: "Socks", label: "Socks" },
      { name: "Underwear", label: "Underwear/Shorts" },
      { name: "Undershirts", label: "Undershirts" },
    ],
  },
];

const navLinks = [
  { to: "/", label: "Home" },
  { to: "/about", label: "About" },
  { to: "/contact", label: "Contact" },
];

export default function Header() {
  const totalItems = useCartStore(state =>
    state.items.reduce((sum, i) => sum + i.quantity, 0)
  );
  const session = useAuthStore(state => state.session);
  const isAuthenticated = !!session && session.expiresAt > Date.now();
  const accountHref = isAuthenticated ? "/account" : "/signin";
  const accountLabel = isAuthenticated ? "My account" : "Sign in";
  const { pathname } = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [shopMenuOpen, setShopMenuOpen] = useState(false);
  const [mobileShopMenuOpen, setMobileShopMenuOpen] = useState(false);

  const isHome = pathname === "/";

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener("scroll", onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const transparent = isHome && !scrolled && !mobileOpen;

  return (
    <header
      className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        transparent
          ? "bg-transparent border-b border-transparent"
          : "bg-white border-b border-border shadow-sm"
      )}
    >
      <div className="flex items-center justify-between px-6 h-[88px] md:h-[104px] max-w-7xl mx-auto">
        <Link
          to="/"
          className={cn(
            "text-2xl md:text-4xl font-light uppercase tracking-[0.28em] transition-colors leading-none",
            transparent ? "text-primary-foreground" : "text-foreground"
          )}
        >
          Jami<span className="font-medium text-accent">Mode</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            to="/"
            className={cn(
              "text-sm uppercase tracking-wider transition-colors",
              transparent
                ? "text-primary-foreground/80 hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
              pathname === "/" && (transparent ? "text-primary-foreground font-medium" : "text-foreground font-medium")
            )}
          >
            Home
          </Link>

          <div
            className="relative"
            onMouseEnter={() => setShopMenuOpen(true)}
            onMouseLeave={() => setShopMenuOpen(false)}
          >
            <Link
              to="/shop"
              className={cn(
                "text-sm uppercase tracking-wider transition-colors flex items-center gap-1 py-4",
                transparent
                  ? "text-primary-foreground/80 hover:text-primary-foreground"
                  : "text-muted-foreground hover:text-foreground",
                pathname.startsWith("/shop") && (transparent ? "text-primary-foreground font-medium" : "text-foreground font-medium")
              )}
            >
              Shop
              <ChevronDown className="w-4 h-4" />
            </Link>

            {/* Desktop Mega Menu */}
            {shopMenuOpen && (
              <div className="absolute top-full left-1/2 -translate-x-1/2 bg-background border border-border shadow-lg p-6 w-[600px] flex gap-8 z-50">
                {shopDepartments.map((dept) => (
                  <div key={dept.name} className="flex-1">
                    <h3 className="font-medium text-foreground mb-4 border-b border-border pb-2 uppercase text-sm flex items-center justify-between gap-2">
                      <span>{dept.name}</span>
                      <span className="text-xs text-muted-foreground">{dept.label}</span>
                    </h3>
                    <ul className="space-y-2">
                      {dept.categories.map((cat) => (
                        <li key={cat.name}>
                          <Link
                            to={`/shop?department=${dept.name.toLowerCase()}&category=${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm text-muted-foreground hover:text-foreground transition-colors block py-1"
                            onClick={() => setShopMenuOpen(false)}
                          >
                            {cat.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/about"
            className={cn(
              "text-sm uppercase tracking-wider transition-colors",
              transparent
                ? "text-primary-foreground/80 hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
              pathname === "/about" && (transparent ? "text-primary-foreground font-medium" : "text-foreground font-medium")
            )}
          >
            About
          </Link>

          <Link
            to="/contact"
            className={cn(
              "text-sm uppercase tracking-wider transition-colors",
              transparent
                ? "text-primary-foreground/80 hover:text-primary-foreground"
                : "text-muted-foreground hover:text-foreground",
              pathname === "/contact" && (transparent ? "text-primary-foreground font-medium" : "text-foreground font-medium")
            )}
          >
            Contact
          </Link>
        </nav>

        <div className="hidden md:flex items-center gap-5">
          <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" aria-label="Instagram">
            <Instagram className={cn("w-[18px] h-[18px] transition-colors", transparent ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground")} />
          </a>
          <Link to={accountHref} aria-label={accountLabel}>
            <User className={cn("w-[18px] h-[18px] transition-colors", transparent ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground")} />
          </Link>
          <Link to="/cart" className="relative" aria-label="Shopping cart">
            <ShoppingCart className={cn("w-[18px] h-[18px] transition-colors", transparent ? "text-primary-foreground/80 hover:text-primary-foreground" : "text-muted-foreground hover:text-foreground")} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </Link>
        </div>


        {/* Mobile */}
        <div className="flex md:hidden items-center gap-4">
          <Link to={accountHref} aria-label={accountLabel}>
            <User className={cn("w-5 h-5 transition-colors", transparent ? "text-primary-foreground" : "text-foreground")} />
          </Link>
          <Link to="/cart" className="relative" aria-label="Shopping cart">
            <ShoppingCart className={cn("w-5 h-5 transition-colors", transparent ? "text-primary-foreground" : "text-foreground")} />
            {totalItems > 0 && (
              <span className="absolute -top-2 -right-2 bg-accent text-accent-foreground text-[10px] w-[18px] h-[18px] rounded-full flex items-center justify-center font-medium">
                {totalItems}
              </span>
            )}
          </Link>
          <button onClick={() => setMobileOpen(!mobileOpen)} aria-label="Toggle menu">
            {mobileOpen
              ? <X className={cn("w-6 h-6", transparent ? "text-primary-foreground" : "text-foreground")} />
              : <Menu className={cn("w-6 h-6", transparent ? "text-primary-foreground" : "text-foreground")} />
            }
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <nav className="md:hidden border-t border-border bg-background px-6 py-6 space-y-4 h-[calc(100vh-88px)] overflow-y-auto">
          <Link
            to="/"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "block text-sm uppercase tracking-wider text-muted-foreground",
              pathname === "/" && "text-foreground font-medium"
            )}
          >
            Home
          </Link>

          <div>
            <div className="flex items-center justify-between">
              <Link
                to="/shop"
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "block text-sm uppercase tracking-wider text-muted-foreground",
                  pathname.startsWith("/shop") && "text-foreground font-medium"
                )}
              >
                Shop
              </Link>
              <button
                onClick={(e) => {
                  e.preventDefault();
                  setMobileShopMenuOpen(!mobileShopMenuOpen);
                }}
                className="p-2"
              >
                <ChevronDown className={cn("w-5 h-5 transition-transform", mobileShopMenuOpen && "rotate-180")} />
              </button>
            </div>

            {mobileShopMenuOpen && (
              <div className="pl-4 mt-4 space-y-6">
                {shopDepartments.map((dept) => (
                  <div key={dept.name}>
                    <h3 className="font-medium text-foreground mb-3 uppercase text-xs flex items-center justify-between pr-4">
                      <span>{dept.name}</span>
                      <span className="text-muted-foreground">{dept.label}</span>
                    </h3>
                    <ul className="space-y-3">
                      {dept.categories.map((cat) => (
                        <li key={cat.name}>
                          <Link
                            to={`/shop?department=${dept.name.toLowerCase()}&category=${cat.name.toLowerCase().replace(/\s+/g, '-')}`}
                            className="text-sm text-muted-foreground hover:text-foreground block"
                            onClick={() => setMobileOpen(false)}
                          >
                            {cat.label}
                          </Link>
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </div>

          <Link
            to="/about"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "block text-sm uppercase tracking-wider text-muted-foreground",
              pathname === "/about" && "text-foreground font-medium"
            )}
          >
            About
          </Link>

          <Link
            to="/contact"
            onClick={() => setMobileOpen(false)}
            className={cn(
              "block text-sm uppercase tracking-wider text-muted-foreground",
              pathname === "/contact" && "text-foreground font-medium"
            )}
          >
            Contact
          </Link>

          <div className="pt-4 mt-4 border-t border-border">
            <Link
              to={accountHref}
              onClick={() => setMobileOpen(false)}
              className="block text-sm uppercase tracking-wider text-muted-foreground"
            >
              {isAuthenticated ? "My account" : "Sign in"}
            </Link>
          </div>
        </nav>
      )}

    </header>
  );
}
