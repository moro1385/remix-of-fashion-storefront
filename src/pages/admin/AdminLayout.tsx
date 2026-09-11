import { useState } from "react";
import { Link, Outlet, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { LayoutDashboard, Package, ShoppingCart, Users, MessageSquare, Menu, RotateCcw } from "lucide-react";
import ScrollToTop from "@/components/ScrollToTop";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";

const navItems = [
  { href: "/admin", label: "داشبورد", icon: LayoutDashboard },
  { href: "/admin/products", label: "محصولات", icon: Package },
  { href: "/admin/orders", label: "سفارشات", icon: ShoppingCart },
  { href: "/admin/users", label: "کاربران", icon: Users },
  { href: "/admin/tickets", label: "تیکت‌ها", icon: MessageSquare },
  { href: "/admin/return-requests", label: "درخواست‌های مرجوعی", icon: RotateCcw },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <div className="min-h-screen flex bg-muted/20">
      <ScrollToTop />

      {/* Sidebar */}
      <aside className="w-64 bg-background border-l flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b">
          <Link to="/" className="text-xl font-light uppercase tracking-widest">
            Jami<span className="font-medium text-accent">Mode</span> <span className="text-sm text-muted-foreground mr-1">مدیریت</span>
          </Link>
        </div>
        <nav className="flex-1 px-4 py-6 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                to={item.href}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                  isActive
                    ? "bg-accent/10 text-accent"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="w-5 h-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0">
        <header className="h-16 border-b bg-background flex items-center px-4 md:px-6 justify-between md:justify-end">
          <div className="flex items-center md:hidden gap-2">
            <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">منوی مدیریت</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-64 p-0">
                <div className="h-16 flex items-center px-6 border-b">
                  <Link to="/" className="text-xl font-light uppercase tracking-widest" onClick={() => setIsMobileMenuOpen(false)}>
                    Jami<span className="font-medium text-accent">Mode</span> <span className="text-sm text-muted-foreground mr-1">مدیریت</span>
                  </Link>
                </div>
                <nav className="flex-1 px-4 py-6 space-y-1">
                  {navItems.map((item) => {
                    const isActive = pathname === item.href || (item.href !== "/admin" && pathname.startsWith(item.href));
                    const Icon = item.icon;

                    return (
                      <Link
                        key={item.href}
                        to={item.href}
                        onClick={() => setIsMobileMenuOpen(false)}
                        className={cn(
                          "flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors",
                          isActive
                            ? "bg-accent/10 text-accent"
                            : "text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <Icon className="w-5 h-5" />
                        {item.label}
                      </Link>
                    );
                  })}
                </nav>
              </SheetContent>
            </Sheet>
            <Link to="/" className="text-xl font-light uppercase tracking-widest">
               Jami<span className="font-medium text-accent">Mode</span>
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/" className="text-sm text-muted-foreground hover:text-foreground">
              بازگشت به فروشگاه
            </Link>
          </div>
        </header>

        <div className="flex-1 overflow-auto p-6 md:p-8">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
