/**
 * Navigation config for header and shop filters.
 * Slugs must match category slugs in DB (seed). All links go to /shop?category=<slug>.
 */
export type NavCategoryItem = { slug: string; label: string };

/** Top-level nav items that link directly to /shop?category=<slug> */
export const NAV_TOP_LINKS: NavCategoryItem[] = [
  { slug: "galaxy-s-series", label: "Galaxy S Series" },
  { slug: "galaxy-a-series", label: "Galaxy A Series" },
  { slug: "foldable-phones", label: "Foldable Phones" },
  { slug: "galaxy-tab-a", label: "Galaxy Tab A" },
  { slug: "galaxy-tab-s", label: "Galaxy Tab S" },
  { slug: "wearables", label: "Wearables" },
];

/** Accessories dropdown items */
export const NAV_ACCESSORIES_LINKS: NavCategoryItem[] = [
  { slug: "accessories", label: "All Accessories" },
  { slug: "chargers-adapters", label: "Chargers & Adapters" },
  { slug: "cases-covers", label: "Cases & Covers" },
  { slug: "cables", label: "Cables" },
  { slug: "power-banks", label: "Power Banks" },
  { slug: "smarttags", label: "SmartTags" },
];

/** All category slugs used in nav (for shop page filter options) */
export const ALL_NAV_CATEGORY_SLUGS = [
  ...NAV_TOP_LINKS.map((c) => c.slug),
  ...NAV_ACCESSORIES_LINKS.map((c) => c.slug),
  "galaxy-buds",
];
