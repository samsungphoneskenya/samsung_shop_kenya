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
const CATEGORY_BUCKET = "category-images";
const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const CATEGORY_MAX_SIZE = 3 * 1024 * 1024; // 3MB per migration

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

// --- Category image (single image_url) ---

type CategoryImageResult = { data?: { url: string }; error?: string };

/**
 * Upload category image to storage and set category.image_url
 */
export async function uploadCategoryImage(
  formData: FormData
): Promise<CategoryImageResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const file = formData.get("file") as File | null;
  const categoryId = formData.get("categoryId") as string;

  if (!file || !categoryId) return { error: "Missing file or category ID" };

  const supabase = await createClient();

  try {
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 600, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 85 })
      .toBuffer();

    const { data: cat } = await supabase
      .from("categories")
      .select("slug")
      .eq("id", categoryId)
      .single();

    const slug = cat?.slug ?? categoryId;
    const timestamp = Date.now();
    const filename = `${slug}-${timestamp}.webp`;

    const { error: uploadError } = await supabase.storage
      .from(CATEGORY_BUCKET)
      .upload(filename, optimizedBuffer, {
        contentType: "image/webp",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage
      .from(CATEGORY_BUCKET)
      .getPublicUrl(filename);
    const url = urlData.publicUrl;

    const { error: updateError } = await supabase
      .from("categories")
      .update({ image_url: url })
      .eq("id", categoryId);

    if (updateError) throw updateError;

    revalidatePath(`/dashboard/categories/${categoryId}`);
    revalidatePath("/dashboard/categories");
    return { data: { url } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to upload image";
    console.error("Category upload error:", err);
    return { error: message };
  }
}

/**
 * Delete category image: remove from storage and clear category.image_url
 */
export async function deleteCategoryImage(
  categoryId: string,
  imageUrl: string
): Promise<CategoryImageResult> {
  const user = await getCurrentUser();
  if (!user) return { error: "Unauthorized" };

  const supabase = await createClient();

  try {
    const url = new URL(imageUrl);
    const pathMatch = url.pathname.match(new RegExp(`${CATEGORY_BUCKET}/(.+)`));
    const filePath = pathMatch ? pathMatch[1] : null;

    if (filePath) {
      await supabase.storage.from(CATEGORY_BUCKET).remove([filePath]);
    }

    const { error } = await supabase
      .from("categories")
      .update({ image_url: null })
      .eq("id", categoryId);

    if (error) throw error;

    revalidatePath(`/dashboard/categories/${categoryId}`);
    revalidatePath("/dashboard/categories");
    return { data: { url: imageUrl } };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Failed to delete image";
    return { error: message };
  }
}
