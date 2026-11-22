#!/usr/bin/env node
/**
 * Imports the Quran text and translations into src/data/quran/.
 *
 *   node scripts/import-quran.mjs
 *
 * Sources (licences in docs/SOURCES.md):
 *   - Surah list: Tanzil Quran Metadata v1.0, CC BY 3.0 (https://tanzil.net)
 *   - Arabic (Uthmani, Hafs) + translations: QuranEnc.com API
 *       urdu_junagarhi  (Muhammad Junagarhi, Rowwad Translation Center)
 *       english_saheeh  (Saheeh International, Noor International Center)
 *     QuranEnc terms: no modification, credit QuranEnc + publisher, show version, keep up to date.
 *
 * Text is stored exactly as received. Re-run to update when QuranEnc publishes a new version.
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const OUT = path.join(process.cwd(), "src", "data", "quran");
const UA = "improve-your-akhirah-importer/0.1";
const TRANSLATIONS = { ur: "urdu_junagarhi", en: "english_saheeh" };
const DELAY_MS = 250;

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function get(url, as = "json", attempt = 1) {
  const res = await fetch(url, { headers: { "User-Agent": UA } });
  if (!res.ok) {
    if (attempt < 4) {
      await sleep(1000 * attempt);
      return get(url, as, attempt + 1);
    }
    throw new Error(`${res.status} ${url}`);
  }
  return as === "json" ? res.json() : res.text();
}

/** Parses the QuranData.Sura array from Tanzil's quran-data.js without executing it. */
function parseTanzilSuras(js) {
  const block = js.slice(js.indexOf("QuranData.Sura = ["), js.indexOf("];", js.indexOf("QuranData.Sura = [")));
  const rows = [...block.matchAll(/\[(\d+), (\d+), (\d+), (\d+), '([^']+)', "([^"]+)", '((?:[^'\\]|\\.)*)', '(Meccan|Medinan)'\]/g)];
  return rows.map((m, i) => ({
    number: i + 1,
    start: Number(m[1]),
    ayahs: Number(m[2]),
    revelationOrder: Number(m[3]),
    rukus: Number(m[4]),
    nameArabic: m[5],
    transliteration: m[6],
    meaningEn: m[7].replace(/\\'/g, "'"),
    type: m[8] === "Meccan" ? "makki" : "madani",
  }));
}

async function main() {
  await mkdir(path.join(OUT, "surahs"), { recursive: true });

  console.log("Fetching Tanzil metadata…");
  const tanzil = await get("https://tanzil.net/res/text/metadata/quran-data.js", "text");
  if (!tanzil.includes("Creative Commons Attribution 3.0")) throw new Error("Unexpected Tanzil metadata licence header");
  const suras = parseTanzilSuras(tanzil);
  if (suras.length !== 114) throw new Error(`Expected 114 surahs, parsed ${suras.length}`);
  if (suras.reduce((n, s) => n + s.ayahs, 0) !== 6236) throw new Error("Ayah total is not 6236");

  console.log("Fetching translation versions…");
  const versions = {};
  for (const [lang, key] of Object.entries(TRANSLATIONS)) {
    const list = await get(`https://quranenc.com/api/v1/translations/list/${lang}`);
    const t = list.translations.find((x) => x.key === key);
    if (!t) throw new Error(`Translation ${key} not listed`);
    versions[lang] = { key, title: t.title, version: t.version, lastUpdate: new Date(t.last_update * 1000).toISOString() };
  }

  for (const s of suras) {
    const byLang = {};
    for (const [lang, key] of Object.entries(TRANSLATIONS)) {
      byLang[lang] = (await get(`https://quranenc.com/api/v1/translation/sura/${key}/${s.number}`)).result;
      await sleep(DELAY_MS);
    }
    const { ur, en } = byLang;
    if (ur.length !== s.ayahs || en.length !== s.ayahs) {
      throw new Error(`Surah ${s.number}: expected ${s.ayahs} verses, got ur=${ur.length} en=${en.length}`);
    }
    const verses = en.map((v, i) => {
      const u = ur[i];
      if (Number(v.aya) !== i + 1 || Number(u.aya) !== i + 1) throw new Error(`Surah ${s.number}: verse order mismatch at ${i + 1}`);
      if (v.arabic_text !== u.arabic_text) throw new Error(`Surah ${s.number}:${i + 1}: Arabic text differs between translations`);
      const verse = { n: i + 1, ar: v.arabic_text, ur: u.translation, en: v.translation };
      if (u.footnotes) verse.urNotes = u.footnotes;
      if (v.footnotes) verse.enNotes = v.footnotes;
      return verse;
    });
    await writeFile(
      path.join(OUT, "surahs", `${String(s.number).padStart(3, "0")}.json`),
      JSON.stringify({ surah: s.number, verses }),
    );
    process.stdout.write(`\r${s.number}/114 ${s.transliteration}            `);
  }
  console.log();

  await writeFile(path.join(OUT, "surahs.json"), JSON.stringify(suras, null, 1));
  await writeFile(
    path.join(OUT, "sources.json"),
    JSON.stringify(
      {
        importedAt: new Date().toISOString(),
        metadata: { name: "Tanzil Quran Metadata 1.0", url: "https://tanzil.net", licence: "CC BY 3.0" },
        arabic: { name: "Uthmani Hafs text via QuranEnc.com", url: "https://quranenc.com" },
        translations: versions,
      },
      null,
      2,
    ),
  );
  console.log("Done:", Object.values(versions).map((v) => `${v.key} v${v.version}`).join(", "));
}

main().catch((err) => {
  console.error("\nImport failed:", err.message);
  process.exit(1);
});
