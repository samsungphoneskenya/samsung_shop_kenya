"use client";

import { useState, useRef } from "react";
import {
  uploadCategoryImage,
  deleteCategoryImage,
} from "@/lib/actions/image-actions";
import { useRouter } from "next/navigation";
import { SafeImage } from "@/components/shared/SafeImage";

const MAX_SIZE = 3 * 1024 * 1024; // 3MB (matches storage policy)

type CategoryImageUploadProps = {
  categoryId: string;
  imageUrl: string | null;
};

export function CategoryImageUpload({
  categoryId,
  imageUrl,
}: CategoryImageUploadProps) {
  const router = useRouter();
  const [optimisticUrl, setOptimisticUrl] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const displayUrl = optimisticUrl ?? imageUrl;

  const handleFileSelect = async (files: FileList | null) => {
    if (!files || files.length === 0) return;

    const file = files[0];
    if (!file.type.startsWith("image/")) {
      setError("Only image files are allowed (JPEG, PNG, GIF, WebP)");
      return;
    }
    if (file.size > MAX_SIZE) {
      setError("Image size must be less than 3MB");
      return;
    }

    setUploading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("categoryId", categoryId);

      const result = await uploadCategoryImage(formData);

      if (result.error) {
        setError(result.error);
      } else if (result.data?.url) {
        setOptimisticUrl(result.data.url);
      }
      router.refresh();
    } catch (err) {
      setError("Failed to upload image");
      console.error(err);
    } finally {
      setUploading(false);
      setOptimisticUrl(null);
    }
  };

  const handleDelete = async () => {
    if (!displayUrl || !confirm("Remove this category image?")) return;

    setError(null);
    setOptimisticUrl("");

    try {
      const result = await deleteCategoryImage(categoryId, displayUrl);
      if (result.error) {
        setError(result.error);
      } else {
        router.refresh();
      }
    } catch (err) {
      setError("Failed to delete image");
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
        <p className="mt-2 text-xs text-gray-500">
          PNG, JPG, GIF, WebP up to 3MB. Used as category banner.
        </p>
      </div>

      {error && (
        <div className="rounded-md bg-red-50 p-4">
          <div className="text-sm text-red-800">{error}</div>
        </div>
      )}

      {displayUrl ? (
        <div className="relative group rounded-lg border border-gray-200 overflow-hidden bg-gray-100 max-w-md">
          <div className="aspect-video relative">
            <SafeImage
              src={displayUrl}
              alt="Category"
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 28rem"
            />
          </div>
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/50 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <button
              type="button"
              onClick={handleDelete}
              className="px-3 py-1 bg-red-600 text-white rounded-md text-sm font-medium hover:bg-red-700"
            >
              Remove image
            </button>
          </div>
        </div>
      ) : (
        !uploading && (
          <p className="text-center py-4 text-sm text-gray-500">
            No image yet. Upload a category image above.
          </p>
        )
      )}
    </div>
  );
}
