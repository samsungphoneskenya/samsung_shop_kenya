"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
  createProduct,
  updateProduct,
  deleteProduct,
} from "@/lib/actions/product-actions";
import { ImageUpload } from "@/app/(dashboard)/dashboard/image-upload";
import { Database } from "@/types/database.types";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { ProductSpecificationsEditor } from "@/components/dashboard/product-specifications-editor";
import { RichTextEditor } from "@/components/shared/RichTextEditor";

type Category = Database["public"]["Tables"]["categories"]["Row"];
type ProductRow = Database["public"]["Tables"]["products"]["Row"];

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
  product?: ProductRow;
  categories: Pick<Category, "id" | "name">[];
  specifications?: Database["public"]["Tables"]["product_specifications"]["Row"][];
};

type FormData = {
  title: string;
  slug: string;
  description: string;
  short_description: string;
  category_id: string;
  status: string;
  visibility: string;
  is_featured: boolean;
  is_bestseller: boolean;
  is_new_arrival: boolean;
  on_sale: boolean;
  price: string;
  compare_at_price: string;
  cost_price: string;
  sku: string;
  quantity: string;
  low_stock_threshold: string;
  track_inventory: boolean;
  allow_backorder: boolean;
  weight: string;
  video_url: string;
  requires_shipping: boolean;
  shipping_class: string;
  meta_title: string;
  meta_description: string;
  meta_keywords: string;
};

