"use client";

import { defaultReciter } from "./reciters";

/** Reading and listening preferences, saved in this browser (synced to the account later). */
export type ReaderPrefs = {
  tr: { ur: boolean; en: boolean };
  /** Arabic text scale, 0.8–1.8. */
  size: number;
  reciter: string;
  /** Times each verse is played (0 = repeat forever). */
  repeat: number;
  speed: number;
  follow: boolean;
};

export const PREFS_KEY = "reader:v1";

export const SIZE_MIN = 0.8;
export const SIZE_MAX = 1.8;
export const SIZE_STEP = 0.1;

export function defaultPrefs(locale: string): ReaderPrefs {
  return {
    tr: { ur: locale === "ur", en: locale === "en" },
    size: 1,
    reciter: defaultReciter,
    repeat: 1,
    speed: 1,
    follow: true,
  };
}

const listeners = new Set<() => void>();

export function subscribePrefs(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => {
    if (e.key === PREFS_KEY) onChange();
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

/** Raw saved JSON (a string keeps useSyncExternalStore snapshots stable). */
export function readPrefsRaw(): string | null {
  try {
    return localStorage.getItem(PREFS_KEY);
  } catch {
    return null;
  }
}

export function parsePrefs(raw: string | null, locale: string): ReaderPrefs {
  const base = defaultPrefs(locale);
  if (!raw) return base;
  try {
    const saved = JSON.parse(raw) as Partial<ReaderPrefs>;
    return { ...base, ...saved, tr: { ...base.tr, ...saved.tr } };
  } catch {
    return base;
  }
}

export function savePrefs(prefs: ReaderPrefs) {
  try {
    localStorage.setItem(PREFS_KEY, JSON.stringify(prefs));
  } catch {
    // Private mode etc.: settings still apply until the page is left.
  }
  listeners.forEach((l) => l());
}

/**
 * Applies display prefs to the reader element. Shared with the inline pre-paint script,
 * so keep it dependency-free.
 */
export function applyPrefsToReader(el: HTMLElement, prefs: Pick<ReaderPrefs, "tr" | "size">) {
  el.dataset.trUr = String(prefs.tr.ur);
  el.dataset.trEn = String(prefs.tr.en);
  el.style.setProperty("--quran-scale", String(prefs.size));
}
