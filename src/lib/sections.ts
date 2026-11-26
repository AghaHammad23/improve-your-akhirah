/** Top-level sections of the site, in navigation order. `key` points into dictionary `nav`. */
export const sections = [
  { slug: "quran", key: "quran", ready: true },
  { slug: "hadith", key: "hadith", ready: true },
  { slug: "search", key: "search", ready: true },
  { slug: "prayer-times", key: "prayerTimes", ready: false },
  { slug: "duas", key: "duas", ready: false },
  { slug: "tools", key: "tools", ready: true },
] as const;

/** Sections that exist only as "coming soon" placeholders for now. Remove a slug when its real route ships. */
export const placeholderSlugs = ["prayer-times", "duas", "sources"] as const;

export type SectionKey = (typeof sections)[number]["key"];
