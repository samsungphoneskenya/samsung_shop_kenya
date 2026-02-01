"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useState, useEffect } from "react";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/actions/product-actions";
import { ImageUpload } from "@/app/(dashboard)/dashboard/image-upload";
import { Database } from "@/types/database.types";
import Link from "next/link";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type ProductImage = Database["public"]["Tables"]["product_images"]["Row"];
type SEOMetadata = Database["public"]["Tables"]["seo_metadata"]["Row"];
type ProductBase = Database["public"]["Tables"]["products"]["Row"];
type ProductWithRelations = ProductBase & {
  images?: ProductImage[];
  seo_metadata?: SEOMetadata | SEOMetadata[] | null;
};

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Saving..." : isNew ? "Create Product" : "Update Product"}
    </button>
  );
}

type ProductFormProps = {
  product?: ProductWithRelations;
  categories: Pick<Category, "id" | "name">[];
};

type FormData = {
  title: string;
  slug: string;
  description: string;
  category_id: string;
  status: string;
  featured: boolean;
  price: string;
  compare_at_price: string;
  cost_price: string;
  sku: string;
  barcode: string;
  quantity: string;
  meta_title: string;
  meta_description: string;
  focus_keyword: string;
};

export function ProductForm({ product, categories }: ProductFormProps) {
  const isNew = !product;
  const [activeTab, setActiveTab] = useState("basic");

  const action = isNew ? createProduct : updateProduct.bind(null, product!.id);
  const [state, formAction] = useActionState(action, undefined);

  // Supabase can return seo_metadata as object or array
  const rawSeo = product?.seo_metadata;
  const seoMeta: SEOMetadata | null = Array.isArray(rawSeo)
    ? rawSeo[0] ?? null
    : rawSeo ?? null;

  // Initialize form data state
  const [formData, setFormData] = useState<FormData>({
    title: product?.title || "",
    slug: product?.slug || "",
    description: product?.description || "",
    category_id: product?.category_id || "",
    status: product?.status || "draft",
    featured: product?.featured ?? false,
    price: product?.price?.toString() || "",
    compare_at_price: product?.compare_at_price?.toString() || "",
    cost_price: product?.cost_price?.toString() || "",
    sku: product?.sku || "",
    barcode: product?.barcode || "",
    quantity: product?.quantity?.toString() || "0",
    meta_title: seoMeta?.meta_title || "",
    meta_description: seoMeta?.meta_description || "",
    focus_keyword: seoMeta?.focus_keyword || "",
  });

  // Track validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  // Generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  };

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value, type } = e.target;
    const checked = (e.target as HTMLInputElement).checked;

    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));

    // Auto-generate slug from title for new products
    if (name === "title" && isNew) {
      setFormData((prev) => ({
        ...prev,
        slug: generateSlug(value),
      }));
    }

    // Clear error when user types
    if (errors[name as keyof FormData]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name as keyof FormData];
        return newErrors;
      });
    }
  };

  // Validate current tab
  const validateTab = (tab: string): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};

    if (tab === "basic") {
      if (!formData.title.trim()) {
        newErrors.title = "Product title is required";
      }
      if (!formData.slug.trim()) {
        newErrors.slug = "URL slug is required";
      }
      if (!formData.status) {
        newErrors.status = "Status is required";
      }
    }

    if (tab === "pricing") {
      if (!formData.price || parseFloat(formData.price) < 0) {
        newErrors.price = "Valid price is required";
      }
      if (!formData.quantity || parseInt(formData.quantity) < 0) {
        newErrors.quantity = "Valid quantity is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Check if all required fields are filled
  const isFormValid = (): boolean => {
    return (
      formData.title.trim() !== "" &&
      formData.slug.trim() !== "" &&
      formData.status !== "" &&
      formData.price !== "" &&
      parseFloat(formData.price) >= 0 &&
      formData.quantity !== "" &&
      parseInt(formData.quantity) >= 0
    );
  };

  const handleTabChange = (tab: string) => {
    // Don't validate when going back
    if (tab === "basic" || (activeTab === "pricing" && tab === "basic")) {
      setActiveTab(tab);
      return;
    }

    // Validate current tab before moving forward
    if (validateTab(activeTab)) {
      setActiveTab(tab);
    }
  };

  const handleNext = () => {
    const tabs = ["basic", "pricing", "seo"];
    const currentIndex = tabs.indexOf(activeTab);
    if (currentIndex < tabs.length - 1 && validateTab(activeTab)) {
      setActiveTab(tabs[currentIndex + 1]);
    }
  };

  const handleDelete = async () => {
    if (!product || !confirm("Are you sure you want to delete this product?")) {
      return;
    }

    await deleteProduct(product.id);
  };

  const tabConfig = [
    { id: "basic", label: "Basic Info", icon: "📝" },
    { id: "pricing", label: "Pricing & Inventory", icon: "💰" },
    { id: "images", label: "Images", icon: "🖼️", disabled: isNew },
    { id: "seo", label: "SEO", icon: "🔍" },
  ];

  return (
    <form action={formAction} className="max-w-7xl mx-auto text-black">
      {state?.error && (
        <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4">
          <div className="flex items-center">
            <span className="text-red-400 text-xl mr-3">⚠️</span>
            <div className="text-sm text-red-800">{state.error}</div>
          </div>
        </div>
      )}

      {state?.success && (
        <div className="mb-6 rounded-lg bg-green-50 border border-green-200 p-4">
          <div className="flex items-center">
            <span className="text-green-400 text-xl mr-3">✓</span>
            <div className="text-sm text-green-800">
              Product saved successfully!
            </div>
          </div>
        </div>
      )}

      {/* Enhanced Tabs */}
      <div className="mb-8">
        <div className="border-b border-gray-200 bg-white rounded-t-lg">
          <nav className="-mb-px flex" aria-label="Tabs">
            {tabConfig.map((tab) => (
              <button
                key={tab.id}
                type="button"
                onClick={() => !tab.disabled && handleTabChange(tab.id)}
                disabled={tab.disabled}
                className={`${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } ${
                  tab.disabled
                    ? "opacity-50 cursor-not-allowed"
                    : "hover:bg-gray-50"
                } flex-1 whitespace-nowrap border-b-2 py-4 px-6 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="space-y-6">
        {/* Basic Info Tab */}
        {activeTab === "basic" && (
          <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
            <div className="px-6 py-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  Basic Information
                </h3>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Product Title <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="title"
                  id="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-lg border ${
                    errors.title ? "border-red-300" : "border-gray-300"
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors`}
                  placeholder="Premium Wireless Headphones"
                />
                {errors.title && (
                  <p className="mt-1 text-sm text-red-600">{errors.title}</p>
                )}
              </div>

              <div>
                <label
                  htmlFor="slug"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  URL Slug <span className="text-red-500">*</span>
                </label>
                <div className="mt-1 flex rounded-lg shadow-sm">
                  <span className="inline-flex items-center rounded-l-lg border border-r-0 border-gray-300 bg-gray-50 px-4 text-gray-500 sm:text-sm font-medium">
                    /products/
                  </span>
                  <input
                    type="text"
                    name="slug"
                    id="slug"
                    required
                    value={formData.slug}
                    onChange={handleInputChange}
                    className={`block w-full min-w-0 flex-1 rounded-none rounded-r-lg border ${
                      errors.slug ? "border-red-300" : "border-gray-300"
                    } focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors`}
                    placeholder="premium-wireless-headphones"
                  />
                </div>
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  URL-friendly version of the title. Auto-generated if left
                  empty.
                </p>
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <textarea
                  name="description"
                  id="description"
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  placeholder="Describe your product in detail..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="category_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Category
                  </label>
                  <select
                    name="category_id"
                    id="category_id"
                    value={formData.category_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  >
                    <option value="">No category</option>
                    {categories.map((category) => (
                      <option key={category.id} value={category.id}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="status"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Status <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="status"
                    id="status"
                    required
                    value={formData.status}
                    onChange={handleInputChange}
                    className={`mt-1 block w-full rounded-lg border ${
                      errors.status ? "border-red-300" : "border-gray-300"
                    } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors`}
                  >
                    <option value="draft">📝 Draft</option>
                    <option value="published">✅ Published</option>
                    <option value="archived">📦 Archived</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                  )}
                </div>
              </div>

              <div className="flex items-center bg-gray-50 rounded-lg p-4 border border-gray-200">
                <input
                  type="checkbox"
                  name="featured"
                  id="featured"
                  checked={formData.featured}
                  onChange={handleInputChange}
                  className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <label
                  htmlFor="featured"
                  className="ml-3 block text-sm font-medium text-gray-900"
                >
                  ⭐ Feature this product on the homepage
                </label>
              </div>
            </div>
          </div>
        )}

        {/* Pricing & Inventory Tab */}
        {activeTab === "pricing" && (
          <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
            <div className="px-6 py-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-xl">💰</span>
                  Pricing & Inventory
                </h3>
              </div>

              <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                <div>
                  <label
                    htmlFor="price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Price <span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-1 rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="price"
                      id="price"
                      required
                      step="0.01"
                      min="0"
                      value={formData.price}
                      onChange={handleInputChange}
                      className={`block w-full rounded-lg border ${
                        errors.price ? "border-red-300" : "border-gray-300"
                      } pl-8 pr-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors`}
                      placeholder="0.00"
                    />
                  </div>
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="compare_at_price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Compare at Price
                  </label>
                  <div className="relative mt-1 rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="compare_at_price"
                      id="compare_at_price"
                      step="0.01"
                      min="0"
                      value={formData.compare_at_price}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-gray-300 pl-8 pr-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Original price (for sale display)
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="cost_price"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Cost Price
                  </label>
                  <div className="relative mt-1 rounded-lg shadow-sm">
                    <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                      <span className="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input
                      type="number"
                      name="cost_price"
                      id="cost_price"
                      step="0.01"
                      min="0"
                      value={formData.cost_price}
                      onChange={handleInputChange}
                      className="block w-full rounded-lg border-gray-300 pl-8 pr-4 py-2.5 focus:border-blue-500 focus:ring-blue-500 sm:text-sm transition-colors"
                      placeholder="0.00"
                    />
                  </div>
                  <p className="mt-2 text-xs text-gray-500">
                    Your cost (for profit calculation)
                  </p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Inventory Details
                </h4>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="sku"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      SKU
                    </label>
                    <input
                      type="text"
                      name="sku"
                      id="sku"
                      value={formData.sku}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                      placeholder="PROD-001"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="barcode"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Barcode
                    </label>
                    <input
                      type="text"
                      name="barcode"
                      id="barcode"
                      value={formData.barcode}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                      placeholder="123456789012"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Stock Quantity <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      id="quantity"
                      required
                      min="0"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      className={`mt-1 block w-full rounded-lg border ${
                        errors.quantity ? "border-red-300" : "border-gray-300"
                      } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors`}
                      placeholder="0"
                    />
                    {errors.quantity && (
                      <p className="mt-1 text-sm text-red-600">
                        {errors.quantity}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
            <div className="px-6 py-6 sm:p-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <span className="text-xl">🖼️</span>
                Product Images
              </h3>
              {isNew ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <span className="text-4xl mb-4 block">📸</span>
                  <p className="text-sm text-gray-500">
                    Save the product first to enable image uploads.
                  </p>
                </div>
              ) : (
                <>
                  <p className="text-sm text-gray-500 mb-6">
                    Upload high-quality images of your product. The first image
                    will be used as the primary image.
                  </p>
                  <ImageUpload
                    productId={product!.id}
                    existingImages={product?.images || []}
                  />
                </>
              )}
            </div>
          </div>
        )}

        {/* SEO Tab */}
        {activeTab === "seo" && (
          <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
            <div className="px-6 py-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-xl">🔍</span>
                  SEO Optimization
                </h3>
              </div>

              <div>
                <label
                  htmlFor="meta_title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Meta Title
                </label>
                <input
                  type="text"
                  name="meta_title"
                  id="meta_title"
                  maxLength={60}
                  value={formData.meta_title}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  placeholder="Optimal length: 50-60 characters"
                />
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    Leave empty to use product title
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.meta_title.length}/60
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="meta_description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Meta Description
                </label>
                <textarea
                  name="meta_description"
                  id="meta_description"
                  rows={3}
                  maxLength={160}
                  value={formData.meta_description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  placeholder="Optimal length: 150-160 characters"
                />
                <div className="mt-2 flex justify-between items-center">
                  <p className="text-xs text-gray-500">
                    This appears in search results
                  </p>
                  <p className="text-xs text-gray-500">
                    {formData.meta_description.length}/160
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="focus_keyword"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Focus Keyword
                </label>
                <input
                  type="text"
                  name="focus_keyword"
                  id="focus_keyword"
                  value={formData.focus_keyword}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  placeholder="wireless headphones"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Primary keyword you want to rank for
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-between bg-white border border-gray-200 px-6 py-4 sm:rounded-lg shadow-lg">
          <div>
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex justify-center items-center gap-2 rounded-lg border border-transparent bg-red-600 py-2.5 px-5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <span>🗑️</span>
                Delete Product
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/products"
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white py-2.5 px-5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </Link>

            {/* Show Next button if not on last tab and form not complete */}
            {activeTab !== "seo" && !isFormValid() && (
              <button
                type="button"
                onClick={handleNext}
                className="inline-flex justify-center items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
              >
                Next
                <span>→</span>
              </button>
            )}

            {/* Show Submit button only when form is valid or when editing */}
            {(isFormValid() || !isNew) && <SubmitButton isNew={isNew} />}
          </div>
        </div>
      </div>

      {/* Hidden inputs to preserve form data */}
      <input type="hidden" name="title" value={formData.title} />
      <input type="hidden" name="slug" value={formData.slug} />
      <input type="hidden" name="description" value={formData.description} />
      <input type="hidden" name="category_id" value={formData.category_id} />
      <input type="hidden" name="status" value={formData.status} />
      <input
        type="hidden"
        name="featured"
        value={formData.featured.toString()}
      />
      <input type="hidden" name="price" value={formData.price} />
      <input
        type="hidden"
        name="compare_at_price"
        value={formData.compare_at_price}
      />
      <input type="hidden" name="cost_price" value={formData.cost_price} />
      <input type="hidden" name="sku" value={formData.sku} />
      <input type="hidden" name="barcode" value={formData.barcode} />
      <input type="hidden" name="quantity" value={formData.quantity} />
      <input type="hidden" name="meta_title" value={formData.meta_title} />
      <input
        type="hidden"
        name="meta_description"
        value={formData.meta_description}
      />
      <input
        type="hidden"
        name="focus_keyword"
        value={formData.focus_keyword}
      />
    </form>
  );
}
