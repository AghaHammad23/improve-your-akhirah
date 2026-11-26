"use client";

import { useEffect, useId, useMemo, useState, useSyncExternalStore } from "react";
import { SearchIcon } from "@/components/icons";
import { planQuery } from "@/lib/search/query-plan";
import { HadithResults, type HadithResultsLabels } from "./hadith-results";
import { loadQuranLang, QuranResults, type QuranResultsLabels, type SearchSurah } from "./quran-results";

export type Scope = "quran" | "hadith";

export type SiteSearchLabels = {
  label: string;
  placeholder: string;
  hadithPlaceholder: string;
  hint: string;
  romanNote: string;
  scopeLabel: string;
  quran: string;
  hadith: string;
  quranResults: QuranResultsLabels;
  hadithResults: HadithResultsLabels;
};

const noSubscribe = () => () => {};
const readParam = (name: string) => () => new URLSearchParams(window.location.search).get(name) ?? "";
const readQ = readParam("q");
const readIn = readParam("in");

/**
 * The search box on /search, with a Quran | Hadith switch. The query and scope live in ?q= and ?in=
 * (read on the client, so the page stays prerendered) and start from the URL until the reader changes them.
 */
export function SiteSearch({
  locale,
  surahs,
  bookNames,
  labels,
}: {
  locale: string;
  surahs: SearchSurah[];
  bookNames: [string, string][];
  labels: SiteSearchLabels;
}) {
  const inputId = useId();
  const hintId = useId();
  const urlQuery = useSyncExternalStore(noSubscribe, readQ, () => "");
  const urlScope = useSyncExternalStore(noSubscribe, readIn, () => "");
  const [typed, setTyped] = useState<string | null>(null);
  const [settled, setSettled] = useState<string | null>(null);
  const [chosenScope, setChosenScope] = useState<Scope | null>(null);
  const query = typed ?? urlQuery;
  const debounced = (settled ?? urlQuery).trim();
  const scope: Scope = chosenScope ?? (urlScope === "hadith" ? "hadith" : "quran");
  const roman = useMemo(() => planQuery(debounced).roman, [debounced]);

  useEffect(() => {
    if (typed === null) return;
    const t = setTimeout(() => setSettled(typed), 300);
    return () => clearTimeout(t);
  }, [typed]);

  // Keep the query and scope in the address bar so a search can be shared.
  useEffect(() => {
    if (settled === null && chosenScope === null) return;
    const url = new URL(window.location.href);
    if (debounced) url.searchParams.set("q", debounced);
    else url.searchParams.delete("q");
    if (scope === "hadith") url.searchParams.set("in", "hadith");
    else url.searchParams.delete("in");
    history.replaceState(history.state, "", url);
  }, [settled, chosenScope, debounced, scope]);

  return (
    <div>
      <div role="group" aria-label={labels.scopeLabel} className="mb-3 flex gap-1.5">
        {(["quran", "hadith"] as const).map((s) => (
          <button key={s} type="button" aria-pressed={scope === s} onClick={() => setChosenScope(s)} className="chip">
            {labels[s]}
          </button>
        ))}
      </div>

      <form role="search" onSubmit={(e) => e.preventDefault()} className="glass flex items-center gap-2 rounded-2xl p-2">
        <label htmlFor={inputId} className="sr-only">
          {labels.label}
        </label>
        <SearchIcon className="ms-2 size-5 shrink-0 text-muted" />
        <input
          id={inputId}
          type="search"
          value={query}
          onChange={(e) => setTyped(e.target.value)}
          onFocus={() => {
            // Warm up the Quran data for the reader's own language while they type.
            if (scope === "quran") (locale === "en" ? (["en"] as const) : (["ar", "ur"] as const)).forEach((l) => void loadQuranLang(l).catch(() => {}));
          }}
          placeholder={scope === "quran" ? labels.placeholder : labels.hadithPlaceholder}
          aria-describedby={hintId}
          autoComplete="off"
          enterKeyHint="search"
          className="min-h-11 min-w-0 flex-1 bg-transparent px-2 text-base text-ink placeholder:text-muted focus:outline-none"
        />
      </form>
      <p id={hintId} className="mt-2 px-1 text-xs text-muted">
        {labels.hint}
      </p>

      {roman.length > 0 && (
        <p className="glass mt-4 rounded-2xl px-4 py-2.5 text-sm text-muted">
          {labels.romanNote}{" "}
          {roman.map(({ word, entry }, i) => (
            <span key={word}>
              {i > 0 && "; "}
              <span lang="en" dir="ltr" className="font-semibold text-ink">
                {word}
              </span>{" "}
              <span aria-hidden="true">→</span>{" "}
              {entry.ur[0] && (
                <span lang="ur" dir="rtl" className="font-urdu">
                  {entry.ur[0]}
                </span>
              )}
              {entry.ar[0] && (
                <>
                  {" · "}
                  <span lang="ar" dir="rtl" className="font-arabic">
                    {entry.ar[0]}
                  </span>
                </>
              )}
              {entry.en[0] && (
                <>
                  {" · "}
                  <span lang="en" dir="ltr">
                    {entry.en[0]}
                  </span>
                </>
              )}
            </span>
          ))}
        </p>
      )}

      {scope === "quran" ? (
        <QuranResults query={debounced} locale={locale} surahs={surahs} labels={labels.quranResults} />
      ) : (
        <HadithResults query={debounced} locale={locale} bookNames={bookNames} labels={labels.hadithResults} />
      )}
    </div>
  );
}
