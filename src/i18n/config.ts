export const locales = ["ur", "en", "ar"] as const;

export type Locale = (typeof locales)[number];

/** Used when the browser's languages don't match any supported locale. */
export const defaultLocale: Locale = "ur";

export const localeNames: Record<Locale, string> = {
  ur: "اردو",
  en: "English",
  ar: "العربية",
};

export const localeDir: Record<Locale, "rtl" | "ltr"> = {
  ur: "rtl",
  en: "ltr",
  ar: "rtl",
};

export function isLocale(value: string): value is Locale {
  return (locales as readonly string[]).includes(value);
}

/** Cookie that remembers the language a visitor picked. */
export const LOCALE_COOKIE = "lang";
