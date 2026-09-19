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
import FadeIn from "@/components/FadeIn";
import { getCollection } from "@/data/collections";
import { getCollectionImage } from "@/data/collectionImages";
import SEO from "@/components/SEO";

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
    visible = visible.filter(p => p.node.brand?.some(b => selectedFilters.brand.includes(b)));
  }
  if (selectedFilters.pattern && selectedFilters.pattern.length > 0) {
    visible = visible.filter(p => selectedFilters.pattern.includes(p.node.pattern));
  }
  if (selectedFilters.size && selectedFilters.size.length > 0) {
    visible = visible.filter(p => p.node.sizes?.some(s => selectedFilters.size.includes(s)));
  }

  // Apply sorting after filtering
  visible = [...visible].sort((a, b) => {
    if (sortValue === "newest") {
      return new Date(b.node.createdAt).getTime() - new Date(a.node.createdAt).getTime();
    } else if (sortValue === "price-asc") {
      return parseFloat(a.node.priceRange.minVariantPrice.amount) - parseFloat(b.node.priceRange.minVariantPrice.amount);
    } else if (sortValue === "price-desc") {
      return parseFloat(b.node.priceRange.minVariantPrice.amount) - parseFloat(a.node.priceRange.minVariantPrice.amount);
    }
    return 0;
  });

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

  const categoryDescriptions: Record<string, string> = {
    socks: "جوراب‌های {dept} با کیفیت بالا، از الیاف نرم و بادوام، مناسب استفاده روزمره.",
    underwear: "لباس‌های زیر {dept} با پارچه‌ای نرم و راحت، طراحی‌شده برای آسایش تمام روز.",
    undershirts: "زیرپوش‌های {dept}، سبک و تنفس‌پذیر، لایه‌ی اول ایده‌آل زیر لباس.",
    pants: "شلوارهای {dept} با برش راحت و پارچه‌ی باکیفیت، مناسب استفاده روزانه.",
    shorts: "شلوارک‌های {dept}، سبک و آزاد، انتخابی مناسب برای فعالیت و راحتی.",
    "t-shirts": "تیشرت‌های {dept} با طرح‌های ساده و پارچه‌ی نخی باکیفیت.",
    "tank-tops": "تاپ‌های {dept}، سبک و خنک، مناسب فصل گرم.",
    sets: "ست‌های کامل {dept}، ترکیبی هماهنگ برای یک انتخاب راحت.",
  };

  const collection = categoryQuery ? getCollection(categoryQuery) : undefined;

  const dynamicTitle = departmentQuery || categoryQuery
    ? `${categoryQuery ? categoryNames[categoryQuery] || categoryQuery : ""} ${departmentQuery ? departmentNames[departmentQuery] || departmentQuery : ""}`.trim()
    : "فروشگاه";

  const dynamicDesc = departmentQuery || categoryQuery
    ? `خرید ${categoryQuery ? categoryNames[categoryQuery] || categoryQuery : "محصولات"} ${departmentQuery ? departmentNames[departmentQuery] || departmentQuery : ""} با بهترین کیفیت از جامی مد.`.trim()
    : "مشاهده تمام محصولات جامی مد";

  return (
    <div className="min-h-screen bg-[hsl(var(--warm-bg))] relative z-0">
      <SEO title={dynamicTitle} description={dynamicDesc} />
      {/* Header Section */}
      <div className="py-16 px-6 text-center w-full flex flex-col md:flex-row items-center justify-center md:justify-between gap-6">
<div className="w-full flex flex-col justify-center items-center py-4">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-foreground text-center">
              {departmentQuery || categoryQuery
                ? `${categoryQuery ? categoryNames[categoryQuery] || categoryQuery : ""} ${departmentQuery ? departmentNames[departmentQuery] || departmentQuery : ""}`.trim()
                : "جوراب، لباس زیر، زیرپوش، لباس راحتی و شلوارک"}
            </h1>
            {departmentQuery && categoryQuery && categoryDescriptions[categoryQuery] && (
              <p className="max-w-2xl mx-auto mt-4 text-base text-muted-foreground text-center">
                {categoryDescriptions[categoryQuery].replace("{dept}", departmentNames[departmentQuery] || "")}
              </p>
            )}
          </div>
        {/* Top Header Image Placeholder */}
{/* Top Promo Images */}
<div className="flex gap-4 shrink-0">
  {/* بنر بالای صفحه - عکس اول */}
  <a href="#" className="block w-[380px] h-[380px] overflow-hidden rounded-2xl hover:opacity-90 transition-opacity shadow-sm">
    <img 
src={getCollectionImage(departmentQuery, categoryQuery) || "/socks_clipcart.jpg"}
loading="lazy"
width={380}
height={380}
onError={(e) => {
  const fallback = collection?.image || "/socks_clipcart.jpg";
  if (e.currentTarget.src !== fallback) {
    e.currentTarget.src = fallback;
  }
}}
      alt={categoryQuery ? (categoryNames[categoryQuery] || categoryQuery) : "دسته‌بندی"}
      className="w-full h-full object-cover"
    />
  </a>
</div>

      
      </div>

      {/* Main Content Layout */}
      <div className="w-full px-6 pb-24">
        <div className="flex flex-col lg:flex-row gap-8 mt-6 md:mt-12">



          {/* Mobile Filter Toggle & Sort */}
          <div className="flex lg:hidden justify-between items-center w-full mb-6">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="flex items-center gap-2">
                  <SlidersHorizontal className="h-4 w-4" />
                  فیلتر
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[300px] sm:w-[400px] overflow-y-auto">
                <SheetHeader>
                  <SheetTitle className="text-right">فیلتر</SheetTitle>
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
            <div className="sticky top-24 bg-card border-x border-y border-border rounded-2xl p-5 shadow-sm">
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
                در حال حاضر امکان بارگذاری محصولات وجود ندارد. لطفاً دوباره تلاش کنید.
              </p>
            ) : visible.length === 0 ? (
              <p className="text-center text-sm text-muted-foreground py-24">محصولی یافت نشد</p>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-x-6 gap-y-10">
                {visible.map((product, index) => (
                  <FadeIn key={product.node.id} delay={(index % 10) * 50}>
                    <ProductCard product={product} />
                  </FadeIn>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}