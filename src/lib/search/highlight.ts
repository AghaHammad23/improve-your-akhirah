import { findToken, normalizeWithMap } from "./normalize";

/** A piece of original text with highlighted ranges (offsets into `text`). */
export type Snippet = {
  text: string;
  marks: [number, number][];
  /** Text was cut before / after this piece. */
  before: boolean;
  after: boolean;
};

/**
 * Finds every match of the (normalised) tokens in the original text and, for long text,
 * cuts a window of about `max` characters starting a little before the first match.
 * The words are never changed: marks point into the original string.
 */
export function makeSnippet(text: string, tokens: string[], max = 280): Snippet {
  const { text: norm, starts, ends } = normalizeWithMap(text);
  const ranges: [number, number][] = [];
  for (const t of tokens) {
    for (const at of findToken(norm, t)) ranges.push([starts[at], ends[at + t.length - 1]]);
  }
  ranges.sort((a, b) => a[0] - b[0]);
  const merged: [number, number][] = [];
  for (const r of ranges) {
    const last = merged[merged.length - 1];
    if (last && r[0] <= last[1]) last[1] = Math.max(last[1], r[1]);
    else merged.push([r[0], r[1]]);
  }

  let from = 0;
  let to = text.length;
  if (text.length > max) {
    const first = merged[0]?.[0] ?? 0;
    from = Math.max(0, first - 80);
    if (from > 0) from = text.indexOf(" ", from) + 1 || from;
    to = Math.min(text.length, from + max);
    const space = text.lastIndexOf(" ", to);
    if (to < text.length && space > from) to = space;
  }
  const marks = merged
    .filter(([s, e]) => e > from && s < to)
    .map(([s, e]): [number, number] => [Math.max(s, from) - from, Math.min(e, to) - from]);
  return { text: text.slice(from, to), marks, before: from > 0, after: to < text.length };
}
