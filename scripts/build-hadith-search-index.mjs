#!/usr/bin/env node
/**
 * Builds the server-side hadith search index in src/data/hadith-search/ (gitignored; runs before every build,
 * after the hadith import). Searched by src/lib/search/hadith-search.ts behind /api/search/hadith.
 *
 * - {ar,ur,en}.txt: one line per hadith, normalised with the same src/lib/search/normalize.ts the
 *   search uses, so matching is identical. Only for matching: results show the original text.
 * - docs.json: for each line, the book, chapter, position in the chapter file, hadith number and reading
 *   page (from sectionPages() in src/lib/hadith.ts, so links land on the page that shows the hadith).
 *
 * Needs Node 22.18+ (imports the TypeScript modules directly).
 */
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { pathToFileURL } from "node:url";

const root = process.cwd();
const load = (p) => import(pathToFileURL(path.join(root, p)).href);
const { normalize } = await load("src/lib/search/normalize.ts");
const { getHadithBooks, getHadithSection, isHadithBook, sectionPages } = await load("src/lib/hadith.ts");

const OUT = path.join(root, "src", "data", "hadith-search");
await mkdir(OUT, { recursive: true });

const books = getHadithBooks().filter((b) => isHadithBook(b.slug));
const docs = { books: books.map((b) => b.slug), b: [], s: [], i: [], n: [], p: [] };
const lines = { ar: [], ur: [], en: [] };

books.forEach((book, bi) => {
  for (const section of book.sections) {
    if (!section.title) continue;
    const hadith = getHadithSection(book.slug, section.id);
    const pages = sectionPages(book.slug, section.id);
    hadith.forEach((h, i) => {
      docs.b.push(bi);
      docs.s.push(section.id);
      docs.i.push(i);
      docs.n.push(h.n);
      docs.p.push(pages.findIndex((pg) => i >= pg.start && i < pg.end) + 1);
      for (const lang of Object.keys(lines)) lines[lang].push(normalize(h[lang] ?? ""));
    });
  }
});

for (const [lang, list] of Object.entries(lines)) {
  if (list.some((l) => l.includes("\n"))) throw new Error(`Newline in normalised ${lang} text`);
  await writeFile(path.join(OUT, `${lang}.txt`), list.join("\n"));
}
await writeFile(path.join(OUT, "docs.json"), JSON.stringify(docs));
console.log(`Hadith search index written for ${docs.n.length} hadith.`);
