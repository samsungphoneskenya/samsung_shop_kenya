"use client";

import { useState, useRef, useMemo } from "react";
import {
  uploadProductImage,
  deleteProductImage,
  setProductFeaturedImage,
} from "@/lib/actions/image-actions";
import { useRouter } from "next/navigation";
import { SafeImage } from "@/components/shared/SafeImage";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB

type ImageUploadProps = {
  productId: string;
  featuredImage: string | null;
  galleryImages: string[];
};

/** Build ordered list: featured first, then other gallery (no duplicate) */
function orderedUrls(featured: string | null, gallery: string[]): string[] {
  const rest = gallery.filter((u) => u !== featured);
  return featured ? [featured, ...rest] : rest;
}

export function ImageUpload({
  productId,
  featuredImage,
  galleryImages,
}: ImageUploadProps) {
  const router = useRouter();
  const urls = useMemo(
    () => orderedUrls(featuredImage, galleryImages),
    [featuredImage, galleryImages]
  );

  const [optimisticUrls, setOptimisticUrls] = useState<string[] | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrls = optimisticUrls ?? urls;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const validFiles = Array.from(files).filter((file) => {
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed (JPEG, PNG, GIF, WebP)");
        return false;
      }
      if (file.size > MAX_SIZE) {
        setError("Image size must be less than 5MB");
        return false;
      }
      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (let i = 0; i < validFiles.length; i++) {
        const file = validFiles[i];
        const formData = new FormData();
        formData.append("file", file);
        formData.append("productId", productId);
        formData.append("isPrimary", displayUrls.length === 0 && i === 0 ? "true" : "false");

        const result = await uploadProductImage(formData);

        if (result.error) {
          setError(result.error);
          break;
        }
        if (result.data?.url) {
          setOptimisticUrls((prev) => {
            const base = prev ?? displayUrls;
            const isFirst = base.length === 0 && i === 0;
            return isFirst
              ? [result.data!.url]
              : [...base, result.data!.url];
          });
        }
      }
      router.refresh();
    } catch (err) {
      setError("Failed to upload images");
      console.error(err);
    } finally {
      setUploading(false);
      setOptimisticUrls(null);
    }
  };

  const handleDelete = async (imageUrl: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    setError(null);
    setOptimisticUrls((prev) => {
      const base = prev ?? displayUrls;
      const next = base.filter((u) => u !== imageUrl);
      return next.length !== base.length ? next : null;
    });

    try {
      const result = await deleteProductImage(productId, imageUrl);
      if (result.error) {
        setError(result.error);
        setOptimisticUrls(null);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError("Failed to delete image");
      setOptimisticUrls(null);
      console.error(err);
    }
  };

  const handleSetPrimary = async (imageUrl: string) => {
    if (featuredImage === imageUrl) return;

    setError(null);
    setOptimisticUrls((prev) => {
      const base = prev ?? displayUrls;
      const rest = base.filter((u) => u !== imageUrl);
      return [imageUrl, ...rest];
    });

    try {
      const result = await setProductFeaturedImage(productId, imageUrl);
      if (result.error) {
        setError(result.error);
        setOptimisticUrls(null);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError("Failed to set primary image");
      setOptimisticUrls(null);
      console.error(err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          dragActive
            ? "border-blue-500 bg-blue-50"
            : "border-gray-300 hover:border-gray-400"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/gif,image/webp"
          onChange={(e) => handleFileSelect(e.target.files)}
          className="hidden"
        />
        <svg
          className="mx-auto h-12 w-12 text-gray-400"
          stroke="currentColor"
          fill="none"
          viewBox="0 0 48 48"
        >
          <path
            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
            strokeWidth={2}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="mt-4">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="text-blue-600 hover:text-blue-500 font-medium"
            disabled={uploading}
          >
            {uploading ? "Uploading..." : "Click to upload"}
          </button>
          <span className="text-gray-500"> or drag and drop</span>
        </div>
        <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF, WebP up to 5MB</p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {displayUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {displayUrls.map((url) => (
            <div
              key={url}
              className="relative group rounded-lg border border-gray-200 overflow-hidden bg-gray-100"
            >
              <div className="aspect-square relative">
                <SafeImage
                  src={url}
                  alt="Product"
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>
              {featuredImage === url && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                    Primary
                  </span>
                </div>
              )}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  {featuredImage !== url && (
                    <button
                      type="button"
                      onClick={() => handleSetPrimary(url)}
                      className="px-3 py-1 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => handleDelete(url)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {displayUrls.length === 0 && !uploading && (
        <p className="text-center py-6 text-sm text-gray-500">
          No images yet. Upload your first product image above.
        </p>
      )}
    </div>
  );
}
