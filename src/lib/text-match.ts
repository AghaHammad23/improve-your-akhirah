/** Loose matching for short names (surah names, the 99 Names): shared by client-side filters. */

/** Strips Arabic diacritics/Quranic marks and the definite article so "يس" matches "يسٓ". */
export function normalizeArabic(s: string) {
  return s
    .replace(/[ً-ٰٟۖ-ۭـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    // Urdu keyboards type ی ک ہ for the Arabic ي ك ه.
    .replace(/[ىی]/g, "ي")
    .replace(/ک/g, "ك")
    .replace(/[ةہۃ]/g, "ه")
    .replace(/^ال/, "")
    .replace(/\s+/g, "");
}

/** Arabic-Indic (٠-٩) and Urdu/Persian (۰-۹) digits to ASCII, so "۲۰" finds 20. */
export function asciiDigits(s: string) {
  return s.replace(/[٠-٩۰-۹]/g, (d) => String(d.charCodeAt(0) & 0xf));
}

/** Latin names: lowercase, letters only, collapse doubled vowels ("Yaseen" ~ "yasin"). */
export function normalizeLatin(s: string) {
  return s
    .toLowerCase()
    .replace(/^(al|an|ar|as|at|ad|adh|ash|az|aal)-/, "")
    .replace(/[^a-z]/g, "")
    .replace(/ee/g, "i")
    .replace(/oo/g, "u")
    .replace(/aa/g, "a");
}
