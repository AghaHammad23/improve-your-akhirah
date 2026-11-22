"use client";

import Link from "next/link";
import { useDeferredValue, useId, useState } from "react";
import { SearchIcon } from "@/components/icons";

export type SurahCard = {
  number: number;
  nameArabic: string;
  transliteration: string;
  meaning?: string;
  /** Pre-formatted, e.g. "7 verses · Makki" */
  details: string;
  numberLabel: string;
  /** The number in the locale's digits. */
  numberText: string;
};

/** Strips Arabic diacritics/Quranic marks and the definite article so "يس" matches "يسٓ". */
function normalizeArabic(s: string) {
  return s
    .replace(/[ً-ٰٟۖ-ۭـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/ى/g, "ي")
    .replace(/ة/g, "ه")
    .replace(/^ال/, "")
    .replace(/\s+/g, "");
}

/** Latin names: lowercase, letters only, collapse doubled vowels ("Yaseen" ~ "yasin"). */
function normalizeLatin(s: string) {
  return s
    .toLowerCase()
    .replace(/^(al|an|ar|as|at|ad|adh|ash|az|aal)-/, "")
    .replace(/[^a-z]/g, "")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/aa/g, "a");
}

export function SurahIndex({
  surahs,
  locale,
  labels,
}: {
  surahs: SurahCard[];
  locale: string;
  labels: { search: string; placeholder: string; noResults: string };
}) {
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query.trim());
  const inputId = useId();

  const qLatin = normalizeLatin(deferred);
  const qArabic = normalizeArabic(deferred);
  const filtered = deferred
    ? surahs.filter(
        (s) =>
          String(s.number) === deferred ||
          (qLatin && normalizeLatin(s.transliteration).includes(qLatin)) ||
          (qLatin && s.meaning?.toLowerCase().includes(deferred.toLowerCase())) ||
          (qArabic && normalizeArabic(s.nameArabic).includes(qArabic)),
      )
    : surahs;

  const arabicFirst = locale !== "en";

  return (
    <div>
      <div className="relative mx-auto max-w-xl">
        <label htmlFor={inputId} className="sr-only">
          {labels.search}
        </label>
        <SearchIcon className="pointer-events-none absolute inset-s-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={labels.placeholder}
          autoComplete="off"
          className="glass min-h-13 w-full rounded-full ps-12 pe-5 text-base text-ink placeholder:text-muted/80 focus:border-gold-500 focus:outline-none"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="mt-10 text-center text-muted">{labels.noResults}</p>
      ) : (
        <ul className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((s) => (
            <li key={s.number}>
              <Link
                href={`/${locale}/quran/${s.number}`}
                className="glass card-premium group flex min-h-20 items-center gap-4 rounded-2xl p-4"
              >
                <span className="star-badge shrink-0" aria-label={s.numberLabel}>
                  <span>{s.numberText}</span>
                </span>
                <span className="min-w-0 flex-1">
                  {arabicFirst ? (
                    <>
                      <span lang="ar" dir="rtl" className="font-quran block text-2xl leading-tight text-ink">
                        {s.nameArabic}
                      </span>
                      <span lang="en" dir="ltr" className="mt-1 block truncate font-sans text-sm text-muted">
                        {s.transliteration} · {s.details}
                      </span>
                    </>
                  ) : (
                    <>
                      <span className="font-heading block truncate text-xl font-bold text-ink group-hover:text-accent">
                        {s.transliteration}
                      </span>
                      <span className="block truncate text-sm text-muted">
                        {s.meaning} · {s.details}
                      </span>
                    </>
                  )}
                </span>
                {!arabicFirst && (
                  <span lang="ar" dir="rtl" className="font-quran shrink-0 text-2xl text-accent">
                    {s.nameArabic}
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
