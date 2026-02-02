"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useState } from "react";
import { createPage, updatePage, deletePage } from "@/lib/actions/page-actions";
import { Database } from "@/types/database.types";
import Link from "next/link";

type SEOMetadata = Database["public"]["Tables"]["seo_metadata"]["Row"];
type PageTypes = Database["public"]["Tables"]["pages"]["Row"];

function SubmitButton({ isNew }: { isNew: boolean }) {
  const { pending } = useFormStatus();

  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Saving..." : isNew ? "Create Page" : "Update Page"}
    </button>
  );
}

type PageFormProps = {
  page?: PageTypes;
  meta_data?: SEOMetadata | null;
};

type FormData = {
  title: string;
  slug: string;
  content: string;
  status: string;
  meta_title: string;
  meta_description: string;
  canonical_url: string;
  robots: string;
};

export function PageForm({ page, meta_data }: PageFormProps) {
  const isNew = !page;
  const [activeTab, setActiveTab] = useState("content");

  const action = isNew ? createPage : updatePage.bind(null, page!.id);
  const [state, formAction] = useActionState(action, undefined);

  // Initialize form data state
  const [formData, setFormData] = useState<FormData>({
    title: page?.title || "",
    slug: page?.slug || "",
    content: page?.content || "",
    status: page?.status || "draft",
    meta_title: meta_data?.meta_title || "",
    meta_description: meta_data?.meta_description || "",
    canonical_url: meta_data?.canonical_url || "",
    robots: meta_data?.robots || "index, follow",
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
    const { name, value } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Auto-generate slug from title for new pages
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

    if (tab === "content") {
      if (!formData.title.trim()) {
        newErrors.title = "Page title is required";
      }
      if (!formData.slug.trim()) {
        newErrors.slug = "URL slug is required";
      }
      if (!formData.status) {
        newErrors.status = "Status is required";
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
      formData.status !== ""
    );
  };

  const handleTabChange = (tab: string) => {
    // Don't validate when going back
    if (tab === "content") {
      setActiveTab(tab);
      return;
    }

    // Validate current tab before moving forward
    if (validateTab(activeTab)) {
      setActiveTab(tab);
    }
  };

  const handleNext = () => {
    if (activeTab === "content" && validateTab("content")) {
      setActiveTab("seo");
    }
  };

  const handleDelete = async () => {
    if (!page || !confirm("Are you sure you want to delete this page?")) {
      return;
    }

    await deletePage(page.id);
  };

  // Markdown formatting helpers
  const insertMarkdown = (
    before: string,
    after: string = "",
    defaultText: string = ""
  ) => {
    const textarea = document.getElementById("content") as HTMLTextAreaElement;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const text = textarea.value;
    const selectedText = text.substring(start, end) || defaultText;

    const newValue =
      text.substring(0, start) +
      before +
      selectedText +
      after +
      text.substring(end);

    setFormData((prev) => ({ ...prev, content: newValue }));

    // Set cursor position after insertion
    setTimeout(() => {
      textarea.focus();
      const newPosition =
        start + before.length + selectedText.length + after.length;
      textarea.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  const tabConfig = [
    { id: "content", label: "Content", icon: "📝" },
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
              Page saved successfully!
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
                onClick={() => handleTabChange(tab.id)}
                className={`${
                  activeTab === tab.id
                    ? "border-blue-500 text-blue-600 bg-blue-50"
                    : "border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700"
                } hover:bg-gray-50 flex-1 whitespace-nowrap border-b-2 py-4 px-6 text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2`}
              >
                <span className="text-base">{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      <div className="space-y-6">
        {/* Content Tab */}
        {activeTab === "content" && (
          <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
            <div className="px-6 py-6 sm:p-8 space-y-6">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-6 flex items-center gap-2">
                  <span className="text-xl">📝</span>
                  Page Content
                </h3>
              </div>

              <div>
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Page Title <span className="text-red-500">*</span>
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
                  placeholder="About Us"
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
                    /
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
                    placeholder="about-us"
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
                  htmlFor="content"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Content
                </label>
                <div className="border border-gray-300 rounded-lg overflow-hidden shadow-sm">
                  {/* Enhanced Toolbar */}
                  <div className="border-b border-gray-300 bg-gray-50 px-3 py-2.5 flex gap-1 flex-wrap">
                    <button
                      type="button"
                      onClick={() => insertMarkdown("## ", "", "Heading")}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-white transition-colors font-semibold"
                      title="Heading"
                    >
                      H2
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("### ", "", "Heading")}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-white transition-colors font-semibold"
                      title="Subheading"
                    >
                      H3
                    </button>
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("**", "**", "bold text")}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-white transition-colors font-bold"
                      title="Bold"
                    >
                      B
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("*", "*", "italic text")}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-white transition-colors italic"
                      title="Italic"
                    >
                      I
                    </button>
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("\n- ", "", "List item")}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-white transition-colors"
                      title="Bullet List"
                    >
                      • List
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("\n1. ", "", "List item")}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-white transition-colors"
                      title="Numbered List"
                    >
                      1. List
                    </button>
                    <div className="w-px bg-gray-300 mx-1"></div>
                    <button
                      type="button"
                      onClick={() =>
                        insertMarkdown("[", "](https://)", "link text")
                      }
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-white transition-colors"
                      title="Link"
                    >
                      🔗 Link
                    </button>
                    <button
                      type="button"
                      onClick={() => insertMarkdown("`", "`", "code")}
                      className="px-3 py-1.5 text-sm border border-gray-300 rounded-md hover:bg-white transition-colors font-mono"
                      title="Inline Code"
                    >
                      &lt;/&gt;
                    </button>
                  </div>

                  {/* Textarea */}
                  <textarea
                    name="content"
                    id="content"
                    rows={18}
                    value={formData.content}
                    onChange={handleInputChange}
                    className="block w-full border-0 focus:ring-0 sm:text-sm p-4 font-mono resize-none"
                    placeholder="Write your content here... (Markdown supported)

## Example Heading
This is a paragraph with **bold** and *italic* text.

- List item 1
- List item 2

[Link text](https://example.com)"
                  />
                </div>
                <p className="mt-2 text-xs text-gray-500">
                  Supports Markdown formatting. Use the toolbar or type
                  manually.
                </p>
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
                </select>
                {errors.status && (
                  <p className="mt-1 text-sm text-red-600">{errors.status}</p>
                )}
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
                    Leave empty to use page title
                  </p>
                  <p
                    className={`text-xs ${
                      formData.meta_title.length > 60
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
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
                  <p
                    className={`text-xs ${
                      formData.meta_description.length > 160
                        ? "text-red-500"
                        : "text-gray-500"
                    }`}
                  >
                    {formData.meta_description.length}/160
                  </p>
                </div>
              </div>

              <div>
                <label
                  htmlFor="canonical_url"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Canonical URL
                </label>
                <input
                  type="url"
                  name="canonical_url"
                  id="canonical_url"
                  value={formData.canonical_url}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                  placeholder="https://yourdomain.com/page-name"
                />
                <p className="mt-2 text-xs text-gray-500">
                  Leave empty to use the default URL for this page.
                </p>
              </div>

              <div>
                <label
                  htmlFor="robots"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Robots Directive
                </label>
                <select
                  name="robots"
                  id="robots"
                  value={formData.robots}
                  onChange={handleInputChange}
                  className="mt-1 block w-full rounded-lg border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm px-4 py-2.5 transition-colors"
                >
                  <option value="index, follow">
                    ✅ Index, Follow (Default)
                  </option>
                  <option value="noindex, follow">🚫 No Index, Follow</option>
                  <option value="index, nofollow">✅ Index, No Follow</option>
                  <option value="noindex, nofollow">
                    🚫 No Index, No Follow
                  </option>
                </select>
                <p className="mt-2 text-xs text-gray-500">
                  Control how search engines index this page.
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
                Delete Page
              </button>
            )}
          </div>
          <div className="flex gap-3">
            <Link
              href="/dashboard/pages"
              className="inline-flex justify-center rounded-lg border border-gray-300 bg-white py-2.5 px-5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
            >
              Cancel
            </Link>

            {/* Show Next button if on content tab and form not complete */}
            {activeTab === "content" && !isFormValid() && (
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
      <input type="hidden" name="content" value={formData.content} />
      <input type="hidden" name="status" value={formData.status} />
      <input type="hidden" name="meta_title" value={formData.meta_title} />
      <input
        type="hidden"
        name="meta_description"
        value={formData.meta_description}
      />
      <input
        type="hidden"
        name="canonical_url"
        value={formData.canonical_url}
      />
      <input type="hidden" name="robots" value={formData.robots} />
    </form>
  );
}
