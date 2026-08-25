import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SORT_OPTIONS = [
  { value: "newest", label: "Newest (جدیدترین)" },
  { value: "price-asc", label: "Price: Low to High (ارزان‌ترین)" },
  { value: "price-desc", label: "Price: High to Low (گران‌ترین)" },
  { value: "popular", label: "Most Popular (محبوب‌ترین)" },
];

interface ShopSortProps {
  value: string;
  onValueChange: (value: string) => void;
  className?: string;
}

export function ShopSort({ value, onValueChange, className }: ShopSortProps) {
  return (
    <div className={className}>
      <Select value={value} onValueChange={onValueChange} dir="rtl">
        <SelectTrigger className="w-[200px] text-right">
          <SelectValue placeholder="Sort by..." />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-right">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
