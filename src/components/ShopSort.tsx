import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export const SORT_OPTIONS = [
  { value: "newest", label: "جدیدترین" },
  { value: "price-asc", label: "ارزان‌ترین" },
  { value: "price-desc", label: "گران‌ترین" },
  { value: "popular", label: "محبوب‌ترین" },
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
        <SelectTrigger className="w-[200px] text-end">
          <SelectValue placeholder="مرتب‌سازی بر اساس..." />
        </SelectTrigger>
        <SelectContent>
          {SORT_OPTIONS.map((option) => (
            <SelectItem key={option.value} value={option.value} className="text-end">
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
}