export function ProductForm({
  product,
  categories,
  specifications = [],
}: ProductFormProps) {
  const router = useRouter();
  const isNew = !product;
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();

  const action = isNew ? createProduct : updateProduct.bind(null, product!.id);
  const [state, formAction] = useActionState(action, undefined);

  const initialFormData: FormData = {
    title: product?.title ?? "",
    slug: product?.slug ?? "",
    description: product?.description ?? "",
    short_description: product?.short_description ?? "",
    category_id: product?.category_id ?? "",
    status: product?.status ?? "draft",
    visibility: product?.visibility ?? "visible",
    is_featured: product?.is_featured ?? false,
    is_bestseller: product?.is_bestseller ?? false,
    is_new_arrival: product?.is_new_arrival ?? false,
    on_sale: product?.on_sale ?? false,
    price: product?.price?.toString() ?? "",
    compare_at_price: product?.compare_at_price?.toString() ?? "",
    cost_price: product?.cost_price?.toString() ?? "",
    sku: product?.sku ?? "",
    quantity: product?.quantity?.toString() ?? "0",
    low_stock_threshold: product?.low_stock_threshold?.toString() ?? "5",
    track_inventory: product?.track_inventory ?? true,
    allow_backorder: product?.allow_backorder ?? false,
    weight: product?.weight?.toString() ?? "",
    video_url: product?.video_url ?? "",
    requires_shipping: product?.requires_shipping ?? true,
    shipping_class: product?.shipping_class ?? "",
    meta_title: product?.meta_title ?? "",
    meta_description: product?.meta_description ?? "",
    meta_keywords: (product?.meta_keywords ?? []).join(", "),
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  // Track validation errors
  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  // Toast notifications for server action results
  useEffect(() => {
    if (!state) return;

    if (state.error) {
      toast({
        variant: "destructive",
        title: "Unable to save product",
        description: state.error,
      });
    }

    if (state.success) {
      toast({
        variant: "success",
        title: isNew ? "Product created" : "Product updated",
        description: "Your changes have been saved.",
      });

      if (state.redirectTo) {
        router.push(state.redirectTo);
      } else {
        router.refresh();
      }
    }
  }, [state, toast, isNew, router]);

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

    const result = await deleteProduct(product.id);
    if (result.error) {
      toast({
        variant: "destructive",
        title: "Delete failed",
        description: result.error,
      });
      return;
    }
    toast({
      variant: "success",
      title: "Product deleted",
      description: "The product has been removed.",
    });
    if (result.redirectTo) router.push(result.redirectTo);
  };

  const tabConfig = [
    { id: "basic", label: "Basic Info", icon: "📝" },
    { id: "pricing", label: "Pricing & Inventory", icon: "💰" },
    { id: "specs", label: "Specifications", icon: "📋", disabled: isNew },
    { id: "images", label: "Images", icon: "🖼️", disabled: isNew },
    { id: "seo", label: "SEO", icon: "🔍" },
  ];

  return (
    <form action={formAction} className="max-w-7xl mx-auto text-black">
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
                  htmlFor="short_description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Short Description
                </label>
                <input
                  type="text"
                  name="short_description"
                  id="short_description"
                  value={formData.short_description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  placeholder="Brief tagline for listings"
                />
              </div>

              <div>
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Description
                </label>
                <RichTextEditor
                  name="description"
                  value={formData.description}
                  onChange={(html) =>
                    setFormData((prev) => ({ ...prev, description: html }))
                  }
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
                    <option value="out_of_stock">🚫 Out of stock</option>
                  </select>
                  {errors.status && (
                    <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="visibility"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Visibility
                  </label>
                  <select
                    name="visibility"
                    id="visibility"
                    value={formData.visibility}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  >
                    <option value="visible">Visible</option>
                    <option value="hidden">Hidden</option>
                    <option value="search_only">Search only</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-wrap gap-4 items-center bg-gray-50 rounded-lg p-4 border border-gray-200">
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_featured"
                    checked={formData.is_featured}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    ⭐ Featured
                  </span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_bestseller"
                    checked={formData.is_bestseller}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    🏆 Bestseller
                  </span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="is_new_arrival"
                    checked={formData.is_new_arrival}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    ✨ New arrival
                  </span>
                </label>
                <label className="inline-flex items-center gap-2">
                  <input
                    type="checkbox"
                    name="on_sale"
                    checked={formData.on_sale}
                    onChange={handleInputChange}
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm font-medium text-gray-900">
                    🏷️ On sale
                  </span>
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
                  Inventory
                </h4>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
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
                      htmlFor="quantity"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Stock <span className="text-red-500">*</span>
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
                  <div>
                    <label
                      htmlFor="low_stock_threshold"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Low stock alert
                    </label>
                    <input
                      type="number"
                      name="low_stock_threshold"
                      id="low_stock_threshold"
                      min="0"
                      value={formData.low_stock_threshold}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                      placeholder="5"
                    />
                  </div>
                  <div className="flex flex-col justify-end gap-2">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="track_inventory"
                        checked={formData.track_inventory}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Track inventory
                      </span>
                    </label>
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="allow_backorder"
                        checked={formData.allow_backorder}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Allow backorder
                      </span>
                    </label>
                  </div>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-6">
                <h4 className="text-sm font-medium text-gray-900 mb-4">
                  Shipping
                </h4>
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
                  <div>
                    <label
                      htmlFor="weight"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Weight (kg)
                    </label>
                    <input
                      type="number"
                      name="weight"
                      id="weight"
                      step="0.001"
                      min="0"
                      value={formData.weight}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                      placeholder="0.5"
                    />
                  </div>
                  <div>
                    <label
                      htmlFor="shipping_class"
                      className="block text-sm font-medium text-gray-700 mb-1"
                    >
                      Shipping class
                    </label>
                    <select
                      name="shipping_class"
                      id="shipping_class"
                      value={formData.shipping_class}
                      onChange={handleInputChange}
                      className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                    >
                      <option value="">Standard</option>
                      <option value="standard">Standard</option>
                      <option value="express">Express</option>
                      <option value="fragile">Fragile</option>
                    </select>
                  </div>
                  <div className="flex items-end">
                    <label className="inline-flex items-center gap-2">
                      <input
                        type="checkbox"
                        name="requires_shipping"
                        checked={formData.requires_shipping}
                        onChange={handleInputChange}
                        className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                      />
                      <span className="text-sm font-medium text-gray-900">
                        Requires shipping
                      </span>
                    </label>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Specifications Tab */}
        {activeTab === "specs" && (
          <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
            <div className="px-6 py-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                <span className="text-xl">📋</span>
                Product specifications
              </h3>
              {isNew ? (
                <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
                  <span className="text-4xl mb-4 block">🧾</span>
                  <p className="text-sm text-gray-500">
                    Save the product first to add specifications.
                  </p>
                </div>
              ) : (
                <ProductSpecificationsEditor
                  productId={product!.id}
                  specifications={specifications}
                />
              )}
            </div>
          </div>
        )}

        {/* Images Tab */}
        {activeTab === "images" && (
          <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
            <div className="px-6 py-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
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
                  <p className="text-sm text-gray-500">
                    Upload images. The first or selected primary image is used
                    as the main product image.
                  </p>
                  <ImageUpload
                    productId={product!.id}
                    featuredImage={product?.featured_image ?? null}
                    galleryImages={product?.gallery_images ?? []}
                  />
                </>
              )}
              <div>
                <label
                  htmlFor="video_url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Video URL
                </label>
                <input
                  type="url"
                  name="video_url"
                  id="video_url"
                  value={formData.video_url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  placeholder="https://youtube.com/..."
                />
              </div>
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
                  htmlFor="meta_keywords"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Meta Keywords
                </label>
                <input
                  type="text"
                  name="meta_keywords"
                  id="meta_keywords"
                  value={formData.meta_keywords}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  placeholder="samsung, phone, galaxy (comma-separated)"
                />
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
      <input
        type="hidden"
        name="short_description"
        value={formData.short_description}
      />
      <input type="hidden" name="category_id" value={formData.category_id} />
      <input type="hidden" name="status" value={formData.status} />
      <input type="hidden" name="visibility" value={formData.visibility} />
      <input
        type="hidden"
        name="is_featured"
        value={formData.is_featured ? "true" : "false"}
      />
      <input
        type="hidden"
        name="is_bestseller"
        value={formData.is_bestseller ? "true" : "false"}
      />
      <input
        type="hidden"
        name="is_new_arrival"
        value={formData.is_new_arrival ? "true" : "false"}
      />
      <input
        type="hidden"
        name="on_sale"
        value={formData.on_sale ? "true" : "false"}
      />
      <input type="hidden" name="price" value={formData.price} />
      <input
        type="hidden"
        name="compare_at_price"
        value={formData.compare_at_price}
      />
      <input type="hidden" name="cost_price" value={formData.cost_price} />
      <input type="hidden" name="sku" value={formData.sku} />
      <input type="hidden" name="quantity" value={formData.quantity} />
      <input
        type="hidden"
        name="low_stock_threshold"
        value={formData.low_stock_threshold}
      />
      <input
        type="hidden"
        name="track_inventory"
        value={formData.track_inventory ? "true" : "false"}
      />
      <input
        type="hidden"
        name="allow_backorder"
        value={formData.allow_backorder ? "true" : "false"}
      />
      <input type="hidden" name="weight" value={formData.weight} />
      <input type="hidden" name="video_url" value={formData.video_url} />
      <input
        type="hidden"
        name="requires_shipping"
        value={formData.requires_shipping ? "true" : "false"}
      />
      <input
        type="hidden"
        name="shipping_class"
        value={formData.shipping_class}
      />
      <input
        type="hidden"
        name="featured_image"
        value={product?.featured_image ?? ""}
      />
      <input
        type="hidden"
        name="gallery_images"
        value={JSON.stringify(product?.gallery_images ?? [])}
      />
      <input type="hidden" name="meta_title" value={formData.meta_title} />
      <input
        type="hidden"
        name="meta_description"
        value={formData.meta_description}
      />
      <input
        type="hidden"
        name="meta_keywords"
        value={formData.meta_keywords}
      />
    </form>
  );
}
