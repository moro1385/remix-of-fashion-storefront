const fs = require('fs');
const filepath = 'src/components/admin/ProductFormDialog.tsx';
let content = fs.readFileSync(filepath, 'utf8');

// Update Schema
const search_schema = `is_featured: z.boolean().default(false),`;
const replace_schema = `is_featured: z.boolean().default(false),\n  is_new: z.boolean().default(false),`;
content = content.replace(search_schema, replace_schema);

// Update Default Values
const search_default_1 = `is_featured: false,`;
const replace_default_1 = `is_featured: false,\n      is_new: false,`;
content = content.replace(search_default_1, replace_default_1);

const search_default_2 = `is_featured: product.is_featured,`;
const replace_default_2 = `is_featured: product.is_featured,\n        is_new: product.is_new,`;
content = content.replace(search_default_2, replace_default_2);

const search_default_3 = `is_featured: false,`; // Need to replace the second match (actually the third match in file)
const parts = content.split(`is_featured: false,`);
if (parts.length > 2) {
    content = parts[0] + `is_featured: false,` + parts[1] + `is_featured: false,\n        is_new: false,` + parts.slice(2).join(`is_featured: false,`);
}

// Update Render
const search_render = `<FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>محصول ویژه</FormLabel>
                      <FormDescription>این محصول در بخش‌های ویژه نمایش داده می‌شود.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />`;

const replace_render = `<FormField
                control={form.control}
                name="is_featured"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>ویژه</FormLabel>
                      <FormDescription>این محصول در بخش‌های ویژه نمایش داده می‌شود.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="is_new"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>جدیدترین</FormLabel>
                      <FormDescription>این محصول به عنوان محصول جدید نمایش داده می‌شود.</FormDescription>
                    </div>
                    <FormControl>
                      <Switch checked={field.value} onCheckedChange={field.onChange} />
                    </FormControl>
                  </FormItem>
                )}
              />`;

content = content.replace(search_render, replace_render);

fs.writeFileSync(filepath, content);
console.log("Product form updated");
