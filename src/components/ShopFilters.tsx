import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

const FILTER_CATEGORIES = [
  {
    id: "type",
    title: "Type",
    options: [
      { value: "جوراب ساقدار", label: "جوراب ساقدار" },
      { value: "جوراب نیم ساق", label: "جوراب نیم ساق" },
      { value: "جوراب مچی", label: "جوراب مچی" },
      { value: "جوراب کالج", label: "جوراب کالج" },
      { value: "جوراب ورزشی", label: "جوراب ورزشی" },
      { value: "جوراب مجلسی", label: "جوراب مجلسی" },
      { value: "جوراب دیابتی", label: "جوراب دیابتی" },
      { value: "جوراب نخی", label: "جوراب نخی" },
      { value: "جوراب نانو", label: "جوراب نانو" },
      { value: "جوراب بامبو گیاهی", label: "جوراب بامبو گیاهی" },
    ],
  },
  {
    id: "brand",
    title: "Brand",
    options: Array.from({ length: 10 }).map((_, i) => ({
      value: `Brand ${i + 1}`,
      label: `Brand ${i + 1}`,
    })),
  },
  {
    id: "pattern",
    title: "Pattern/Color",
    options: [
      { value: "رنگی", label: "رنگی (Colored)" },
      { value: "طرح‌دار", label: "طرح‌دار (Patterned)" },
      { value: "ساده", label: "ساده (Plain)" },
    ],
  },
  {
    id: "size",
    title: "Size",
    options: [
      { value: "فری سایز", label: "فری سایز (Free Size)" },
    ],
  },
];

export type FilterState = Record<string, string[]>;

interface ShopFiltersProps {
  selectedFilters: FilterState;
  onFilterChange: (categoryId: string, value: string, checked: boolean) => void;
  className?: string;
}

export function ShopFilters({
  selectedFilters,
  onFilterChange,
  className,
}: ShopFiltersProps) {
  return (
    <div className={className}>
      <Accordion type="multiple" defaultValue={["type", "brand", "pattern", "size"]} className="w-full">
        {FILTER_CATEGORIES.map((category) => (
          <AccordionItem key={category.id} value={category.id}>
            <AccordionTrigger className="text-base font-semibold">
              {category.title}
            </AccordionTrigger>
            <AccordionContent>
              <div className="flex flex-col space-y-3 pt-1">
                {category.options.map((option) => (
                  <div key={option.value} className="flex items-center space-x-3 space-x-reverse text-right" dir="rtl">
                    <Checkbox
                      id={`filter-${category.id}-${option.value}`}
                      checked={selectedFilters[category.id]?.includes(option.value) || false}
                      onCheckedChange={(checked) =>
                        onFilterChange(category.id, option.value, checked as boolean)
                      }
                    />
                    <Label
                      htmlFor={`filter-${category.id}-${option.value}`}
                      className="text-sm font-normal cursor-pointer pr-2"
                    >
                      {option.label}
                    </Label>
                  </div>
                ))}
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
