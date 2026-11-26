#!/usr/bin/env node
/**
 * Imports the six major hadith books into src/data/hadith/.
 *
 *   node scripts/import-hadith.mjs               (re-import)
 *   node scripts/import-hadith.mjs --if-missing  (only when src/data/hadith is absent; used by prebuild)
 *
 * Source: fawazahmed0/hadith-api (https://github.com/fawazahmed0/hadith-api), Unlicense for the repository.
 * The English and Urdu translations inside it are third-party works; see docs/SOURCES.md (§3) before any
 * commercial use. Text is stored exactly as received.
 *
 * Downloads are cached in .cache/hadith/ (gitignored) so re-runs don't hit the CDN again.
 * Languages are merged by hadith number (Sahih Muslim's Urdu edition is ordered differently).
 */
import { existsSync } from "node:fs";
import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import path from "node:path";

const CDN = "https://cdn.jsdelivr.net/gh/fawazahmed0/hadith-api@1/editions";
const UA = "improve-your-akhirah-importer/0.1";
const CACHE = path.join(process.cwd(), ".cache", "hadith");
const OUT = path.join(process.cwd(), "src", "data", "hadith");
const BOOKS = ["bukhari", "muslim", "abudawud", "tirmidhi", "nasai", "ibnmajah"];
const LANGS = { ar: "ara", en: "eng", ur: "urd" };

async function edition(name) {
  const file = path.join(CACHE, `${name}.json`);
  if (!existsSync(file)) {
    const res = await fetch(`${CDN}/${name}.min.json`, { headers: { "User-Agent": UA } });
    if (!res.ok) throw new Error(`${res.status} ${name}`);
    await writeFile(file, await res.text());
  }
  return JSON.parse(await readFile(file, "utf8"));
}

/** Chapter whose number range holds n; if n falls in a gap, the nearest chapter before it. */
function sectionByNumber(details, n) {
  let best = 0;
  let bestFirst = -Infinity;
  for (const [id, d] of Object.entries(details)) {
    if (id === "0") continue;
    if (d.hadithnumber_first <= n && n <= d.hadithnumber_last) return Number(id);
    if (d.hadithnumber_first <= n && d.hadithnumber_first > bestFirst) {
      best = Number(id);
      bestFirst = d.hadithnumber_first;
    }
  }
  return best;
}

async function main() {
  if (process.argv.includes("--if-missing") && existsSync(path.join(OUT, "books.json"))) return;
  await mkdir(CACHE, { recursive: true });
  await rm(OUT, { recursive: true, force: true });
  const books = [];

  for (const slug of BOOKS) {
    const eds = {};
    for (const [lang, prefix] of Object.entries(LANGS)) eds[lang] = await edition(`${prefix}-${slug}`);

    // English defines the hadith list, numbering, sections and grades; ar/ur are joined by number.
    const byNumber = {};
    for (const lang of ["ar", "ur"]) {
      byNumber[lang] = new Map(eds[lang].hadiths.map((h) => [h.hadithnumber, h.text.trim()]));
    }

    const sections = new Map();
    const missing = { ar: 0, en: 0, ur: 0 };
    for (const h of eds.en.hadiths) {
      const item = {
        n: h.hadithnumber,
        an: h.arabicnumber,
        ar: byNumber.ar.get(h.hadithnumber) ?? "",
        en: h.text.trim(),
        ur: byNumber.ur.get(h.hadithnumber) ?? "",
      };
      if (h.grades?.length) item.g = h.grades.map((g) => [g.name, g.grade]);
      for (const lang of ["ar", "en", "ur"]) if (!item[lang]) missing[lang]++;
      if (!item.ar && !item.en && !item.ur) continue; // nothing to show
      // ~1% of hadith have no chapter reference in the source; place them by number range instead.
      const sectionId = h.reference?.book || sectionByNumber(eds.en.metadata.section_details, h.hadithnumber);
      if (!sections.has(sectionId)) sections.set(sectionId, []);
      sections.get(sectionId).push(item);
    }

    const titles = eds.en.metadata.sections;
    await mkdir(path.join(OUT, slug), { recursive: true });
    const sectionList = [];
    for (const [id, items] of [...sections.entries()].sort((a, b) => a[0] - b[0])) {
      await writeFile(path.join(OUT, slug, `${id}.json`), JSON.stringify(items));
      sectionList.push({
        id,
        title: titles[String(id)] || "",
        count: items.length,
        first: items[0].n,
        last: items[items.length - 1].n,
      });
    }
    const total = sectionList.reduce((n, s) => n + s.count, 0);
    books.push({ slug, name: eds.en.metadata.name, total, graded: eds.en.hadiths.some((h) => h.grades?.length), missing, sections: sectionList });
    console.log(`${slug}: ${total} hadith in ${sectionList.length} sections; missing ar=${missing.ar} en=${missing.en} ur=${missing.ur}`);
  }

  await writeFile(path.join(OUT, "books.json"), JSON.stringify(books, null, 1));
  await writeFile(
    path.join(OUT, "sources.json"),
    JSON.stringify(
      {
        importedAt: new Date().toISOString(),
        source: "fawazahmed0/hadith-api@1",
        url: "https://github.com/fawazahmed0/hadith-api",
        licence: "Unlicense (repository); translations are third-party works",
      },
      null,
      2,
    ),
  );
}

main().catch((err) => {
  console.error("Import failed:", err.message);
  process.exit(1);
});
