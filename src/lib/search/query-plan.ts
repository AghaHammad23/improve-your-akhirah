import { isArabicScript, normalize, queryTokens } from "./normalize";
import { isRomanStopword, lookupRoman, type RomanEntry } from "./roman-urdu";

export type SearchLang = "ar" | "ur" | "en";

/**
 * What to look for in each language, shared by the Quran (browser) and Hadith (server) search.
 * A language is searched only when it has terms. A text matches when every term matches through at least
 * one of its alternatives (all normalised).
 *
 * - Arabic-script query: every word in the Arabic text and the Urdu translation.
 * - Latin query: every word in the English translation.
 * - Latin query made only of Roman Urdu dictionary words and grammar words (ka, ki, mein, ...): the grammar
 *   words are dropped; the Urdu and Arabic texts are searched for the words' Urdu and Arabic forms, and the
 *   English for each word or its English meanings.
 * - Latin query with other words too: English only, each recognised word also matching its English meanings.
 */
export type QueryPlan = {
  terms: Partial<Record<SearchLang, string[][]>>;
  /** Whole query, normalised, for a phrase bonus (plain queries of 2+ words only). */
  phrase: Partial<Record<SearchLang, string>>;
  /** Recognised Roman Urdu words, for showing how the query was read. */
  roman: { word: string; entry: RomanEntry }[];
};

const EMPTY: QueryPlan = { terms: {}, phrase: {}, roman: [] };

const uniq = (list: string[]) => [...new Set(list.filter(Boolean))];

export function planQuery(query: string): QueryPlan {
  const { phrase, tokens } = queryTokens(query);
  if (!tokens.length) return EMPTY;
  const plain = (langs: SearchLang[]): QueryPlan => ({
    terms: Object.fromEntries(langs.map((l) => [l, tokens.map((t) => [t])])),
    phrase: tokens.length > 1 ? Object.fromEntries(langs.map((l) => [l, phrase])) : {},
    roman: [],
  });
  if (isArabicScript(phrase)) return plain(["ar", "ur"]);

  const words = tokens.map((word) => ({ word, entry: lookupRoman(word) }));
  if (!words.some((w) => w.entry)) return plain(["en"]);
  // Some words are neither Roman Urdu dictionary words nor Roman Urdu grammar words: treat it as English,
  // adding the English meanings of recognised words ("allah ka rehm" vs "mercy of allah").
  if (!words.every((w) => w.entry || isRomanStopword(w.word))) {
    const english = plain(["en"]);
    english.terms.en = words.map((w) => uniq([w.word, ...(w.entry?.en ?? []).map(normalize)]));
    return english;
  }

  const kept = words.filter((w) => w.entry || !isRomanStopword(w.word));
  const terms: QueryPlan["terms"] = {
    en: kept.map((w) => uniq([w.word, ...(w.entry?.en ?? []).map(normalize)])),
  };
  for (const lang of ["ar", "ur"] as const) {
    // Words without a form in this language (e.g. no safe Arabic form) are skipped there.
    const list = kept.map((w) => uniq((w.entry?.[lang] ?? []).map(normalize))).filter((alts) => alts.length);
    if (list.length) terms[lang] = list;
  }
  return {
    terms,
    phrase: {},
    roman: kept.filter((w): w is { word: string; entry: RomanEntry } => !!w.entry),
  };
}

export function planLangs(plan: QueryPlan): SearchLang[] {
  return (["ar", "ur", "en"] as const).filter((l) => plan.terms[l]?.length);
}

/** Every alternative searched in a language, for highlighting. */
export function planTokens(plan: QueryPlan, lang: SearchLang): string[] {
  return (plan.terms[lang] ?? []).flat();
}
