import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Trash2, Upload, Loader2, Image as ImageIcon } from "lucide-react";
import { toast } from "sonner";
import type { Database } from "@/integrations/supabase/types";

type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];

interface ProductImagesManagerProps {
  productId: string;
}

export function ProductImagesManager({ productId }: ProductImagesManagerProps) {
  const [images, setImages] = useState<ProductImage[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);

  useEffect(() => {
    fetchImages();
  }, [productId]);

  async function fetchImages() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from("product_images")
        .select("*")
        .eq("product_id", productId)
        .order("sort_order", { ascending: true });

      if (error) throw error;
      setImages(data || []);
    } catch (err: unknown) {
      console.error("Error fetching images:", err);
      toast.error(err.message || "Failed to load images");
    } finally {
      setIsLoading(false);
    }
  }

  async function handleFileUpload(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      // 1. Upload to Storage
      const fileExt = file.name.split('.').pop();
      const fileName = `${productId}-${Math.random()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from("product-images")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      // 2. Get Public URL
      const { data: { publicUrl } } = supabase.storage
        .from("product-images")
        .getPublicUrl(filePath);

      // 3. Insert into Database
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

      setImages([...images, imgData]);
      toast.success("Image uploaded successfully");
    } catch (err: unknown) {
      console.error("Error uploading image:", err);
      toast.error(err.message || "Failed to upload image");
    } finally {
      setIsUploading(false);
      // Reset input
      event.target.value = '';
    }
  }

  async function handleDeleteImage(id: string, imageUrl: string) {
    if (!window.confirm("Delete this image?")) return;

    try {
      // Delete from DB first
      const { error: dbError } = await supabase.from("product_images").delete().eq("id", id);
      if (dbError) throw dbError;

      setImages(images.filter((img) => img.id !== id));
      toast.success("Image deleted");

      // Attempt to delete from storage (extract filename from URL)
      try {
        const urlObj = new URL(imageUrl);
        const pathSegments = urlObj.pathname.split('/');
        const fileName = pathSegments[pathSegments.length - 1];
        if (fileName) {
           await supabase.storage.from("product-images").remove([fileName]);
        }
      } catch (e) {
        console.error("Failed to delete from storage", e);
      }

    } catch (err: unknown) {
      console.error("Error deleting image:", err);
      toast.error(err.message || "Failed to delete image");
    }
  }

  if (isLoading) {
    return (
      <div className="flex justify-center p-4">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Images</h3>
        <div>
           <Input
             type="file"
             accept="image/*"
             id="image-upload"
             className="hidden"
             onChange={handleFileUpload}
             disabled={isUploading}
           />
           <label htmlFor="image-upload">
             <Button variant="outline" size="sm" className="cursor-pointer" asChild disabled={isUploading}>
               <span>
                 {isUploading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Upload className="w-4 h-4 mr-2" />}
                 Upload Image
               </span>
             </Button>
           </label>
        </div>
      </div>

      {images.length === 0 ? (
        <div className="border border-dashed rounded-md p-8 text-center text-muted-foreground flex flex-col items-center justify-center">
          <ImageIcon className="w-8 h-8 mb-2 opacity-50" />
          No images uploaded yet.
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {images.map((img) => (
            <div key={img.id} className="relative group rounded-md overflow-hidden border">
              <img src={img.image_url} alt={img.alt_text || "Product image"} className="w-full aspect-square object-cover" />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                <Button
                  variant="destructive"
                  size="icon"
                  onClick={() => handleDeleteImage(img.id, img.image_url)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
