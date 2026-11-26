"use client";

import Link from "next/link";
import { useDeferredValue, useId, useState } from "react";
import { SearchIcon } from "@/components/icons";
import { fill } from "@/lib/format";
import { asciiDigits, normalizeArabic, normalizeLatin } from "@/lib/text-match";

export type NameCard = {
  n: number;
  /** The number in the locale's digits. */
  numberText: string;
  ar: string;
  translit: string;
  /** Meaning in the page language (none on the Arabic page). */
  meaning?: string;
  /** Searchable meanings in every language, so an English word also works on the Urdu page. */
  search: string;
  ref?: { label: string; href: string };
};

/** The 99 Names as cards, with a filter by name, meaning or number. */
export function NamesList({
  names,
  locale,
  labels,
}: {
  names: NameCard[];
  locale: string;
  labels: { search: string; placeholder: string; noResults: string; count: string; numberLabel: string };
}) {
  const [query, setQuery] = useState("");
  const deferred = asciiDigits(useDeferredValue(query.trim()));
  const inputId = useId();

  const qLatin = normalizeLatin(deferred);
  const qArabic = normalizeArabic(deferred);
  const qLower = deferred.toLowerCase();
  const filtered = deferred
    ? names.filter(
        (x) =>
          String(x.n) === deferred ||
          (qLatin && normalizeLatin(x.translit).includes(qLatin)) ||
          (qArabic && normalizeArabic(x.ar).includes(qArabic)) ||
          x.search.toLowerCase().includes(qLower),
      )
    : names;

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
      <p role="status" className="mt-3 text-center text-sm text-muted">
        {deferred ? fill(labels.count, { n: new Intl.NumberFormat(locale).format(filtered.length) }) : ""}
      </p>

      {filtered.length === 0 ? (
        <p className="mt-8 text-center text-muted">{labels.noResults}</p>
      ) : (
        <ul className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((x) => (
            <li key={x.n} id={`name-${x.n}`} className="glass flex min-w-0 flex-col rounded-2xl p-4 text-center">
              <span className="flex min-h-11 items-center justify-between gap-2">
                <span className="star-badge shrink-0">
                  <span aria-hidden="true">{x.numberText}</span>
                  <span className="sr-only">{fill(labels.numberLabel, { n: x.numberText })}</span>
                </span>
                {x.ref && (
                  <Link
                    href={x.ref.href}
                    className="inline-flex min-h-11 items-center rounded-full px-3 text-xs font-semibold text-accent underline-offset-4 hover:underline"
                  >
                    {x.ref.label}
                  </Link>
                )}
              </span>
              <span lang="ar" dir="rtl" className="font-quran mt-1 block text-4xl leading-[1.8] text-ink">
                {x.ar}
              </span>
              <span lang="en" dir="ltr" className="font-heading block text-xl font-bold text-accent">
                {x.translit}
              </span>
              {x.meaning && <span className="mt-1 block text-sm leading-relaxed text-muted">{x.meaning}</span>}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
