"use server";

import { createClient } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

type ImageActionResult = {
  data?: { url: string; featured_image?: string; gallery_images?: string[] };
  error?: string;
};

const BUCKET = "product-images";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB

/**
 * Upload product image to storage and optionally update product's featured_image / gallery_images
 */
export async function uploadProductImage(
  formData: FormData
): Promise<ImageActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const file = formData.get("file") as File | null;
  const productId = formData.get("productId") as string;
  const setAsFeatured = formData.get("isPrimary") === "true";

  if (!file || !productId) return { error: "Missing file or product ID" };

  const supabase = await createClient();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 1200, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const timestamp = Date.now();
    const ext = "webp";
    const mainFilename = `${productId}/featured-${timestamp}.${ext}`;
    const galleryFilename = `${productId}/gallery-${timestamp}.${ext}`;
    const filename = setAsFeatured ? mainFilename : galleryFilename;

    const { error: uploadError } = await supabase.storage
      .from(BUCKET)
      .upload(filename, optimizedBuffer, {
        contentType: "image/webp",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(BUCKET).getPublicUrl(filename);
    const url = urlData.publicUrl;

    // Update product: set featured_image and/or append to gallery_images
    const { data: product } = await supabase
      .from("products")
      .select("featured_image, gallery_images")
      .eq("id", productId)
      .single();

    const currentGallery = (product?.gallery_images ?? []).filter(Boolean);
    const newGallery = setAsFeatured ? [url, ...currentGallery] : [...currentGallery, url];
    const featured_image = setAsFeatured ? url : (product?.featured_image ?? url);

    const { error: updateError } = await supabase
      .from("products")
      .update({
        featured_image: featured_image || null,
        gallery_images: newGallery.length ? newGallery : null,
      })
      .eq("id", productId);

    if (updateError) throw updateError;

    revalidatePath(`/dashboard/products/${productId}`);
    return { data: { url, featured_image, gallery_images: newGallery } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload image";
    console.error("Upload error:", err);
    return { error: message };
  }
}

/**
 * Set product's featured image by URL (must already be in gallery or featured)
 */
export async function setProductFeaturedImage(
  productId: string,
  imageUrl: string
): Promise<ImageActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();

  try {
    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("featured_image, gallery_images")
      .eq("id", productId)
      .single();

    if (fetchError || !product) return { error: "Product not found" };

    const gallery = (product.gallery_images ?? []).filter(Boolean);
    if (!gallery.includes(imageUrl) && product.featured_image !== imageUrl) {
      return { error: "Image not found for this product" };
    }

    const newGallery = [imageUrl, ...gallery.filter((u) => u !== imageUrl)];

    const { error: updateError } = await supabase
      .from("products")
      .update({
        featured_image: imageUrl,
        gallery_images: newGallery.length ? newGallery : [imageUrl],
      })
      .eq("id", productId);

    if (updateError) throw updateError;

    revalidatePath(`/dashboard/products/${productId}`);
    return { data: { url: imageUrl, featured_image: imageUrl, gallery_images: newGallery } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to set primary image";
    return { error: message };
  }
}

/**
 * Delete product image by URL: remove from storage and from product's featured_image / gallery_images
 */
export async function deleteProductImage(
  productId: string,
  imageUrl: string
): Promise<ImageActionResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();

  try {
    // Parse storage path from URL (e.g. .../object/public/product-images/productId/filename)
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(new RegExp(`${BUCKET}/(.+)`));
    const filePath = pathMatch ? pathMatch[1] : null;

    if (filePath) {
      await supabase.storage.from(BUCKET).remove([filePath]);
    }

    const { data: product, error: fetchError } = await supabase
      .from("products")
      .select("featured_image, gallery_images")
      .eq("id", productId)
      .single();

    if (fetchError || !product) return { error: "Product not found" };

    const gallery = (product.gallery_images ?? []).filter((u) => u !== imageUrl);
    const wasFeatured = product.featured_image === imageUrl;
    const newFeatured = wasFeatured ? (gallery[0] ?? null) : product.featured_image;
    const newGallery = gallery;

    const { error: updateError } = await supabase
      .from("products")
      .update({
        featured_image: newFeatured,
        gallery_images: newGallery.length ? newGallery : null,
      })
      .eq("id", productId);

    if (updateError) throw updateError;

    revalidatePath(`/dashboard/products/${productId}`);
    return {
      data: {
        url: imageUrl,
        featured_image: newFeatured ?? undefined,
        gallery_images: newGallery,
      },
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete image";
    return { error: message };
  }
}
