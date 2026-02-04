"use server";

import { createClient } from "@/lib/db/client";
import { getCurrentUser } from "@/lib/auth/session";
import { revalidatePath } from "next/cache";
import sharp from "sharp";

type ImageActionResult = {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  data?: any;
  error?: string;
};

/**
 * Upload and optimize product image
 */
export async function uploadProductImage(
  formData: FormData
): Promise<ImageActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  try {
    const file = formData.get("file") as File | null;
    const productId = formData.get("productId") as string;
    const imageId = formData.get("imageId") as string | null;

    // If imageId is provided, this is a "set primary" request
    if (imageId && !file) {
      // Set all images for this product to not primary
      await supabase
        .from("product_images")
        .update({ is_primary: false })
        .eq("product_id", productId);

      // Set the selected image as primary
      const { error } = await supabase
        .from("product_images")
        .update({ is_primary: true })
        .eq("id", imageId);

      if (error) throw error;

      revalidatePath(`/dashboard/products/${productId}`);
      return { data: { success: true } };
    }

    if (!file) {
      return { error: "No file provided" };
    }

    // Convert file to buffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Optimize image with sharp
    const optimizedBuffer = await sharp(buffer)
      .resize(1200, 1200, {
        fit: "inside",
        withoutEnlargement: true,
      })
      .jpeg({ quality: 85, progressive: true })
      .toBuffer();

    // Generate thumbnail
    const thumbnailBuffer = await sharp(buffer)
      .resize(400, 400, {
        fit: "cover",
      })
      .jpeg({ quality: 80 })
      .toBuffer();

    // Generate unique filename
    const timestamp = Date.now();
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, "_");
    const mainFilename = `${productId}/${timestamp}-${sanitizedName}`;
    const thumbFilename = `${productId}/${timestamp}-thumb-${sanitizedName}`;

    // Upload main image to Supabase Storage
    const { error: uploadError } = await supabase.storage
      .from("product-images")
      .upload(mainFilename, optimizedBuffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) throw uploadError;

    // Upload thumbnail
    await supabase.storage
      .from("product-images")
      .upload(thumbFilename, thumbnailBuffer, {
        contentType: "image/jpeg",
        cacheControl: "3600",
        upsert: false,
      });

    // Get public URL
    const { data: urlData } = supabase.storage
      .from("product-images")
      .getPublicUrl(mainFilename);

    // Save to database
    const position = parseInt(formData.get("position") as string) || 0;
    const isPrimary = formData.get("isPrimary") === "true";

    const { data: imageRecord, error: dbError } = await supabase
      .from("product_images")
      .insert({
        product_id: productId,
        url: urlData.publicUrl,
        alt_text: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        position,
        is_primary: isPrimary,
      })
      .select()
      .single();

    if (dbError) throw dbError;

    revalidatePath(`/dashboard/products/${productId}`);
    return { data: imageRecord };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    console.error("Upload error:", error);
    return { error: error.message || "Failed to upload image" };
  }
}

/**
 * Delete product image
 */
export async function deleteProductImage(imageId: string): Promise<void> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }

  const supabase = await createClient();

  // Get image info
  const { data: image, error: fetchError } = await supabase
    .from("product_images")
    .select("url, product_id")
    .eq("id", imageId)
    .single();

  if (fetchError) throw fetchError;

  // Extract filename from URL
  const url = new URL(image.url);
  const pathParts = url.pathname.split("/");
  const filename = pathParts[pathParts.length - 1];
  const productId = pathParts[pathParts.length - 2];
  const filePath = `${productId}/${filename}`;

  // Delete from storage
  await supabase.storage.from("product-images").remove([filePath]);

  // Try to delete thumbnail
  const thumbPath = filePath.replace(/(\d+-)/, "$1thumb-");
  await supabase.storage.from("product-images").remove([thumbPath]);

  // Delete from database
  const { error: deleteError } = await supabase
    .from("product_images")
    .delete()
    .eq("id", imageId);

  if (deleteError) throw deleteError;

  revalidatePath(`/dashboard/products/${image.product_id}`);
}

/**
 * Update image alt text
 */
export async function updateImageAltText(
  imageId: string,
  altText: string
): Promise<ImageActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  const { data, error } = await supabase
    .from("product_images")
    .update({ alt_text: altText })
    .eq("id", imageId)
    .select()
    .single();

  if (error) {
    return { error: error.message };
  }

  return { data };
}

/**
 * Reorder images
 */
export async function reorderImages(
  productId: string,
  imageIds: string[]
): Promise<ImageActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { error: "Unauthorized" };
  }

  const supabase = await createClient();

  try {
    // Update position for each image
    for (let i = 0; i < imageIds.length; i++) {
      await supabase
        .from("product_images")
        .update({ position: i })
        .eq("id", imageIds[i]);
    }

    revalidatePath(`/dashboard/products/${productId}`);
    return { data: { success: true } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
  } catch (error: any) {
    return { error: error.message };
  }
}
