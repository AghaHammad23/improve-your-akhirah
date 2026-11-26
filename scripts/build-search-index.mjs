#!/usr/bin/env node
/**
 * Writes the browser search data to public/search/quran-{ar,ur,en}.json (runs before every build).
 * Each file holds one string per verse in Quran order (1:1 … 114:6); the search page loads only the
 * languages a query needs. Text is stored as published; normalisation happens in the browser
 * (src/lib/search/normalize.ts), so nothing here changes the wording.
 *
 * - ar: Tanzil Simple Clean text (src/data/quran/tanzil-simple-clean.txt), verbatim, with its notice.
 * - ur, en: the QuranEnc translations from src/data/quran/surahs, without the "[12]" footnote markers.
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const DATA = path.join(process.cwd(), "src", "data", "quran");
const OUT = path.join(process.cwd(), "public", "search");
await mkdir(OUT, { recursive: true });

const tanzil = await readFile(path.join(DATA, "tanzil-simple-clean.txt"), "utf8");
const ar = tanzil
  .split(/\r?\n/)
  .filter((l) => /^\d+\|\d+\|/.test(l))
  .map((l) => l.split("|").slice(2).join("|"));
const notice = tanzil
  .split(/\r?\n/)
  .filter((l) => l.startsWith("#"))
  .map((l) => l.replace(/^#\s?/, "").trimEnd())
  .join("\n")
  .trim();

const ur = [];
const en = [];
const stripMarkers = (s) => s.replace(/\[\d+\]/g, "").replace(/\s{2,}/g, " ").trim();
for (const file of (await readdir(path.join(DATA, "surahs"))).filter((f) => f.endsWith(".json")).sort()) {
  const { verses } = JSON.parse(await readFile(path.join(DATA, "surahs", file), "utf8"));
  for (const v of verses) {
    ur.push(stripMarkers(v.ur));
    en.push(stripMarkers(v.en));
  }
}
if (ar.length !== 6236 || ur.length !== 6236 || en.length !== 6236) {
  throw new Error(`Verse counts differ: ar ${ar.length}, ur ${ur.length}, en ${en.length}`);
}

const files = {
  ar: { source: "Tanzil Quran Text (Simple Clean), https://tanzil.net", notice, verses: ar },
  ur: { source: "Muhammad Junagarhi, Urdu translation, via QuranEnc.com", verses: ur },
  en: { source: "Saheeh International, English translation, via QuranEnc.com", verses: en },
};
for (const [lang, data] of Object.entries(files)) {
  await writeFile(path.join(OUT, `quran-${lang}.json`), JSON.stringify(data));
}
console.log("Search data written for 6236 verses.");
