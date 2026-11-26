import { existsSync, readFileSync } from "node:fs";
import path from "node:path";
import { chapterPath, getHadithBook, getHadithSection, isHadithBook, type Hadith, type HadithBookSlug } from "@/lib/hadith";
import { makeSnippet, type Snippet } from "./highlight";
import { isArabicScript } from "./normalize";
import { planLangs, planQuery, planTokens, type SearchLang } from "./query-plan";

export { MAX_QUERY } from "./normalize";

/**
 * Server-side hadith search over the index built by scripts/build-hadith-search-index.mjs.
 * Each language is one normalised text with a line per hadith; a query scans only the languages its plan needs
 * (see query-plan.ts: Arabic script → Arabic + Urdu, Latin → English, Roman Urdu → all three), loaded once per
 * server instance.
 */
const DIR = path.join(process.cwd(), "src", "data", "hadith-search");

type Lang = SearchLang;
type Docs = { books: HadithBookSlug[]; b: number[]; s: number[]; i: number[]; n: number[]; p: number[] };
type LangIndex = { text: string; starts: Int32Array };

export const RESULTS_PER_PAGE = 20;

let docs: Docs | undefined;
const indexes = new Map<Lang, LangIndex>();

export function indexAvailable(): boolean {
  return existsSync(path.join(DIR, "docs.json"));
}

function getDocs(): Docs {
  docs ??= JSON.parse(readFileSync(path.join(DIR, "docs.json"), "utf8")) as Docs;
  return docs;
}

function getIndex(lang: Lang): LangIndex {
  let idx = indexes.get(lang);
  if (!idx) {
    const text = readFileSync(path.join(DIR, `${lang}.txt`), "utf8");
    const starts = new Int32Array(getDocs().n.length);
    let at = 0;
    for (let d = 1; d < starts.length; d++) {
      at = text.indexOf("\n", at) + 1;
      starts[d] = at;
    }
    idx = { text, starts };
    indexes.set(lang, idx);
  }
  return idx;
}

/** Document (line) that contains a text position. */
function docAt(starts: Int32Array, pos: number): number {
  let lo = 0;
  let hi = starts.length - 1;
  while (lo < hi) {
    const mid = (lo + hi + 1) >> 1;
    if (starts[mid] <= pos) lo = mid;
    else hi = mid - 1;
  }
  return lo;
}

/** Hits per document for one token (same rules as findToken: Latin tokens match at word starts). */
function tokenHits({ text, starts }: LangIndex, token: string): Map<number, number> {
  const wordStart = !isArabicScript(token);
  const hits = new Map<number, number>();
  for (let from = 0; ; ) {
    const at = text.indexOf(token, from);
    if (at < 0) break;
    from = at + 1;
    if (wordStart && at > 0 && text[at - 1] !== " " && text[at - 1] !== "\n") continue;
    const d = docAt(starts, at);
    hits.set(d, (hits.get(d) ?? 0) + 1);
  }
  return hits;
}

export type HadithSearchResult = {
  book: HadithBookSlug;
  chapter: number;
  /** English chapter title (the only language the source has). */
  chapterTitle: string;
  n: number;
  /** Link path without the locale, e.g. /hadith/bukhari/2/page/2#h-60. */
  path: string;
  matches: { lang: Lang; snippet: Snippet }[];
};

export type HadithSearchResponse = {
  total: number;
  /** Matches per book, before the book filter is applied. */
  books: Partial<Record<HadithBookSlug, number>>;
  results: HadithSearchResult[];
};

/* Recently used chapter files, for snippets. */
const sectionCache = new Map<string, Hadith[]>();
function sectionCached(book: HadithBookSlug, id: number): Hadith[] {
  const key = `${book}/${id}`;
  let s = sectionCache.get(key);
  if (s) {
    sectionCache.delete(key);
  } else {
    s = getHadithSection(book, id);
    if (sectionCache.size >= 24) sectionCache.delete(sectionCache.keys().next().value!);
  }
  sectionCache.set(key, s);
  return s;
}

export function searchHadith(query: string, opts: { book?: string; offset?: number } = {}): HadithSearchResponse {
  const plan = planQuery(query);
  const langs = planLangs(plan);
  if (!langs.length) return { total: 0, books: {}, results: [] };
  const d = getDocs();

  const found = new Map<number, { score: number; langs: Lang[] }>();
  for (const lang of langs) {
    const idx = getIndex(lang);
    // Hits per term (summed over its alternatives); start from the rarest term so the intersection stays small.
    const perToken = plan.terms[lang]!.map((alternatives) => {
      const merged = new Map<number, number>();
      for (const alt of alternatives) for (const [doc, h] of tokenHits(idx, alt)) merged.set(doc, (merged.get(doc) ?? 0) + h);
      return merged;
    }).sort((a, b) => a.size - b.size);
    const scores = new Map<number, number>();
    for (const [doc, h] of perToken[0]) {
      let score = Math.min(h, 3);
      let all = true;
      for (let k = 1; k < perToken.length && all; k++) {
        const hk = perToken[k].get(doc);
        if (hk === undefined) all = false;
        else score += Math.min(hk, 3);
      }
      if (all) scores.set(doc, score);
    }
    // The whole query as a phrase ranks first.
    const phrase = plan.phrase[lang];
    if (phrase && scores.size) {
      for (const doc of tokenHits(idx, phrase).keys()) if (scores.has(doc)) scores.set(doc, scores.get(doc)! + 20);
    }
    for (const [doc, score] of scores) {
      const r = found.get(doc);
      if (r) {
        r.score = Math.max(r.score, score);
        r.langs.push(lang);
      } else found.set(doc, { score, langs: [lang] });
    }
  }

  const books: Partial<Record<HadithBookSlug, number>> = {};
  for (const doc of found.keys()) {
    const slug = d.books[d.b[doc]];
    books[slug] = (books[slug] ?? 0) + 1;
  }
  const bookIndex = opts.book && isHadithBook(opts.book) ? d.books.indexOf(opts.book) : -1;
  const ranked = [...found]
    .filter(([doc]) => bookIndex < 0 || d.b[doc] === bookIndex)
    .sort((a, b) => b[1].score - a[1].score || a[0] - b[0]);

  const offset = Math.max(0, Math.min(opts.offset ?? 0, ranked.length));
  const results = ranked.slice(offset, offset + RESULTS_PER_PAGE).map(([doc, r]): HadithSearchResult => {
    const book = d.books[d.b[doc]];
    const chapter = d.s[doc];
    const hadith = sectionCached(book, chapter)[d.i[doc]];
    return {
      book,
      chapter,
      chapterTitle: getHadithBook(book)?.sections.find((s) => s.id === chapter)?.title ?? "",
      n: d.n[doc],
      path: `${chapterPath(book, chapter, d.p[doc])}#h-${d.n[doc]}`,
      matches: r.langs.map((lang) => ({ lang, snippet: makeSnippet(hadith[lang], planTokens(plan, lang)) })),
    };
  });
  return { total: ranked.length, books, results };
}

