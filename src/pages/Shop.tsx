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
  const searchQuery = searchParams.get("query");

  const { data: products, isLoading, error } = useProducts({
    department: departmentQuery,
    category: categoryQuery,
    terms: searchQuery ? [searchQuery] : undefined
  });

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

  let visible = products || [];
  if (selectedFilters.type && selectedFilters.type.length > 0) {
    visible = visible.filter(p => p.node.type?.some(t => selectedFilters.type.includes(t)));
  }
  if (selectedFilters.brand && selectedFilters.brand.length > 0) {
    visible = visible.filter(p => selectedFilters.brand.includes(p.node.brand));
  }
  if (selectedFilters.pattern && selectedFilters.pattern.length > 0) {
    visible = visible.filter(p => selectedFilters.pattern.includes(p.node.pattern));
  }
  if (selectedFilters.size && selectedFilters.size.length > 0) {
    visible = visible.filter(p => p.node.sizes?.some(s => selectedFilters.size.includes(s)));
  }
  const categoryNames: Record<string, string> = {
    "socks": "جوراب",
    "underwear": "لباس زیر",
    "undershirts": "زیرپوش",
    "pants": "شلوار",
    "shorts": "شلوارک",
    "t-shirts": "تیشرت",
    "tank-tops": "تاپ",
    "sets": "ست",
  };

  const departmentNames: Record<string, string> = {
    "men": "مردانه",
    "women": "زنانه",
    "kids": "بچگانه",
  };

  return (
    <div className="min-h-screen bg-[hsl(var(--warm-bg))]">
      {/* Header Section */}
      <div className="py-16 px-6 text-center w-full flex flex-col md:flex-row items-center justify-center md:justify-between gap-6">
        <div>
          <h1 className="text-4xl md:text-5xl font-light text-foreground">خرید</h1>
            <p className="mt-3 text-sm text-muted-foreground">
            {departmentQuery || categoryQuery
              ? `${categoryQuery ? categoryNames[categoryQuery] || categoryQuery : ""} ${departmentQuery ? departmentNames[departmentQuery] || departmentQuery : ""}`.trim()
              : 'جوراب، لباس زیر، زیرپوش، لباس راحتی و شلوارک'
            }
           </p>
        </div>
        {/* Top Header Image Placeholder */}
{/* Top Promo Images */}
        <div className="flex gap-4 w-full md:max-w-[500px] lg:max-w-[600px] shrink-0">
          {/* بنر بالای صفحه - عکس اول */}
          <a href="#" className="flex-1 block overflow-hidden rounded-lg hover:opacity-90 transition-opacity shadow-sm">
            <img 
              src="/1.png" 
              alt="پیشنهاد ویژه ۱" 
              className="w-full h-[240px] object-cover"
            />
          </a>
          
          {/* بنر بالای صفحه - عکس دوم */}
          <a href="#" className="flex-1 block overflow-hidden rounded-lg hover:opacity-90 transition-opacity shadow-sm">
            <img 
              src="/4.png" 
              alt="پیشنهاد ویژه ۲" 
              className="w-full h-[240px] object-cover"
            />
          </a>
        </div>
      </div>

      {/* Main Content Layout */}
      <div className="w-full px-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 mt-6 md:mt-12">

          {/* Far Left Vertical Images (Desktop only) */}
          <div className="hidden xl:block w-64 shrink-0">
            <div className="sticky top-24 flex flex-col gap-4 w-full">
              {/* عکس اول */}
              <a href="#" className="w-full block overflow-hidden rounded-lg hover:opacity-90 transition-opacity shadow-sm">
                <img 
                  src="/3.png" 
                  alt="تبلیغ اول" 
                  className="w-full h-1000 object-cover"
                />
              </a>
              
              {/* عکس دوم */}
              <a href="#" className="w-full block overflow-hidden rounded-lg hover:opacity-90 transition-opacity shadow-sm">
                <img 
                  src="/2.png" 
                  alt="تبلیغ دوم" 
                  className="w-full h-auto object-cover"
                />
              </a>
            </div>
          </div>

          {/* Mobile Filter Toggle & Sort */}
          <div className="flex lg:hidden justify-between items-center w-full mb-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  فیلتر
                </Button>
              </SheetTrigger>
              <SheetContent side="left" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-left">فیلتر</SheetTitle>
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
              <h2 className="text-lg font-semibold mb-4">فیلتر</h2>
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