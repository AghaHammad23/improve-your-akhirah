import { lang } from "next/root-params";
import { notFound } from "next/navigation";
import { isLocale, type Locale } from "./config";
import type en from "./dictionaries/en.json";

/** English is the reference shape; ur and ar must provide every key (type-checked below). */
export type Dictionary = typeof en;

const dictionaries: Record<Locale, () => Promise<Dictionary>> = {
  ur: () => import("./dictionaries/ur.json").then((m) => m.default),
  en: () => import("./dictionaries/en.json").then((m) => m.default),
  ar: () => import("./dictionaries/ar.json").then((m) => m.default),
};

/** The current request's locale, read from the [lang] root segment. */
export async function getLocale(): Promise<Locale> {
  const value = await lang();
  if (!isLocale(value)) notFound();
  return value;
}

/** UI strings for the current locale. Server-only (root params are not available in Client Components). */
export async function getDictionary(): Promise<Dictionary> {
  return dictionaries[await getLocale()]();
}
