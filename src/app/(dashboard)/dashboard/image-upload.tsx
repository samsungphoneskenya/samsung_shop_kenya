"use client";

import { useState, useRef } from "react";
import {
  uploadProductImage,
  deleteProductImage,
} from "@/lib/actions/image-actions";
import Image from "next/image";
import { Database } from "@/types/database.types";

type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];

type ImageUploadProps = {
  productId: string;
  existingImages: ProductImage[];
};

export function ImageUpload({ productId, existingImages }: ImageUploadProps) {
  const [images, setImages] = useState<ProductImage[]>(existingImages);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    // Validate files
    const validFiles = Array.from(files).filter((file) => {
      // Check file type
      if (!file.type.startsWith("image/")) {
        setError("Only image files are allowed");
        return false;
      }

      // Check file size (max 5MB)
      if (file.size > 5 * 1024 * 1024) {
        setError("Image size must be less than 5MB");
        return false;
      }

      return true;
    });

    if (validFiles.length === 0) return;

    setUploading(true);
    setError(null);

    try {
      for (const file of validFiles) {
        const formData = new FormData();
        formData.append("file", file);
        formData.append("productId", productId);
        formData.append("position", images.length.toString());
        formData.append("isPrimary", images.length === 0 ? "true" : "false");

        const result = await uploadProductImage(formData);

        if (result.error) {
          setError(result.error);
        } else if (result.data) {
          setImages((prev) => [...prev, result.data!]);
        }
      }
    } catch (err) {
      setError("Failed to upload images");
      console.error(err);
    } finally {
      setUploading(false);
    }
  };

  const handleDelete = async (imageId: string) => {
    if (!confirm("Are you sure you want to delete this image?")) return;

    try {
      await deleteProductImage(imageId);
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch (err) {
      setError("Failed to delete image");
      console.error(err);
    }
  };

  const handleSetPrimary = async (imageId: string) => {
    try {
      const formData = new FormData();
      formData.append("imageId", imageId);
      formData.append("productId", productId);

      const result = await uploadProductImage(formData);

      if (result.error) {
        setError(result.error);
      } else {
        // Update local state
        setImages((prev) =>
          prev.map((img) => ({
            ...img,
            is_primary: img.id === imageId,
          }))
        );
      }
    } catch (err) {
      setError("Failed to update primary image");
      console.error(err);
    }
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    handleFileSelect(e.dataTransfer.files);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center ${
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
          accept="image/*"
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

        <p className="mt-2 text-xs text-gray-500">PNG, JPG, GIF up to 5MB</p>
      </div>

      {/* Error Message */}
      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {/* Images Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {images.map((image) => (
            <div
              key={image.id}
              className="relative group rounded-lg border border-gray-200 overflow-hidden"
            >
              {/* Image */}
              <div className="aspect-square relative bg-gray-100">
                <Image
                  src={image.url}
                  alt={image.alt_text || "Product image"}
                  fill
                  className="object-cover"
                  sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                />
              </div>

              {/* Primary Badge */}
              {image.is_primary && (
                <div className="absolute top-2 left-2">
                  <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-600 text-white">
                    Primary
                  </span>
                </div>
              )}

              {/* Actions Overlay */}
              <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center opacity-0 group-hover:opacity-100">
                <div className="flex gap-2">
                  {!image.is_primary && (
                    <button
                      onClick={() => handleSetPrimary(image.id)}
                      className="px-3 py-1 bg-white text-gray-900 rounded-md text-sm font-medium hover:bg-gray-100"
                    >
                      Set Primary
                    </button>
                  )}
                  <button
                    onClick={() => handleDelete(image.id)}
                    className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
                  >
                    Delete
                  </button>
                </div>
              </div>

              {/* Alt Text */}
              {image.alt_text && (
                <div className="p-2 bg-white">
                  <p className="text-xs text-gray-600 truncate">
                    {image.alt_text}
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Upload Instructions */}
      {images.length === 0 && !uploading && (
        <div className="text-center py-8">
          <p className="text-sm text-gray-500">
            No images yet. Upload your first product image above.
          </p>
        </div>
      )}
    </div>
  );
}
