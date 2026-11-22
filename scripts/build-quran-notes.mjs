#!/usr/bin/env node
/**
 * Writes translation footnotes to public/quran/notes/{ur,en}/NNN.json as { "<verse>": "<notes>" }.
 * The reader fetches these only when a reader opens "Footnotes", which keeps surah pages light
 * (Urdu footnotes are over half of the text). Runs automatically before `npm run build`.
 */
import { mkdir, readFile, readdir, writeFile } from "node:fs/promises";
import path from "node:path";

const SRC = path.join(process.cwd(), "src", "data", "quran", "surahs");
const OUT = path.join(process.cwd(), "public", "quran", "notes");
const LANGS = { ur: "urNotes", en: "enNotes" };

for (const lang of Object.keys(LANGS)) await mkdir(path.join(OUT, lang), { recursive: true });

const files = (await readdir(SRC)).filter((f) => f.endsWith(".json"));
for (const file of files) {
  const { verses } = JSON.parse(await readFile(path.join(SRC, file), "utf8"));
  for (const [lang, field] of Object.entries(LANGS)) {
    const notes = Object.fromEntries(verses.filter((v) => v[field]).map((v) => [v.n, v[field]]));
    await writeFile(path.join(OUT, lang, file), JSON.stringify(notes));
  }
}
console.log(`Footnotes written for ${files.length} surahs.`);
