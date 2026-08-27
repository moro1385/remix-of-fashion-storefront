import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";
import { ProductVariantsManager } from "./ProductVariantsManager";
import { ProductImagesManager } from "./ProductImagesManager";
import { fetchCategories } from "@/services/products";
import { X } from "lucide-react";

type Product = Database["public"]["Tables"]["products"]["Row"];
type Category = { id: string; name: string; slug: string };

const productSchema = z.object({
  name: z.string().min(1, "Name is required"),
  slug: z.string().min(1, "Slug is required"),
  description: z.string().optional().nullable(),
  price: z.coerce.number().min(0, "Price must be positive"),
  is_active: z.boolean().default(true),
  is_featured: z.boolean().default(false),
  category_id: z.string().optional().nullable(),
  tags: z.array(z.string()).default([]),

  department: z.string().optional().nullable(),
  category: z.string().optional().nullable(),
  type: z.string().optional().nullable(),
  brand: z.string().optional().nullable(),
  pattern: z.string().optional().nullable(),
  sizes: z.array(z.string()).default([]),

});

type ProductFormValues = z.infer<typeof productSchema>;

interface ProductFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
  onSuccess: () => void;
}

export function ProductFormDialog({ open, onOpenChange, product, onSuccess }: ProductFormDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [tagInput, setTagInput] = useState("");

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: "",
      slug: "",
      description: "",
      price: 0,
      is_active: true,
      is_featured: false,
      category_id: null,
      tags: [],

      department: null,
      category: null,
      type: null,
      brand: null,
      pattern: null,
      sizes: [],

    },
  });

  const department = form.watch("department");
  const category = form.watch("category");

  const [typeOptions, setTypeOptions] = useState<{ value: string; label: string }[]>([]);
  const [brandOptions, setBrandOptions] = useState<{ value: string; label: string }[]>([]);
  const [patternOptions, setPatternOptions] = useState<{ value: string; label: string }[]>([]);
  const [sizeOptions, setSizeOptions] = useState<{ value: string; label: string }[]>([]);

  useEffect(() => {
    let tOptions: { value: string; label: string }[] = [];
    let sOptions: { value: string; label: string }[] = [
      { value: "S", label: "S" },
      { value: "M", label: "M" },
      { value: "L", label: "L" },
      { value: "XL", label: "XL" },
      { value: "2XL", label: "2XL" },
      { value: "3XL", label: "3XL" },
      { value: "4XL", label: "4XL" },
      { value: "5XL", label: "5XL" },
    ];
    let pOptions = [
      { value: "رنگی", label: "رنگی (Colored)" },
      { value: "طرح‌دار", label: "طرح‌دار (Patterned)" },
      { value: "ساده", label: "ساده (Plain)" },
    ];
    const bOptions = Array.from({ length: 10 }).map((_, i) => {
        let prefix = "Brand";
        if (category === "socks") prefix = "Socks Brand";
        else if (category === "underwear") prefix = "Underwear Brand";
        else if (category) prefix = `${category.charAt(0).toUpperCase() + category.slice(1)} Brand`;
        return {
          value: `${prefix} ${i + 1}`,
          label: `${prefix} ${i + 1}`,
        };
      });

    if (category === "underwear") {
      pOptions = [
        { value: "طرح‌دار", label: "طرح‌دار (Patterned)" },
        { value: "ساده", label: "ساده (Plain)" },
      ];
      if (department === "men") {
        tOptions = [
          { value: "شورت اسلیپ", label: "شورت اسلیپ" },
          { value: "شورت نیم پا", label: "شورت نیم پا" },
          { value: "شورت پادار", label: "شورت پادار" },
          { value: "شورت باکسر", label: "شورت باکسر" },
          { value: "شورت اسپورت", label: "شورت اسپورت" },
        ];
      } else if (department === "women") {
        tOptions = [{ value: "شورت اسلیپ", label: "شورت اسلیپ" }];
      } else if (department === "kids") {
        tOptions = [
          { value: "اسلیپ", label: "اسلیپ" },
          { value: "پادار", label: "پادار" },
        ];
      }
    } else if (category === "undershirts") {
      if (department === "men") {
        tOptions = [
          { value: "رکابی", label: "رکابی" },
          { value: "نیم آستین", label: "نیم آستین" },
          { value: "خشتی", label: "خشتی" },
          { value: "حلقه‌ای", label: "حلقه‌ای" },
          { value: "پشت قهرمانی", label: "پشت قهرمانی" },
        ];
      } else if (department === "women") {
        tOptions = [
          { value: "رکابی", label: "رکابی" },
          { value: "نیم تنه", label: "نیم تنه" },
        ];
      } else if (department === "kids") {
        tOptions = [
          { value: "زیرپوش", label: "زیرپوش" },
        ];
      }
    } else if (category === "pants") {
      if (department === "men") {
        tOptions = [
          { value: "شلوار ورزشی", label: "شلوار ورزشی" },
          { value: "شلوار ساده", label: "شلوار ساده" },
          { value: "شلوار اسلش", label: "شلوار اسلش" },
          { value: "شلوار دمپا کش", label: "شلوار دمپا کش" },
          { value: "شلوار آیرو", label: "شلوار آیرو" },
          { value: "شلوار نخی", label: "شلوار نخی" },
        ];
      } else if (department === "women") {
        tOptions = [
          { value: "شلوار ساده", label: "شلوار ساده" },
          { value: "شلوار ورزشی", label: "شلوار ورزشی" },
          { value: "شلوار نخی", label: "شلوار نخی" },
          { value: "ساق شلواری", label: "ساق شلواری" },
          { value: "شلوار آیرو", label: "شلوار آیرو" },
        ];
      }
    } else if (category === "shorts") {
      if (department === "men") {
        tOptions = [
          { value: "شلوارک کوتاه", label: "شلوارک کوتاه" },
          { value: "شلوارک بلند", label: "شلوارک بلند" },
          { value: "شلوارک ساده", label: "شلوارک ساده" },
          { value: "شلوارک ورزشی", label: "شلوارک ورزشی" },
        ];
      } else if (department === "women") {
        tOptions = [
          { value: "شلوارک کوتاه", label: "شلوارک کوتاه" },
          { value: "شلوارک بلند", label: "شلوارک بلند" },
          { value: "شلوارک ساده", label: "شلوارک ساده" },
          { value: "شلوارک ورزشی", label: "شلوارک ورزشی" },
          { value: "شورتک", label: "شورتک" },
        ];
      }
    } else if (category === "t-shirts") {
      if (department === "men" || department === "women") {
        tOptions = [
          { value: "تیشرت ساده", label: "تیشرت ساده" },
          { value: "تیشرت ورزشی", label: "تیشرت ورزشی" },
          { value: "تیشرت آیرو", label: "تیشرت آیرو" },
          { value: "تیشرت سوزنی", label: "تیشرت سوزنی" },
        ];
      }
    } else if (category === "tank-tops") {
      if (department === "men") {
        tOptions = [
          { value: "تاپ ساده", label: "تاپ ساده" },
          { value: "تاپ ورزشی", label: "تاپ ورزشی" },
          { value: "تاپ آیکو", label: "تاپ آیکو" },
          { value: "تاپ سوزنی", label: "تاپ سوزنی" },
        ];
      } else if (department === "women") {
        tOptions = [
          { value: "تاپ ساده", label: "تاپ ساده" },
          { value: "تاپ ورزشی", label: "تاپ ورزشی" },
          { value: "تاپ آیکو", label: "تاپ آیکو" },
          { value: "تاپ سوزنی", label: "تاپ سوزنی" },
          { value: "تاپ راه راه", label: "تاپ راه راه" },
        ];
      }
    } else if (category === "sets") {
      if (department === "men") {
        tOptions = [
          { value: "ست بلوز و شلوار", label: "ست بلوز و شلوار" },
          { value: "ست تیشرت و شلوار", label: "ست تیشرت و شلوار" },
          { value: "ست تیشرت و شلوارک", label: "ست تیشرت و شلوارک" },
          { value: "ست تاپ و شلوارک", label: "ست تاپ و شلوارک" },
          { value: "ست زیر پوش و شورت", label: "ست زیر پوش و شورت" },
        ];
      } else if (department === "women") {
        tOptions = [
          { value: "ست بلوز و شلوار", label: "ست بلوز و شلوار" },
          { value: "ست تیشرت و شلوارک", label: "ست تیشرت و شلوارک" },
          { value: "ست تاپ و شلوارک", label: "ست تاپ و شلوارک" },
        ];
      }
    } else if (category === "socks") {
      sOptions = [{ value: "فری سایز", label: "فری سایز (Free Size)" }];
      tOptions = [
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
      ];
    }

    setTypeOptions(tOptions);
    setSizeOptions(sOptions);
    setPatternOptions(pOptions);
    setBrandOptions(bOptions);

    if (category === "socks") {
        form.setValue("sizes", ["فری سایز"]);
    } else {
        const currentSizes = form.getValues("sizes") || [];
        if (currentSizes.includes("فری سایز")) {
            form.setValue("sizes", []);
        }
    }
  }, [department, category, form]);


  useEffect(() => {
    async function loadCategories() {
      try {
        const data = await fetchCategories();
        setCategories(data);
      } catch (err) {
        console.error("Failed to load categories:", err);
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    if (product) {
      form.reset({
        name: product.name,
        slug: product.slug,
        description: product.description || "",
        price: product.price,
        is_active: product.is_active,
        is_featured: product.is_featured,
        category_id: product.category_id,
        tags: product.tags || [],

        department: product.department || null,
        category: product.category || null,
        type: product.type || null,
        brand: product.brand || null,
        pattern: product.pattern || null,
        sizes: product.sizes || [],

      });
    } else {
      form.reset({
        name: "",
        slug: "",
        description: "",
        price: 0,
        is_active: true,
        is_featured: false,
        category_id: null,
        tags: [],

        department: null,
        category: null,
        type: null,
        brand: null,
        pattern: null,
        sizes: [],

      });
    }
    setTagInput("");
  }, [product, form]);

  const handleAddTag = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const newTag = tagInput.trim();
      if (newTag) {
        const currentTags = form.getValues("tags") || [];
        if (!currentTags.includes(newTag)) {
          form.setValue("tags", [...currentTags, newTag]);
        }
        setTagInput("");
      }
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    const currentTags = form.getValues("tags") || [];
    form.setValue("tags", currentTags.filter((tag) => tag !== tagToRemove));
  };

  async function onSubmit(values: ProductFormValues) {
    setIsSubmitting(true);
    try {
      if (product) {
        const { error } = await supabase
          .from("products")
          .update(values)
          .eq("id", product.id);

        if (error) throw error;
        toast.success("Product updated successfully");
      } else {
        const { error } = await supabase
          .from("products")
          .insert([values]);

        if (error) throw error;
        toast.success("Product created successfully");
      }

      onSuccess();
      onOpenChange(false);
    } catch (error: unknown) {
      console.error("Error saving product:", error);
      toast.error(error.message || "Failed to save product");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add Product"}</DialogTitle>
          <DialogDescription>
            {product ? "Make changes to the product here." : "Add a new product to your store."}
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug</FormLabel>
                  <FormControl>
                    <Input placeholder="product-slug" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />


            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="department"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Department</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === "null" ? null : val)} value={field.value || "null"}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select department" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">None</SelectItem>
                        <SelectItem value="men">Men</SelectItem>
                        <SelectItem value="women">Women</SelectItem>
                        <SelectItem value="kids">Kids</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={(val) => field.onChange(val === "null" ? null : val)} value={field.value || "null"}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">None</SelectItem>
                        <SelectItem value="socks">Socks</SelectItem>
                        <SelectItem value="underwear">Underwear</SelectItem>
                        <SelectItem value="undershirts">Undershirts</SelectItem>
                        <SelectItem value="pants">Pants</SelectItem>
                        <SelectItem value="shorts">Shorts</SelectItem>
                        <SelectItem value="t-shirts">T-Shirts</SelectItem>
                        <SelectItem value="tank-tops">Tank Tops</SelectItem>
                        <SelectItem value="sets">Sets</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {department && category && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="type"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Type</FormLabel>
                      <Select onValueChange={(val) => field.onChange(val === "null" ? null : val)} value={field.value || "null"}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select type" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">None</SelectItem>
                          {typeOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="brand"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Brand</FormLabel>
                      <Select onValueChange={(val) => field.onChange(val === "null" ? null : val)} value={field.value || "null"}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select brand" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">None</SelectItem>
                          {brandOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {department && category && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="pattern"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Pattern/Color</FormLabel>
                      <Select onValueChange={(val) => field.onChange(val === "null" ? null : val)} value={field.value || "null"}>
                        <FormControl>
                          <SelectTrigger><SelectValue placeholder="Select pattern" /></SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="null">None</SelectItem>
                          {patternOptions.map(opt => (
                            <SelectItem key={opt.value} value={opt.value}>{opt.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="sizes"
                  render={() => (
                    <FormItem>
                      <div className="mb-4">
                        <FormLabel>Sizes</FormLabel>
                      </div>
                      <div className="flex flex-wrap gap-4">
                        {sizeOptions.map((item) => (
                          <FormField
                            key={item.value}
                            control={form.control}
                            name="sizes"
                            render={({ field }) => {
                              return (
                                <FormItem
                                  key={item.value}
                                  className="flex flex-row items-start space-x-3 space-y-0"
                                >
                                  <FormControl>
                                    <Checkbox
                                      checked={field.value?.includes(item.value)}
                                      disabled={category === "socks"}
                                      onCheckedChange={(checked) => {
                                        return checked
                                          ? field.onChange([...field.value, item.value])
                                          : field.onChange(
                                              field.value?.filter(
                                                (value) => value !== item.value
                                              )
                                            )
                                      }}
                                    />
                                  </FormControl>
                                  <FormLabel className="font-normal">
                                    {item.label}
                                  </FormLabel>
                                </FormItem>
                              )
                            }}
                          />
                        ))}
                      </div>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <div className="flex gap-4">
              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Price</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="category_id"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormLabel>Category</FormLabel>
                    <Select
                      onValueChange={(val) => field.onChange(val === "null" ? null : val)}
                      value={field.value || "null"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="null">None</SelectItem>
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Product description"
                      className="resize-none"
                      {...field}
                      value={field.value || ""}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="tags"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tags</FormLabel>
                  <FormControl>
                    <div className="space-y-2">
                      <Input
                        placeholder="Add tags (press Enter)"
                        value={tagInput}
                        onChange={(e) => setTagInput(e.target.value)}
                        onKeyDown={handleAddTag}
                      />
                      {field.value && field.value.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {field.value.map((tag) => (
                            <Badge key={tag} variant="secondary" className="flex items-center gap-1">
                              {tag}
                              <button
                                type="button"
                                onClick={() => handleRemoveTag(tag)}
                                className="text-muted-foreground hover:text-foreground"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-6 pt-2">
              <FormField
                control={form.control}
                name="is_active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Active</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 w-full">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Featured</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter className="pt-4">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Saving..." : "Save Product"}
              </Button>
            </DialogFooter>
          </form>
        </Form>

        {product && (
          <div className="mt-8 space-y-8 border-t pt-4">
             <ProductImagesManager productId={product.id} />
             <ProductVariantsManager productId={product.id} />
          </div>
        )}

        {!product && (
          <div className="mt-4 pt-4 text-sm text-muted-foreground text-center border-t">
            Save the product first to manage images and variants.
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
