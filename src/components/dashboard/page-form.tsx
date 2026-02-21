"use client";

import { useFormStatus } from "react-dom";
import { useActionState, useState, useCallback, useEffect } from "react";
import { updatePage } from "@/lib/actions/page-actions";
import { Database } from "@/types/database.types";
import Link from "next/link";
import { useToast } from "@/components/ui/use-toast";
import { useRouter } from "next/navigation";
import type {
  HomeSections,
  AboutSections,
  ContactSections,
  PageSections,
} from "@/lib/types/page-sections";
import { RichTextEditor } from "@/components/shared/RichTextEditor";

type PageRow = Database["public"]["Tables"]["pages"]["Row"];

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button
      type="submit"
      disabled={pending}
      className="inline-flex justify-center items-center gap-2 rounded-lg border border-transparent bg-blue-600 py-2.5 px-5 text-sm font-medium text-white shadow-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
    >
      {pending ? "Saving..." : "Save changes"}
    </button>
  );
}

type PageFormProps = {
  page: PageRow;
};

export function PageForm({ page }: PageFormProps) {
  const router = useRouter();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("sections");
  const [formData, setFormData] = useState({
    title: page.title ?? "",
    status: (page.status as string) ?? "published",
    meta_title: page.meta_title ?? "",
    meta_description: page.meta_description ?? "",
    sections: (page.sections as PageSections) ?? {},
  });

  const action = updatePage.bind(null, page.id);
  const [state, formAction] = useActionState(action, undefined);

  useEffect(() => {
    if (!state) return;
    if (state.error) {
      toast({
        variant: "destructive",
        title: "Unable to save page",
        description: state.error,
      });
    }
    if (state.success) {
      toast({
        variant: "success",
        title: "Page updated",
        description: "Your changes have been saved.",
      });
      router.refresh();
    }
  }, [state, toast, router]);

  const updateSections = useCallback((path: string, value: unknown) => {
    setFormData((prev) => {
      const next = { ...prev, sections: { ...prev.sections } };
      const keys = path.split(".");
      let target: Record<string, unknown> = next.sections as Record<
        string,
        unknown
      >;
      for (let i = 0; i < keys.length - 1; i++) {
        const k = keys[i];
        const existing =
          target[k] &&
          typeof target[k] === "object" &&
          !Array.isArray(target[k])
            ? (target[k] as Record<string, unknown>)
            : {};
        const t = { ...existing };
        target[k] = t;
        target = t;
      }
      target[keys[keys.length - 1]] = value;
      return next;
    });
  }, []);

  const slug = page.slug as "home" | "about-us" | "contact-us";
  const sections = formData.sections as Record<string, unknown>;

  const tabConfig = [
    { id: "sections", label: "Sections", icon: "📝" },
    { id: "seo", label: "SEO", icon: "🔍" },
  ];

  return (
    <form action={formAction} className="max-w-7xl mx-auto text-black">
      <div className="mb-8">
        <nav className="-mb-px flex border-b border-gray-200">
          {tabConfig.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`${
                activeTab === tab.id
                  ? "border-blue-500 text-blue-600 bg-blue-50"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              } flex-1 whitespace-nowrap border-b-2 py-4 px-6 text-sm font-medium flex items-center justify-center gap-2`}
            >
              <span>{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      <div className="space-y-6">
        {activeTab === "sections" && (
          <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
            <div className="px-6 py-6 sm:p-8 space-y-8">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Page title
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, title: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 sm:text-sm"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Status
                </label>
                <select
                  name="status"
                  value={formData.status}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, status: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 sm:text-sm"
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              {slug === "home" && (
                <HomeSectionEditor
                  sections={(sections as HomeSections) || {}}
                  onChange={updateSections}
                />
              )}
              {slug === "about-us" && (
                <AboutSectionEditor
                  sections={(sections as AboutSections) || {}}
                  onChange={updateSections}
                />
              )}
              {slug === "contact-us" && (
                <ContactSectionEditor
                  sections={(sections as ContactSections) || {}}
                  onChange={updateSections}
                />
              )}
            </div>
          </div>
        )}

        {activeTab === "seo" && (
          <div className="bg-white shadow-lg sm:rounded-lg border border-gray-200">
            <div className="px-6 py-6 sm:p-8 space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta title
                </label>
                <input
                  type="text"
                  name="meta_title"
                  maxLength={60}
                  value={formData.meta_title}
                  onChange={(e) =>
                    setFormData((p) => ({ ...p, meta_title: e.target.value }))
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 sm:text-sm"
                  placeholder="50–60 characters"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.meta_title.length}/60
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Meta description
                </label>
                <textarea
                  name="meta_description"
                  rows={3}
                  maxLength={160}
                  value={formData.meta_description}
                  onChange={(e) =>
                    setFormData((p) => ({
                      ...p,
                      meta_description: e.target.value,
                    }))
                  }
                  className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 sm:text-sm"
                  placeholder="150–160 characters"
                />
                <p className="mt-1 text-xs text-gray-500">
                  {formData.meta_description.length}/160
                </p>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-between bg-white border border-gray-200 px-6 py-4 rounded-lg">
          <Link
            href="/dashboard/pages"
            className="rounded-lg border border-gray-300 bg-white py-2.5 px-5 text-sm font-medium text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </Link>
          <SubmitButton />
        </div>
      </div>

      <input type="hidden" name="title" value={formData.title} />
      <input type="hidden" name="status" value={formData.status} />
      <input type="hidden" name="meta_title" value={formData.meta_title} />
      <input
        type="hidden"
        name="meta_description"
        value={formData.meta_description}
      />
      <input
        type="hidden"
        name="sections"
        value={JSON.stringify(formData.sections)}
      />
    </form>
  );
}

// ---- Section editors (each updates sections via path + value) ----

function Field({
  label,
  name,
  value,
  onChange,
  path,
  multiline,
  placeholder,
}: {
  label: string;
  name?: string;
  value: string;
  onChange: (path: string, value: unknown) => void;
  path: string;
  multiline?: boolean;
  placeholder?: string;
}) {
  const v = value ?? "";
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      {multiline ? (
        <textarea
          value={v}
          onChange={(e) => onChange(path, e.target.value)}
          rows={3}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 sm:text-sm"
          placeholder={placeholder}
        />
      ) : (
        <input
          type="text"
          name={name}
          value={v}
          onChange={(e) => onChange(path, e.target.value)}
          className="mt-1 block w-full rounded-lg border border-gray-300 px-4 py-2.5 sm:text-sm"
          placeholder={placeholder}
        />
      )}
    </div>
  );
}

function RichTextSectionField({
  label,
  value,
  path,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (path: string, value: unknown) => void;
  path: string;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-1">
        {label}
      </label>
      <RichTextEditor
        name={path}
        value={value ?? ""}
        onChange={(html) => onChange(path, html)}
        placeholder={placeholder}
        minHeight={180}
      />
    </div>
  );
}

function HomeSectionEditor({
  sections,
  onChange,
}: {
  sections: HomeSections;
  onChange: (path: string, value: unknown) => void;
}) {
  const hero = sections.hero ?? {};
  const stats = hero.stats ?? [
    { value: "", label: "" },
    { value: "", label: "" },
    { value: "", label: "" },
  ];
  return (
    <div className="space-y-6 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900">Hero section</h3>
      <Field
        label="Heading (highlight word goes in next field)"
        value={hero.heading ?? ""}
        onChange={onChange}
        path="hero.heading"
        placeholder="Welcome to our ... Online Store!"
      />
      <Field
        label="Heading highlight word"
        value={hero.heading_highlight ?? ""}
        onChange={onChange}
        path="hero.heading_highlight"
        placeholder="Samsung"
      />
      <RichTextSectionField
        label="Subtext"
        value={hero.subtext ?? ""}
        onChange={onChange}
        path="hero.subtext"
        placeholder="Experience the power of innovation..."
      />
      <Field
        label="Primary button text"
        value={hero.cta_primary_text ?? ""}
        onChange={onChange}
        path="hero.cta_primary_text"
      />
      <Field
        label="Primary button link"
        value={hero.cta_primary_href ?? ""}
        onChange={onChange}
        path="hero.cta_primary_href"
        placeholder="/shop"
      />
      <Field
        label="Secondary button text"
        value={hero.cta_secondary_text ?? ""}
        onChange={onChange}
        path="hero.cta_secondary_text"
      />
      <Field
        label="Secondary button link"
        value={hero.cta_secondary_href ?? ""}
        onChange={onChange}
        path="hero.cta_secondary_href"
        placeholder="/about-us"
      />
      <Field
        label="Hero image URL"
        value={hero.image_url ?? ""}
        onChange={onChange}
        path="hero.image_url"
        placeholder="/images/products/s25.jpg"
      />
      <Field
        label="Hero image alt"
        value={hero.image_alt ?? ""}
        onChange={onChange}
        path="hero.image_alt"
      />
      <Field
        label="Badge text"
        value={hero.badge_text ?? ""}
        onChange={onChange}
        path="hero.badge_text"
        placeholder="Save up to"
      />
      <Field
        label="Badge value"
        value={hero.badge_value ?? ""}
        onChange={onChange}
        path="hero.badge_value"
        placeholder="30% OFF"
      />
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Stats (3 items)
        </label>
        {stats.map((s, i) => (
          <div key={i} className="flex gap-2 mb-2">
            <input
              type="text"
              value={s.value}
              onChange={(e) => {
                const next = [...stats];
                next[i] = { ...next[i], value: e.target.value };
                onChange("hero.stats", next);
              }}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="500+"
            />
            <input
              type="text"
              value={s.label}
              onChange={(e) => {
                const next = [...stats];
                next[i] = { ...next[i], label: e.target.value };
                onChange("hero.stats", next);
              }}
              className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
              placeholder="Products"
            />
          </div>
        ))}
      </div>
    </div>
  );
}

function AboutSectionEditor({
  sections,
  onChange,
}: {
  sections: AboutSections;
  onChange: (path: string, value: unknown) => void;
}) {
  const hero = sections.hero ?? {};
  const story = sections.story ?? {};
  const values = sections.values ?? {};
  const visit = sections.visit_us ?? {};
  const stats = sections.stats ?? [];
  const items = values.items ?? [];
  const paragraphs = story.paragraphs ?? ["", "", "", ""];

  return (
    <div className="space-y-8 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900">Hero</h3>
      <Field
        label="Title"
        value={hero.title ?? ""}
        onChange={onChange}
        path="hero.title"
      />
      <RichTextSectionField
        label="Subtitle"
        value={hero.subtitle ?? ""}
        onChange={onChange}
        path="hero.subtitle"
        placeholder="Your trusted destination for authentic Samsung products."
      />

      <h3 className="text-lg font-semibold text-gray-900">Stats</h3>
      {[0, 1, 2, 3].map((i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={stats[i]?.number ?? ""}
            onChange={(e) => {
              const next = [...stats];
              next[i] = { number: e.target.value, label: next[i]?.label ?? "" };
              onChange("stats", next);
            }}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="50K+"
          />
          <input
            type="text"
            value={stats[i]?.label ?? ""}
            onChange={(e) => {
              const next = [...stats];
              next[i] = {
                number: next[i]?.number ?? "",
                label: e.target.value,
              };
              onChange("stats", next);
            }}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Happy Customers"
          />
        </div>
      ))}

      <h3 className="text-lg font-semibold text-gray-900">Our Story</h3>
      <Field
        label="Section title"
        value={story.title ?? ""}
        onChange={onChange}
        path="story.title"
      />
      {paragraphs.map((p, i) => (
        <RichTextSectionField
          key={i}
          label={`Paragraph ${i + 1}`}
          value={p}
          onChange={(_path, v) => {
            const next = [...paragraphs];
            next[i] = v as string;
            onChange("story.paragraphs", next);
          }}
          path={`story.paragraphs.${i}`}
          placeholder="Add a rich paragraph about your brand story..."
        />
      ))}
      <Field
        label="Story image URL"
        value={story.image_url ?? ""}
        onChange={onChange}
        path="story.image_url"
      />
      <Field
        label="Image alt"
        value={story.image_alt ?? ""}
        onChange={onChange}
        path="story.image_alt"
      />
      <Field
        label="Caption title"
        value={story.caption_title ?? ""}
        onChange={onChange}
        path="story.caption_title"
      />
      <Field
        label="Caption subtitle"
        value={story.caption_subtitle ?? ""}
        onChange={onChange}
        path="story.caption_subtitle"
      />

      <h3 className="text-lg font-semibold text-gray-900">Why Choose Us</h3>
      <Field
        label="Section title"
        value={values.section_title ?? ""}
        onChange={onChange}
        path="values.section_title"
      />
      <Field
        label="Section subtitle"
        value={values.section_subtitle ?? ""}
        onChange={onChange}
        path="values.section_subtitle"
        multiline
      />
      {items.slice(0, 6).map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 p-4 space-y-2"
        >
          <span className="text-sm font-medium text-gray-500">
            Value {i + 1}
          </span>
          <Field
            label="Title"
            value={item.title}
            onChange={(_path, v) => {
              const next = [...items];
              next[i] = { ...next[i], title: v as string };
              onChange("values.items", next);
            }}
            path="values.items"
          />
          <Field
            label="Description"
            value={item.description}
            onChange={(_path, v) => {
              const next = [...items];
              next[i] = { ...next[i], description: v as string };
              onChange("values.items", next);
            }}
            path="values.items"
            multiline
          />
          <Field
            label="Color (Tailwind gradient, e.g. from-gray-700 to-gray-900)"
            value={item.color}
            onChange={(_path, v) => {
              const next = [...items];
              next[i] = { ...next[i], color: v as string };
              onChange("values.items", next);
            }}
            path="values.items"
          />
        </div>
      ))}

      <h3 className="text-lg font-semibold text-gray-900">Visit Us</h3>
      <Field
        label="Title"
        value={visit.title ?? ""}
        onChange={onChange}
        path="visit_us.title"
      />
      <Field
        label="Address label"
        value={visit.address_label ?? ""}
        onChange={onChange}
        path="visit_us.address_label"
      />
      <Field
        label="Address (multiline)"
        value={visit.address_lines ?? ""}
        onChange={onChange}
        path="visit_us.address_lines"
        multiline
      />
      <Field
        label="Hours label"
        value={visit.hours_label ?? ""}
        onChange={onChange}
        path="visit_us.hours_label"
      />
      <Field
        label="Hours"
        value={visit.hours_lines ?? ""}
        onChange={onChange}
        path="visit_us.hours_lines"
        multiline
      />
      <Field
        label="Contact label"
        value={visit.contact_label ?? ""}
        onChange={onChange}
        path="visit_us.contact_label"
      />
      <Field
        label="Contact"
        value={visit.contact_lines ?? ""}
        onChange={onChange}
        path="visit_us.contact_lines"
        multiline
      />
      <Field
        label="Directions title"
        value={visit.directions_title ?? ""}
        onChange={onChange}
        path="visit_us.directions_title"
      />
      <Field
        label="Directions text"
        value={visit.directions_text ?? ""}
        onChange={onChange}
        path="visit_us.directions_text"
        multiline
      />
      <Field
        label="Directions button"
        value={visit.directions_btn ?? ""}
        onChange={onChange}
        path="visit_us.directions_btn"
      />
      <Field
        label="Map link"
        value={visit.map_link ?? ""}
        onChange={onChange}
        path="visit_us.map_link"
      />
    </div>
  );
}

