"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { fill, formatNumber } from "@/lib/format";
import type { HadithSearchResponse, HadithSearchResult } from "@/lib/search/hadith-search";
import { queryTokens } from "@/lib/search/normalize";
import { SnippetText } from "./snippet-text";

export type HadithResultsLabels = {
  loading: string;
  loadError: string;
  retry: string;
  results: string;
  noResults: string;
  showMore: string;
  allBooks: string;
  filterLabel: string;
  hadithLabel: string;
  arabic: string;
  urdu: string;
  english: string;
};

type Loaded = { key: string; total: number; books: HadithSearchResponse["books"]; results: HadithSearchResult[] };

function fetchPage(q: string, book: string, offset: number, signal?: AbortSignal): Promise<HadithSearchResponse> {
  const params = new URLSearchParams({ q });
  if (book) params.set("book", book);
  if (offset) params.set("offset", String(offset));
  return fetch(`/api/search/hadith?${params}`, { signal }).then((r) => {
    if (!r.ok) throw new Error(String(r.status));
    return r.json() as Promise<HadithSearchResponse>;
  });
}

/** Hadith results for a settled query; the search runs on the server (/api/search/hadith). */
export function HadithResults({
  query,
  locale,
  bookNames,
  labels,
}: {
  query: string;
  locale: string;
  /** Book slug → name in the reader's language, in display order. */
  bookNames: [string, string][];
  labels: HadithResultsLabels;
}) {
  const [book, setBook] = useState("");
  const [attempt, setAttempt] = useState(0);
  const [loaded, setLoaded] = useState<Loaded | null>(null);
  const [failed, setFailed] = useState<string | null>(null);
  const [loadingMore, setLoadingMore] = useState(false);
  // Per-book counts (the server counts before the book filter), kept while a filtered request loads.
  const [counts, setCounts] = useState<{ phrase: string; books: HadithSearchResponse["books"] } | null>(null);

  const { phrase } = useMemo(() => queryTokens(query), [query]);
  const key = `${phrase}|${book}|${attempt}`;

  useEffect(() => {
    if (!phrase) return;
    const ctrl = new AbortController();
    fetchPage(query, book, 0, ctrl.signal)
      .then((data) => {
        setLoaded({ key, ...data });
        setCounts({ phrase, books: data.books });
      })
      .catch((err: unknown) => {
        if (!(err instanceof DOMException && err.name === "AbortError")) setFailed(key);
      });
    return () => ctrl.abort();
  }, [phrase, query, book, key]);

  const current = loaded?.key === key ? loaded : null;
  const status = !phrase ? "idle" : current ? "ready" : failed === key ? "error" : "loading";
  const names = Object.fromEntries(bookNames);
  const langLabel = { ar: labels.arabic, ur: labels.urdu, en: labels.english };

  async function showMore() {
    if (!current) return;
    setLoadingMore(true);
    try {
      const data = await fetchPage(query, book, current.results.length);
      setLoaded((prev) => (prev && prev.key === key ? { ...prev, results: [...prev.results, ...data.results] } : prev));
    } catch {
      setFailed(key);
    } finally {
      setLoadingMore(false);
    }
  }

  const bookCounts = counts?.phrase === phrase ? counts.books : undefined;
  const allCount = bookCounts ? Object.values(bookCounts).reduce((a, b) => a + (b ?? 0), 0) : 0;

  return (
    <>
      <div aria-live="polite" className="mt-6">
        {status === "loading" && <p className="text-sm text-muted">{labels.loading}</p>}
        {status === "error" && (
          <p className="text-sm text-ink">
            {labels.loadError}{" "}
            <button type="button" onClick={() => setAttempt((a) => a + 1)} className="chip ms-1">
              {labels.retry}
            </button>
          </p>
        )}
        {status === "ready" && (
          <p className="text-sm font-semibold text-muted">
            {current!.total ? fill(labels.results, { n: formatNumber(locale, current!.total) }) : labels.noResults}
          </p>
        )}
      </div>

      {phrase && bookCounts && allCount > 0 && (
        <div role="group" aria-label={labels.filterLabel} className="mt-4 flex flex-wrap gap-1.5">
          <button type="button" aria-pressed={!book} onClick={() => setBook("")} className="chip">
            {labels.allBooks} ({formatNumber(locale, allCount)})
          </button>
          {bookNames
            .filter(([slug]) => bookCounts[slug as keyof typeof bookCounts])
            .map(([slug, name]) => (
              <button key={slug} type="button" aria-pressed={book === slug} onClick={() => setBook(slug)} className="chip">
                {name} ({formatNumber(locale, bookCounts[slug as keyof typeof bookCounts] ?? 0)})
              </button>
            ))}
        </div>
      )}

      {current && current.results.length > 0 && (
        <>
          <ol className="mt-4 grid gap-3">
            {current.results.map((r) => (
              <li key={`${r.book}-${r.n}`}>
                <Link href={`/${locale}${r.path}`} className="glass card-premium block rounded-2xl p-4">
                  <span className="flex items-start justify-between gap-3">
                    <span className="min-w-0">
                      <span className="block font-bold text-ink">
                        {names[r.book]} · {fill(labels.hadithLabel, { n: formatNumber(locale, r.n) })}
                      </span>
                      <span lang="en" dir="ltr" className="block truncate text-xs text-muted">
                        {r.chapterTitle}
                      </span>
                    </span>
                    <span className="shrink-0 text-xs text-muted">{r.matches.map((m) => langLabel[m.lang]).join(" · ")}</span>
                  </span>
                  {r.matches.map((m) => (
                    <span key={m.lang} lang={m.lang} dir={m.lang === "en" ? "ltr" : "rtl"} className={`mt-2 block search-text-${m.lang}`}>
                      <SnippetText snippet={m.snippet} />
                    </span>
                  ))}
                </Link>
              </li>
            ))}
          </ol>
          {current.results.length < current.total && (
            <div className="mt-6 text-center">
              <button
                type="button"
                onClick={showMore}
                disabled={loadingMore}
                aria-busy={loadingMore}
                className="btn btn-glass min-h-11 px-6 text-sm"
              >
                {loadingMore ? labels.loading : labels.showMore}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
