"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useState } from "react";
import { useRouter } from "next/navigation";
import { createCategory, updateCategory, deleteCategory } from "@/lib/actions/category-actions";
import { CategoryImageUpload } from "@/components/dashboard/category-image-upload";
import { Database } from "@/types/database.types";
import Link from "next/link";

type CategoryRow = Database["public"]["Tables"]["categories"]["Row"];

type ParentOption = { id: string; name: string; level: number };

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center rounded-md border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Saving..." : isNew ? "Create Category" : "Update Category"}
    </button>
  );
}

type CategoryFormProps = {
  category?: CategoryRow;
  /** All categories for parent dropdown (flat, ordered). Current category excluded when editing. */
  parentOptions: ParentOption[];
};

type FormData = {
  name: string;
  slug: string;
  description: string;
  parent_id: string;
  display_order: string;
  status: string;
  meta_title: string;
  meta_description: string;
};

export function CategoryForm({ category, parentOptions }: CategoryFormProps) {
  const router = useRouter();
  const isNew = !category;
  const [activeTab, setActiveTab] = useState("basic");

  const action = isNew
    ? createCategory
    : updateCategory.bind(null, category!.id);
  const [state, formAction] = useActionState(action, undefined);

  const initialFormData: FormData = {
    name: category?.name ?? "",
    slug: category?.slug ?? "",
    description: category?.description ?? "",
    parent_id: category?.parent_id ?? "",
    display_order: String(category?.display_order ?? 0),
    status: category?.status ?? "published",
    meta_title: category?.meta_title ?? "",
    meta_description: category?.meta_description ?? "",
  };

  const [formData, setFormData] = useState<FormData>(initialFormData);

  const [errors, setErrors] = useState<Partial<Record<keyof FormData, string>>>(
    {}
  );

  const generateSlug = (name: string) =>
    name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (name === "name" && isNew) {
      setFormData((prev) => ({ ...prev, slug: generateSlug(value) }));
    }
    if (errors[name as keyof FormData]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name as keyof FormData];
        return next;
      });
    }
  };

  const validateTab = (tab: string): boolean => {
    const newErrors: Partial<Record<keyof FormData, string>> = {};
    if (tab === "basic") {
      if (!formData.name.trim()) newErrors.name = "Name is required";
      if (!formData.slug.trim()) newErrors.slug = "URL slug is required";
      if (!formData.status) newErrors.status = "Status is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleTabChange = (tab: string) => {
    if (tab === "basic" || activeTab === "basic") {
      setActiveTab(tab);
      return;
    }
    if (validateTab(activeTab)) setActiveTab(tab);
  };

  const handleDelete = async () => {
    if (!category || !confirm("Are you sure you want to delete this category?"))
      return;
    try {
      await deleteCategory(category.id);
      router.push("/dashboard/categories");
    } catch {
      // Error already shown by deleteCategory / alert in table
    }
  };

  const tabConfig: { id: string; label: string; icon: string; disabled?: boolean }[] = [
    { id: "basic", label: "Basic Info", icon: "📝" },
    { id: "image", label: "Image", icon: "🖼️", disabled: isNew },
    { id: "seo", label: "SEO", icon: "🔍" },
  ];

  return (
    <form action={formAction} className="max-w-4xl mx-auto text-black">
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
              Category saved successfully!
            </div>
          </div>
        </div>
      )}

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
                  (tab as { disabled?: boolean }).disabled
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
        {activeTab === "basic" && (
          <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
            <div className="px-6 py-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-xl">📝</span>
                Basic Information
              </h3>

              <div>
                <label
                  htmlFor="name"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Category Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="name"
                  id="name"
                  required
                  value={formData.name}
                  onChange={handleInputChange}
                  className={`mt-1 block w-full rounded-lg border ${
                    errors.name ? "border-red-300" : "border-gray-300"
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5`}
                  placeholder="e.g. Phones"
                />
                {errors.name && (
                  <p className="mt-1 text-sm text-red-600">{errors.name}</p>
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
                    /shop/
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
                    } focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5`}
                    placeholder="phones"
                  />
                </div>
                {errors.slug && (
                  <p className="mt-1 text-sm text-red-600">{errors.slug}</p>
                )}
                <p className="mt-2 text-xs text-gray-500">
                  URL-friendly. Auto-generated from name if left empty.
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
                  rows={3}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5"
                  placeholder="Brief description of this category..."
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="parent_id"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Parent Category
                  </label>
                  <select
                    name="parent_id"
                    id="parent_id"
                    value={formData.parent_id}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5"
                  >
                    <option value="">None (top-level category)</option>
                    {parentOptions.map((opt) => (
                      <option key={opt.id} value={opt.id}>
                        {"—".repeat(opt.level)} {opt.name}
                      </option>
                    ))}
                  </select>
                  <p className="mt-2 text-xs text-gray-500">
                    Leave empty for a main category; select one for a subcategory.
                  </p>
                </div>

                <div>
                  <label
                    htmlFor="display_order"
                    className="block text-sm font-medium text-gray-700 mb-1"
                  >
                    Display Order
                  </label>
                  <input
                    type="number"
                    name="display_order"
                    id="display_order"
                    min={0}
                    value={formData.display_order}
                    onChange={handleInputChange}
                    className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5"
                  />
                  <p className="mt-2 text-xs text-gray-500">
                    Lower numbers appear first.
                  </p>
                </div>
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
                  } shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5`}
                >
                  <option value="published">Published</option>
                  <option value="draft">Draft</option>
                  <option value="archived">Archived</option>
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === "image" && !isNew && (
          <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
            <div className="px-6 py-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-xl">🖼️</span>
                Category Image
              </h3>
              <p className="text-sm text-gray-500">
                Banner image for this category. Used on category pages and navigation.
              </p>
              <CategoryImageUpload
                categoryId={category!.id}
                imageUrl={category?.image_url ?? null}
              />
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
            <div className="px-6 py-6 sm:p-8 space-y-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                <span className="text-xl">🔍</span>
                SEO
              </h3>

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
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5"
                  placeholder="50–60 characters"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {formData.meta_title.length}/60. Leave empty to use category name.
                </p>
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
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5"
                  placeholder="150–160 characters for search results"
                />
                <p className="mt-2 text-xs text-gray-500">
                  {formData.meta_description.length}/160
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex items-center justify-between bg-white border border-gray-200 px-6 py-4 sm:rounded-lg shadow-lg">
          <div>
            {!isNew && (
              <button
                type="button"
                onClick={handleDelete}
                className="inline-flex justify-center items-center gap-2 rounded-lg border border-transparent bg-red-600 py-2.5 px-5 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 transition-colors"
              >
                <span>🗑️</span>
                Delete Category
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/categories"
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white py-2.5 px-5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </Link>
            <SubmitButton isNew={isNew} />
          </div>
        </div>
      </div>

      <input type="hidden" name="name" value={formData.name} />
      <input type="hidden" name="slug" value={formData.slug} />
      <input type="hidden" name="description" value={formData.description} />
      <input type="hidden" name="parent_id" value={formData.parent_id} />
      <input type="hidden" name="display_order" value={formData.display_order} />
      <input type="hidden" name="status" value={formData.status} />
      <input type="hidden" name="image_url" value={category?.image_url ?? ""} />
      <input type="hidden" name="meta_title" value={formData.meta_title} />
      <input type="hidden" name="meta_description" value={formData.meta_description} />
    </form>
  );
}