function ContactSectionEditor({
  sections,
  onChange,
}: {
  sections: ContactSections;
  onChange: (path: string, value: unknown) => void;
}) {
  const hero = sections.hero ?? {};
  const methods = sections.contact_methods ?? [];
  const formIntro = sections.form_intro ?? {};
  const storeHours = sections.store_hours ?? {};
  const location = sections.location ?? {};
  const faqs = sections.faqs ?? {};
  const whatsapp = sections.whatsapp_block ?? {};
  const faqItems = faqs.items ?? [];

  return (
    <div className="space-y-8 border-t border-gray-200 pt-6">
      <h3 className="text-lg font-semibold text-gray-900">Hero</h3>
      <Field
        label="Title"
        value={hero.title ?? ""}
        onChange={onChange}
        path="hero.title"
      />
      <Field
        label="Subtitle"
        value={hero.subtitle ?? ""}
        onChange={onChange}
        path="hero.subtitle"
        multiline
      />

      <h3 className="text-lg font-semibold text-gray-900">
        Contact methods (4)
      </h3>
      {[0, 1, 2, 3].map((i) => {
        const m = methods[i] ?? {
          title: "",
          details: "",
          description: "",
          link: "",
          color: "from-gray-700 to-gray-900",
        };
        return (
          <div
            key={i}
            className="rounded-lg border border-gray-200 p-4 space-y-2"
          >
            <Field
              label={`Method ${i + 1} title`}
              value={m.title}
              onChange={(_path, v) => {
                const next = [...methods];
                next[i] = { ...next[i], title: v as string };
                onChange("contact_methods", next);
              }}
              path="contact_methods"
            />
            <Field
              label="Details"
              value={m.details}
              onChange={(_path, v) => {
                const next = [...methods];
                next[i] = { ...next[i], details: v as string };
                onChange("contact_methods", next);
              }}
              path="contact_methods"
            />
            <Field
              label="Description"
              value={m.description}
              onChange={(_path, v) => {
                const next = [...methods];
                next[i] = { ...next[i], description: v as string };
                onChange("contact_methods", next);
              }}
              path="contact_methods"
            />
            <Field
              label="Link"
              value={m.link}
              onChange={(_path, v) => {
                const next = [...methods];
                next[i] = { ...next[i], link: v as string };
                onChange("contact_methods", next);
              }}
              path="contact_methods"
            />
          </div>
        );
      })}

      <h3 className="text-lg font-semibold text-gray-900">Form intro</h3>
      <Field
        label="Title"
        value={formIntro.title ?? ""}
        onChange={onChange}
        path="form_intro.title"
      />
      <Field
        label="Subtitle"
        value={formIntro.subtitle ?? ""}
        onChange={onChange}
        path="form_intro.subtitle"
        multiline
      />

      <h3 className="text-lg font-semibold text-gray-900">Store hours</h3>
      <Field
        label="Title"
        value={storeHours.title ?? ""}
        onChange={onChange}
        path="store_hours.title"
      />
      {(storeHours.rows ?? []).map((row, i) => (
        <div key={i} className="flex gap-2">
          <input
            type="text"
            value={row.days}
            onChange={(e) => {
              const next = [...(storeHours.rows ?? [])];
              next[i] = { ...next[i], days: e.target.value };
              onChange("store_hours.rows", next);
            }}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="Monday - Saturday"
          />
          <input
            type="text"
            value={row.hours}
            onChange={(e) => {
              const next = [...(storeHours.rows ?? [])];
              next[i] = { ...next[i], hours: e.target.value };
              onChange("store_hours.rows", next);
            }}
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm"
            placeholder="9:00 AM - 7:00 PM"
          />
        </div>
      ))}

      <h3 className="text-lg font-semibold text-gray-900">Location</h3>
      <Field
        label="Title"
        value={location.title ?? ""}
        onChange={onChange}
        path="location.title"
      />
      <Field
        label="Name"
        value={location.name ?? ""}
        onChange={onChange}
        path="location.name"
      />
      <Field
        label="Address"
        value={location.address_lines ?? ""}
        onChange={onChange}
        path="location.address_lines"
        multiline
      />
      <Field
        label="Map button text"
        value={location.map_link_text ?? ""}
        onChange={onChange}
        path="location.map_link_text"
      />
      <Field
        label="Map link"
        value={location.map_link ?? ""}
        onChange={onChange}
        path="location.map_link"
      />

      <h3 className="text-lg font-semibold text-gray-900">FAQs</h3>
      <Field
        label="Section title"
        value={faqs.section_title ?? ""}
        onChange={onChange}
        path="faqs.section_title"
      />
      <Field
        label="Section subtitle"
        value={faqs.section_subtitle ?? ""}
        onChange={onChange}
        path="faqs.section_subtitle"
      />
      {faqItems.slice(0, 6).map((item, i) => (
        <div
          key={i}
          className="rounded-lg border border-gray-200 p-4 space-y-2"
        >
          <Field
            label={`Q ${i + 1}`}
            value={item.question}
            onChange={(_path, v) => {
              const next = [...faqItems];
              next[i] = { ...next[i], question: v as string };
              onChange("faqs.items", next);
            }}
            path="faqs.items"
          />
          <Field
            label="Answer"
            value={item.answer}
            onChange={(_path, v) => {
              const next = [...faqItems];
              next[i] = { ...next[i], answer: v as string };
              onChange("faqs.items", next);
            }}
            path="faqs.items"
            multiline
          />
        </div>
      ))}
      <Field
        label="CTA text"
        value={faqs.cta_text ?? ""}
        onChange={onChange}
        path="faqs.cta_text"
      />
      <Field
        label="CTA button"
        value={faqs.cta_btn ?? ""}
        onChange={onChange}
        path="faqs.cta_btn"
      />

      <h3 className="text-lg font-semibold text-gray-900">WhatsApp block</h3>
      <Field
        label="Title"
        value={whatsapp.title ?? ""}
        onChange={onChange}
        path="whatsapp_block.title"
      />
      <Field
        label="Subtitle"
        value={whatsapp.subtitle ?? ""}
        onChange={onChange}
        path="whatsapp_block.subtitle"
      />
      <Field
        label="Button text"
        value={whatsapp.btn_text ?? ""}
        onChange={onChange}
        path="whatsapp_block.btn_text"
      />
      <Field
        label="Link"
        value={whatsapp.link ?? ""}
        onChange={onChange}
        path="whatsapp_block.link"
      />
    </div>
  );
}
