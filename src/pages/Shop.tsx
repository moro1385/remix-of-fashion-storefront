import { useMemo, useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import ProductCard from "@/components/ProductCard";
import { useProducts } from "@/hooks/useProducts";
import { Loader2, SlidersHorizontal } from "lucide-react";
import { cn } from "@/lib/utils";
import { ShopFilters, FilterState } from "@/components/ShopFilters";
import { ShopSort } from "@/components/ShopSort";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";

export default function Shop() {
  const [searchParams] = useSearchParams();
  const departmentQuery = searchParams.get("department");
  const categoryQuery = searchParams.get("category");

  // If a department or category is selected via URL, we might want to query for those specifically.
  // We can pass them as a combined string to `useProducts` or just fetch all and filter client-side.
  // Since the user is asking to "filter dynamically based on these parameters", let's combine them into a query.
  // e.g. "department category" or just filter on client side.
  // The useProducts hook uses fetchActiveProducts with "terms".
  const queryParts = [];
  if (departmentQuery) queryParts.push(departmentQuery.replace(/-/g, ' '));
  if (categoryQuery) {
    if (categoryQuery === 't-shirts') {
      queryParts.push('t-shirts');
    } else {
      queryParts.push(categoryQuery.replace(/-/g, ' '));
    }
  }
  const queryStr = queryParts.join(" ");

  const { data: products, isLoading, error } = useProducts(queryStr);

  const [selectedFilters, setSelectedFilters] = useState<FilterState>({});
  const [sortValue, setSortValue] = useState<string>("newest");

  const handleFilterChange = (categoryId: string, value: string, checked: boolean) => {
    setSelectedFilters((prev) => {
      const currentValues = prev[categoryId] || [];
      if (checked) {
        return { ...prev, [categoryId]: [...currentValues, value] };
      } else {
        return { ...prev, [categoryId]: currentValues.filter((v) => v !== value) };
      }
    });
  };

  const visible = products || [];

  return (
    <div className="min-h-screen bg-[hsl(var(--warm-bg))]">
      <div className="py-16 px-6 text-center w-full flex flex-col md:flex-row items-center justify-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-light text-foreground">Shop</h1>
          <p className="mt-3 text-sm text-muted-foreground">
            {departmentQuery || categoryQuery
              ? `${(departmentQuery || '').replace(/-/g, ' ')} ${(categoryQuery || '').replace(/-/g, ' ')}`.trim().toUpperCase()
              : 'Socks, underwear, undershirts, loungewear and shorts'
            }
          </p>
        </div>
        {/* Top Header Image Placeholder */}
        <div className="w-full max-w-[300px] h-[120px] bg-muted border border-border rounded-lg flex items-center justify-center shrink-0">
          <span className="text-muted-foreground text-sm">Promo Banner Placeholder</span>
        </div>
      </div>

      <div className="w-full px-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 mt-6 md:mt-12">

          {/* Far Left Vertical Image Placeholder (Desktop only) */}
          <div className="hidden xl:block w-48 shrink-0">
            <div className="sticky top-24 h-[600px] bg-muted border border-border rounded-lg flex items-center justify-center">
              <span className="text-muted-foreground text-sm text-center px-4">Vertical Ad<br/>Placeholder</span>
            </div>
          </div>

          {/* Mobile Filter Toggle & Sort */}
          <div className="flex lg:hidden justify-between items-center w-full mb-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  Filter
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">Filters</SheetTitle>
                </SheetHeader>
                <div className="mt-6">
                  <ShopFilters
                    selectedFilters={selectedFilters}
                    onFilterChange={handleFilterChange}
                    department={departmentQuery}
                    category={categoryQuery}
                  />
                </div>
              </SheetContent>
            </Sheet>

            <ShopSort value={sortValue} onValueChange={setSortValue} />
          </div>

          {/* Desktop Sidebar */}
          <div className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 bg-card border-x border-y border-border rounded-lg p-5 shadow-sm">
              <h2 className="text-lg font-semibold mb-4">Filters</h2>
              <ShopFilters
                selectedFilters={selectedFilters}
                onFilterChange={handleFilterChange}
                department={departmentQuery}
                category={categoryQuery}
              />
            </div>
          </div>

          {/* Main Product Area */}
          <div className="flex-1">
            <div className="hidden lg:flex justify-end mb-6">
              <ShopSort value={sortValue} onValueChange={setSortValue} />
            </div>

            {isLoading ? (
              <div className="flex justify-center py-24">
                <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
              </div>
            ) : error ? (
              <p className="text-center text-sm text-muted-foreground py-24">
                Products could not be loaded right now. Please try again.
              </p>
            ) : visible.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-24">No products found</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {visible.map((product) => (
                  <ProductCard key={product.node.id} product={product} />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
