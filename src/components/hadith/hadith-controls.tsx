"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import {
  applyPrefsToReader,
  parsePrefs,
  readPrefsRaw,
  savePrefs,
  SIZE_MAX,
  SIZE_MIN,
  SIZE_STEP,
  subscribePrefs,
  type ReaderPrefs,
} from "@/lib/reader-prefs";

export type HadithControlsLabels = {
  translations: string;
  urdu: string;
  english: string;
  textSize: string;
  smaller: string;
  larger: string;
  copied: string;
  linkCopied: string;
  copyFailed: string;
};

/**
 * Sticky toolbar for a hadith chapter page. The hadith are server-rendered; this component
 * drives them through the DOM: it sets data attributes on #reader (translations shown, text size,
 * shared with the Quran reader's saved prefs) and handles the [data-copy-hadith]/[data-share-hadith] buttons.
 */
export function HadithControls({
  locale,
  bookName,
  pagePath,
  labels,
}: {
  locale: string;
  /** Book name in the reader's language, used in the shared reference ("Sahih al-Bukhari 1"). */
  bookName: string;
  /** Path of this page including the locale, e.g. /en/hadith/bukhari/64/page/2. */
  pagePath: string;
  labels: HadithControlsLabels;
}) {
  const raw = useSyncExternalStore(subscribePrefs, readPrefsRaw, () => null);
  const prefs = useMemo(() => parsePrefs(raw, locale), [raw, locale]);
  const [toast, setToast] = useState<string | null>(null);

  const update = useCallback(
    (patch: Partial<ReaderPrefs>) => savePrefs({ ...parsePrefs(readPrefsRaw(), locale), ...patch }),
    [locale],
  );

  useEffect(() => {
    const el = document.getElementById("reader");
    if (el) applyPrefsToReader(el, prefs);
  }, [prefs]);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  // Open at the hadith in the URL (#h-52), on load and when the hash changes.
  useEffect(() => {
    const fromHash = () => {
      const m = /^#(h-\d+(?:\.\d+)?)$/.exec(window.location.hash);
      const el = m && document.getElementById(m[1]);
      if (!el) return;
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
      el.removeAttribute("data-flash");
      void el.offsetWidth; // restart the flash animation
      el.setAttribute("data-flash", "true");
      el.tabIndex = -1;
      el.focus({ preventScroll: true });
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, []);

  // Copy and share buttons rendered next to each hadith.
  useEffect(() => {
    const root = document.getElementById("reader");
    if (!root) return;
    const onClick = async (e: MouseEvent) => {
      const target = e.target as Element;
      const copyBtn = target.closest<HTMLElement>("[data-copy-hadith]");
      const shareBtn = target.closest<HTMLElement>("[data-share-hadith]");
      if (!copyBtn && !shareBtn) return;
      const n = (copyBtn ? copyBtn.dataset.copyHadith : shareBtn!.dataset.shareHadith) ?? "";
      const item = document.getElementById(`h-${n}`);
      if (!item) return;
      // Arabic plus the translations currently shown (skipping "not available" notes).
      const parts = [item.querySelector(".hadith-ar")?.textContent?.trim() ?? ""];
      for (const lang of ["ur", "en"] as const) {
        if (root.dataset[lang === "ur" ? "trUr" : "trEn"] !== "true") continue;
        parts.push(item.querySelector(`.tr-${lang}:not(.tr-missing)`)?.textContent?.replace(/\s+/g, " ").trim() ?? "");
      }
      const reference = `${bookName} ${n}`;
      const url = `${window.location.origin}${pagePath}#h-${n}`;
      const text = `${parts.filter(Boolean).join("\n\n")}\n\n(${reference})`;
      try {
        if (shareBtn && typeof navigator.share === "function") {
          await navigator.share({ title: reference, text, url });
          return;
        }
        await navigator.clipboard.writeText(copyBtn ? `${text}\n${url}` : url);
        setToast(copyBtn ? labels.copied : labels.linkCopied);
      } catch (err) {
        // Closing the share sheet is not an error.
        if (!(err instanceof DOMException && err.name === "AbortError")) setToast(labels.copyFailed);
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [bookName, pagePath, labels.copied, labels.linkCopied, labels.copyFailed]);

  return (
    <>
      <div className="sticky top-16 z-40 border-b border-line/60 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-end gap-2 px-4 py-2">
          <div role="group" aria-label={labels.translations} className="flex gap-1">
            {(["ur", "en"] as const).map((lang) => (
              <button
                key={lang}
                type="button"
                aria-pressed={prefs.tr[lang]}
                onClick={() => update({ tr: { ...prefs.tr, [lang]: !prefs.tr[lang] } })}
                className="chip"
              >
                {lang === "ur" ? labels.urdu : labels.english}
              </button>
            ))}
          </div>
          <div role="group" aria-label={labels.textSize} className="flex gap-1">
            <button
              type="button"
              aria-label={labels.smaller}
              title={labels.smaller}
              disabled={prefs.size <= SIZE_MIN}
              onClick={() => update({ size: Math.max(SIZE_MIN, +(prefs.size - SIZE_STEP).toFixed(1)) })}
              className="chip w-11 justify-center px-0"
            >
              <span aria-hidden="true" className="text-sm font-bold">
                A−
              </span>
            </button>
            <button
              type="button"
              aria-label={labels.larger}
              title={labels.larger}
              disabled={prefs.size >= SIZE_MAX}
              onClick={() => update({ size: Math.min(SIZE_MAX, +(prefs.size + SIZE_STEP).toFixed(1)) })}
              className="chip w-11 justify-center px-0"
            >
              <span aria-hidden="true" className="text-lg font-bold">
                A+
              </span>
            </button>
          </div>
        </div>
      </div>

      <p
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 bottom-6 z-50 mx-auto w-fit rounded-full bg-brand-900/95 px-5 py-2.5 text-sm font-semibold text-cream-100 shadow-lg backdrop-blur transition-all duration-300 ${
          toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"
        }`}
      >
        {toast}
      </p>
    </>
  );
}
