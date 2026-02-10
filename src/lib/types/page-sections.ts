/**
 * Types for dynamic page sections (home, about-us, contact-us).
 * Matches the structure stored in pages.sections JSONB.
 */

export const SITE_PAGE_SLUGS = ["home", "about-us", "contact-us"] as const;
export type SitePageSlug = (typeof SITE_PAGE_SLUGS)[number];

export type HeroStat = { value: string; label: string };

export type HomeSections = {
  hero?: {
    heading?: string;
    heading_highlight?: string;
    subtext?: string;
    cta_primary_text?: string;
    cta_primary_href?: string;
    cta_secondary_text?: string;
    cta_secondary_href?: string;
    image_url?: string;
    image_alt?: string;
    badge_text?: string;
    badge_value?: string;
    stats?: HeroStat[];
  };
};

export type AboutSections = {
  hero?: { title?: string; subtitle?: string };
  stats?: { number: string; label: string }[];
  story?: {
    title?: string;
    paragraphs?: string[];
    image_url?: string;
    image_alt?: string;
    caption_title?: string;
    caption_subtitle?: string;
  };
  values?: {
    section_title?: string;
    section_subtitle?: string;
    items?: { title: string; description: string; color: string }[];
  };
  visit_us?: {
    title?: string;
    address_label?: string;
    address_lines?: string;
    hours_label?: string;
    hours_lines?: string;
    contact_label?: string;
    contact_lines?: string;
    directions_title?: string;
    directions_text?: string;
    directions_btn?: string;
    map_link?: string;
  };
};

export type ContactMethod = {
  title: string;
  details: string;
  description: string;
  link: string;
  color: string;
};

export type ContactSections = {
  hero?: { title?: string; subtitle?: string };
  contact_methods?: ContactMethod[];
  form_intro?: { title?: string; subtitle?: string };
  store_hours?: {
    title?: string;
    rows?: { days: string; hours: string }[];
  };
  location?: {
    title?: string;
    name?: string;
    address_lines?: string;
    map_link_text?: string;
    map_link?: string;
  };
  faqs?: {
    section_title?: string;
    section_subtitle?: string;
    items?: { question: string; answer: string }[];
    cta_text?: string;
    cta_btn?: string;
  };
  whatsapp_block?: {
    title?: string;
    subtitle?: string;
    btn_text?: string;
    link?: string;
  };
};

export type PageSections = HomeSections | AboutSections | ContactSections;

export type PageWithSections = {
  id: string;
  title: string;
  slug: string;
  content: string | null;
  excerpt: string | null;
  template: string | null;
  meta_title: string | null;
  meta_description: string | null;
  status: string | null;
  sections: PageSections | null;
  created_at: string | null;
  updated_at: string | null;
  published_at: string | null;
};
