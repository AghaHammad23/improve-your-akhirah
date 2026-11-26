/**
 * Search normalisation for Arabic, Urdu and English (see docs/PLAN.md, "Search design").
 * Used only for matching: results always show the original text, with the match located through `starts`/`ends`.
 *
 * - Arabic script: drops tashkeel, Quranic marks, tatweel and direction marks; unifies alef forms (أ إ آ ٱ → ا),
 *   ya (ى ی ے ئ → ي), kaf (ک → ك), ta marbuta and Urdu he (ة ۃ ہ ھ → ه) and ؤ → و, so Arabic and Urdu spellings meet.
 * - Latin: lower case, accents removed (Allāh → allah), apostrophes dropped (Qur'an → quran).
 * - Arabic-Indic and Persian digits become 0–9; punctuation becomes a single space.
 */

const ARABIC_MARKS = /[ؐ-ًؚ-ٰٟۖ-ۭـ​-‏‪-‮⁦-⁩]/;
const LATIN_MARK = /\p{M}/u;
const APOSTROPHES = /['’‘`ʿʾ]/;
const WORD_CHAR = /[\p{L}\p{N}]/u;

const LETTERS: Record<string, string> = {
  أ: "ا",
  إ: "ا",
  آ: "ا",
  ٱ: "ا",
  ٲ: "ا",
  ٳ: "ا",
  ى: "ي",
  ی: "ي",
  ے: "ي",
  ۓ: "ي",
  ئ: "ي",
  ې: "ي",
  ک: "ك",
  ة: "ه",
  ۃ: "ه",
  ہ: "ه",
  ھ: "ه",
  ۀ: "ه",
  ؤ: "و",
};

function mapChar(ch: string): string {
  const code = ch.codePointAt(0)!;
  if (code < 0x80) {
    // ASCII fast path (most English text).
    if ((code >= 0x61 && code <= 0x7a) || (code >= 0x30 && code <= 0x39)) return ch;
    if (code >= 0x41 && code <= 0x5a) return String.fromCharCode(code + 32);
    return ch === "'" || ch === "`" ? "" : " ";
  }
  if (ARABIC_MARKS.test(ch) || APOSTROPHES.test(ch)) return "";
  if (code >= 0x0660 && code <= 0x0669) return String(code - 0x0660);
  if (code >= 0x06f0 && code <= 0x06f9) return String(code - 0x06f0);
  if (LETTERS[ch]) return LETTERS[ch];
  if (code < 0x0600 || code > 0x06ff) {
    // Latin and others: decompose, drop accents, lower-case.
    const base = Array.from(ch.normalize("NFD"))
      .filter((c) => !LATIN_MARK.test(c))
      .join("")
      .toLowerCase();
    return Array.from(base)
      .map((c) => (WORD_CHAR.test(c) ? c : " "))
      .join("");
  }
  return WORD_CHAR.test(ch) ? ch : " ";
}

export type Normalized = {
  text: string;
  /** For each character of `text`, where its source character starts and ends in the original string. */
  starts: number[];
  ends: number[];
};

/** Normalises text and records where each output character came from. */
export function normalizeWithMap(input: string): Normalized {
  let text = "";
  const starts: number[] = [];
  const ends: number[] = [];
  let i = 0;
  for (const ch of input) {
    const out = mapChar(ch);
    for (const c of out) {
      // Collapse runs of spaces and skip leading ones.
      if (c === " " && (text.length === 0 || text.endsWith(" "))) continue;
      text += c;
      starts.push(i);
      ends.push(i + ch.length);
    }
    i += ch.length;
  }
  if (text.endsWith(" ")) {
    text = text.slice(0, -1);
    starts.pop();
    ends.pop();
  }
  return { text, starts, ends };
}

export function normalize(input: string): string {
  return normalizeWithMap(input).text;
}

/** True when the text contains Arabic-script letters (Arabic or Urdu). */
export function isArabicScript(input: string): boolean {
  return /[؀-ۿ]/.test(input);
}

/**
 * Positions in a normalised text where a normalised token matches. Arabic-script tokens match anywhere
 * (so prefixes like و ال ب are found); Latin tokens match at the start of a word ("merc" finds "mercy").
 */
export function findToken(text: string, token: string): number[] {
  const anywhere = isArabicScript(token);
  const found: number[] = [];
  let from = 0;
  for (;;) {
    const at = text.indexOf(token, from);
    if (at < 0) return found;
    if (anywhere || at === 0 || text[at - 1] === " ") found.push(at);
    from = at + 1;
  }
}

export const MAX_QUERY = 120;
const MAX_TOKENS = 8;

/**
 * Normalised query: the phrase and its words (at most MAX_TOKENS). Both are empty when the query is
 * too short to search (a single one-letter word). Shared by the Quran (browser) and Hadith (server) search.
 */
export function queryTokens(query: string): { phrase: string; tokens: string[] } {
  const tokens = normalize(query.slice(0, MAX_QUERY)).split(" ").filter(Boolean).slice(0, MAX_TOKENS);
  if (!tokens.length || (tokens.length === 1 && tokens[0].length < 2)) return { phrase: "", tokens: [] };
  return { phrase: tokens.join(" "), tokens };
}
