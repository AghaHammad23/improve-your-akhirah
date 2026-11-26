#!/usr/bin/env node
/**
 * Downloads the Tanzil "Simple Clean" Quran text into src/data/quran/tanzil-simple-clean.txt.
 *
 *   npm run data:quran-search
 *
 * Used only for Arabic search: the reader shows the Uthmani text, but Uthmani spelling (ٱلصَّلَوٰةَ)
 * doesn't match what people type (الصلاة) even with diacritics removed. Simple Clean uses standard
 * spelling without diacritics. Licence: CC BY 3.0, verbatim copies only, source and link to tanzil.net
 * required, and the copyright notice must be kept, so the file is stored exactly as downloaded
 * (licence header included). See docs/SOURCES.md §1.1.
 */
import { writeFile } from "node:fs/promises";
import path from "node:path";

const URL = "https://tanzil.net/pub/download/index.php?quranType=simple-clean&outType=txt-2&agree=true";
const OUT = path.join(process.cwd(), "src", "data", "quran", "tanzil-simple-clean.txt");

const res = await fetch(URL, { headers: { "User-Agent": "improve-your-akhirah-importer/0.1" } });
if (!res.ok) throw new Error(`Tanzil download failed: ${res.status}`);
const text = await res.text();
const verses = text.split("\n").filter((l) => /^\d+\|\d+\|/.test(l)).length;
if (verses !== 6236 || !text.includes("Tanzil Project")) throw new Error(`Unexpected file: ${verses} verses`);
await writeFile(OUT, text);
console.log(`Saved ${verses} verses to ${path.relative(process.cwd(), OUT)}.`);
