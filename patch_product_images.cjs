const fs = require('fs');
const filepath = 'src/components/admin/ProductImagesManager.tsx';
let content = fs.readFileSync(filepath, 'utf8');

const search_db_fetch = `      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);`;

const replace_db_fetch = `      const { data, error } = await supabase
        .from("products")
        .select("images")
        .eq("id", productId)
        .single();

      if (error) throw error;

      const parsedImages = (data.images || []).map((url, i) => ({
        id: url,
        product_id: productId,
        image_url: url,
        sort_order: i,
        alt_text: null,
        created_at: new Date().toISOString(),
      }));
      setImages(parsedImages);`;

content = content.replace(search_db_fetch, replace_db_fetch);

const search_db_insert = `      // 3. Insert into Database
      const newSortOrder = images.length > 0 ? Math.max(...images.map(img => img.sort_order)) + 1 : 0;

      const { data: imgData, error: dbError } = await supabase
        .from("product_images")
        .insert({
          product_id: productId,
          image_url: publicUrl,
          sort_order: newSortOrder,
        })
        .select()
        .single();

      if (dbError) throw dbError;

      setImages([...images, imgData]);`;

const replace_db_insert = `      // 3. Insert into Database (Products table array)
      const currentImagesUrls = images.map(i => i.image_url);
      const newImagesUrls = [...currentImagesUrls, publicUrl];

      const { error: dbError } = await supabase
        .from("products")
        .update({ images: newImagesUrls })
        .eq("id", productId);

      if (dbError) throw dbError;

      const imgData = {
        id: publicUrl,
        product_id: productId,
        image_url: publicUrl,
        sort_order: images.length,
        alt_text: null,
        created_at: new Date().toISOString(),
      };
      setImages([...images, imgData]);`;

content = content.replace(search_db_insert, replace_db_insert);


const search_db_delete = `      // Delete from DB first
      const { error: dbError } = await supabase.from("product_images").delete().eq("id", id);
      if (dbError) throw dbError;

      setImages(images.filter((img) => img.id !== id));`;

const replace_db_delete = `      // Delete from DB first
      const currentImagesUrls = images.map(i => i.image_url);
      const newImagesUrls = currentImagesUrls.filter(url => url !== imageUrl);

      const { error: dbError } = await supabase
        .from("products")
        .update({ images: newImagesUrls })
        .eq("id", productId);

      if (dbError) throw dbError;

      setImages(images.filter((img) => img.image_url !== imageUrl));`;

content = content.replace(search_db_delete, replace_db_delete);

const search_input = `           <Input
             type="file"
             accept="image/*"
             id="image-upload"
             className="hidden"
             onChange={handleFileUpload}
             disabled={isUploading}
           />`;

const replace_input = `           <Input
             type="file"
             accept="image/*"
             id="image-upload"
             className="hidden"
             multiple
             onChange={handleMultipleFileUploads}
             disabled={isUploading}
           />`;
content = content.replace(search_input, replace_input);

const handleMultipleUploads = `  async function handleMultipleFileUploads(event: React.ChangeEvent<HTMLInputElement>) {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    try {
      const uploadedUrls: string[] = [];

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const fileExt = file.name.split('.').pop();
        const fileName = \`\${productId}-\${Math.random()}.\${fileExt}\`;

        const { error: uploadError } = await supabase.storage
          .from("product-images")
          .upload(fileName, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from("product-images")
          .getPublicUrl(fileName);

        uploadedUrls.push(publicUrl);
      }

      // 3. Insert into Database (Products table array)
      const currentImagesUrls = images.map(i => i.image_url);
      const newImagesUrls = [...currentImagesUrls, ...uploadedUrls];

      const { error: dbError } = await supabase
        .from("products")
        .update({ images: newImagesUrls })
        .eq("id", productId);

      if (dbError) throw dbError;

      const newImageObjects = uploadedUrls.map((url, i) => ({
        id: url,
        product_id: productId,
        image_url: url,
        sort_order: images.length + i,
        alt_text: null,
        created_at: new Date().toISOString(),
      }));

      setImages([...images, ...newImageObjects]);
      toast.success("Images uploaded successfully");
    } catch (err: any) {
      console.error("Error uploading image:", err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      event.target.value = '';
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {`;

content = content.replace(`  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {`, handleMultipleUploads);


fs.writeFileSync(filepath, content);
console.log("Images manager updated");
