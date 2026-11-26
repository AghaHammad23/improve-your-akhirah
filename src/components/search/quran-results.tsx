"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { ArrowIcon } from "@/components/icons";
import { fill, formatNumber } from "@/lib/format";
import { makeSnippet } from "@/lib/search/highlight";
import { findToken, normalize } from "@/lib/search/normalize";
import { planLangs, planQuery, planTokens, type QueryPlan, type SearchLang } from "@/lib/search/query-plan";
import { SnippetText } from "./snippet-text";

type Lang = SearchLang;

export type SearchSurah = { n: number; name: string; ayahs: number };

export type QuranResultsLabels = {
  loading: string;
  loadError: string;
  retry: string;
  results: string;
  noResults: string;
  goTo: string;
  showMore: string;
  arabic: string;
  urdu: string;
  english: string;
};

type Result = { index: number; langs: Lang[]; score: number };

const PAGE = 30;

/* ---------------- Data (loaded once per visit, only the languages a query needs) ---------------- */
const cache = new Map<Lang, Promise<void>>();
const rawVerses = new Map<Lang, string[]>();
const normalized = new Map<Lang, string[]>();

export function loadQuranLang(lang: Lang): Promise<void> {
  let p = cache.get(lang);
  if (!p) {
    p = fetch(`/search/quran-${lang}.json`)
      .then((r) => {
        if (!r.ok) throw new Error(String(r.status));
        return r.json() as Promise<{ verses: string[] }>;
      })
      .then(({ verses }) => {
        rawVerses.set(lang, verses);
        normalized.set(lang, verses.map(normalize));
      })
      .catch((err: unknown) => {
        cache.delete(lang);
        throw err;
      });
    cache.set(lang, p);
  }
  return p;
}

/** Scans the loaded verses for a query plan (see query-plan.ts). */
function search(plan: QueryPlan): Result[] {
  const byVerse = new Map<number, Result>();
  for (const lang of planLangs(plan)) {
    const terms = plan.terms[lang]!;
    const phrase = plan.phrase[lang];
    normalized.get(lang)?.forEach((text, index) => {
      let score = 0;
      for (const alternatives of terms) {
        let hits = 0;
        for (const alt of alternatives) hits += findToken(text, alt).length;
        if (!hits) return;
        score += Math.min(hits, 3);
      }
      // The whole query as a phrase ranks first.
      if (phrase && findToken(text, phrase).length) score += 20;
      const r = byVerse.get(index) ?? { index, langs: [], score: 0 };
      r.langs.push(lang);
      r.score = Math.max(r.score, score);
      byVerse.set(index, r);
    });
  }
  return [...byVerse.values()].sort((a, b) => b.score - a.score || a.index - b.index);
}

/** "2:255", "2 255", "٢:٢٥٥" or a bare surah number. */
function parseReference(query: string, surahs: SearchSurah[]): { s: number; v?: number } | null {
  const m = /^(\d{1,3})(?:\s+(\d{1,3}))?$/.exec(normalize(query));
  if (!m) return null;
  const s = Number(m[1]);
  const v = m[2] ? Number(m[2]) : undefined;
  const surah = surahs[s - 1];
  if (!surah || (v !== undefined && (v < 1 || v > surah.ayahs))) return null;
  return { s, v };
}

/** Quran results for a settled query; the search runs in the browser. */
export function QuranResults({
  query,
  locale,
  surahs,
  labels,
}: {
  query: string;
  locale: string;
  surahs: SearchSurah[];
  labels: QuranResultsLabels;
}) {
  const [attempt, setAttempt] = useState(0);
  const [loadState, setLoadState] = useState<{ key: string; ok: boolean } | null>(null);
  const [more, setMore] = useState({ q: "", n: PAGE });

  /** Verse index (0–6235) → surah and verse number. */
  const refs = useMemo(() => surahs.flatMap((s) => Array.from({ length: s.ayahs }, (_, i) => ({ s: s.n, v: i + 1 }))), [surahs]);
  const plan = useMemo(() => planQuery(query), [query]);
  const reference = useMemo(() => parseReference(query, surahs), [query, surahs]);
  const langs = useMemo(() => planLangs(plan), [plan]);
  // A reference like "2:255" is answered by the "Go to" link instead.
  const searchable = langs.length > 0 && !reference;
  const loadKey = `${langs.join()}#${attempt}`;

  useEffect(() => {
    if (!searchable) return;
    let cancelled = false;
    Promise.all(langs.map(loadQuranLang))
      .then(() => !cancelled && setLoadState({ key: loadKey, ok: true }))
      .catch(() => !cancelled && setLoadState({ key: loadKey, ok: false }));
    return () => {
      cancelled = true;
    };
  }, [searchable, langs, loadKey]);

  const status = !searchable ? "idle" : loadState?.key !== loadKey ? "loading" : loadState.ok ? "ready" : "error";
  const results = useMemo(
    () => (status === "ready" ? search(plan) : []),
    [status, plan],
  );
  const shown = more.q === query ? more.n : PAGE;
  const langLabel: Record<Lang, string> = { ar: labels.arabic, ur: labels.urdu, en: labels.english };
  const refText = (s: number, v?: number) =>
    `${surahs[s - 1].name} ${formatNumber(locale, s)}${v ? `:${formatNumber(locale, v)}` : ""}`;

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
            {results.length ? fill(labels.results, { n: formatNumber(locale, results.length) }) : labels.noResults}
          </p>
        )}
      </div>

      {reference && (
        <Link
          href={`/${locale}/quran/${reference.s}${reference.v ? `#v-${reference.v}` : ""}`}
          className="glass card-premium mt-4 flex min-h-14 items-center justify-between gap-3 rounded-2xl px-4 py-3 font-bold text-ink"
        >
          {fill(labels.goTo, { ref: refText(reference.s, reference.v) })}
          <ArrowIcon className="size-5 shrink-0 text-gold-600 rtl:-scale-x-100 dark:text-gold-300" />
        </Link>
      )}

      {status === "ready" && results.length > 0 && (
        <>
          <ol className="mt-4 grid gap-3">
            {results.slice(0, shown).map((r) => {
              const { s, v } = refs[r.index];
              return (
                <li key={r.index}>
                  <Link href={`/${locale}/quran/${s}#v-${v}`} className="glass card-premium block rounded-2xl p-4">
                    <span className="flex items-center justify-between gap-3">
                      <span className="font-bold text-ink">{refText(s, v)}</span>
                      <span className="shrink-0 text-xs text-muted">{r.langs.map((l) => langLabel[l]).join(" · ")}</span>
                    </span>
                    {r.langs.map((lang) => (
                      <span key={lang} lang={lang} dir={lang === "en" ? "ltr" : "rtl"} className={`mt-2 block search-text-${lang}`}>
                        <SnippetText snippet={makeSnippet(rawVerses.get(lang)?.[r.index] ?? "", planTokens(plan, lang))} />
                      </span>
                    ))}
                  </Link>
                </li>
              );
            })}
          </ol>
          {shown < results.length && (
            <div className="mt-6 text-center">
              <button type="button" onClick={() => setMore({ q: query, n: shown + PAGE })} className="btn btn-glass min-h-11 px-6 text-sm">
                {labels.showMore}
              </button>
            </div>
          )}
        </>
      )}
    </>
  );
}
