/**
 * Checks src/lib/names.ts (99 Names of Allah) against our own data:
 *  1. The Arabic names match, in order, the list in Jami' at-Tirmidhi 3507 (src/data/hadith/tirmidhi/48.json).
 *  2. Each Quran reference exists and its verse (Tanzil simple-clean text) contains the name, or, where the verse
 *     describes the action rather than using the name, the word listed in RELATED below.
 *  3. Each hadith reference exists in our data and contains the expected word.
 * Run after editing the names: `node scripts/check-names.mjs` (Node >= 22.18, it imports a .ts file).
 */
import { readFileSync } from "node:fs";
import path from "node:path";
import { allahNames } from "../src/lib/names.ts";

const root = process.cwd();
/** Undiacritized, with hamza/alif and yā' variants folded, so spellings in different editions compare equal. */
const norm = (s) =>
  s
    .replace(/[ً-ٰٟۖ-ۭـ]/g, "")
    .replace(/[أإآٱ]/g, "ا")
    .replace(/[ؤئ]/g, "ء")
    .replace(/ى/g, "ي");

/** Verses that describe the action (or use another form) instead of the exact name: n → word in the verse. */
const RELATED = {
  1: "الله",
  21: "يقبض",
  22: "يبسط",
  24: "نرفع",
  25: "تعز",
  26: "تذل",
  29: "حكما",
  30: "صدقا وعدلا",
  42: "ذو الجلال",
  50: "يبعث",
  58: "احصي كل شيء",
  59: "يبدئ",
  60: "يعيد",
  62: "يميت",
  77: "من وال",
  78: "المتعال",
  86: "بالقسط",
  89: "يغنيكم",
  91: "ضرا",
  92: "نفعا",
  96: "يبقي",
};
/** Hadith references: n → word in the hadith's Arabic. */
const HADITH_WORD = { 71: "المقدم", 72: "المؤخر", 99: "اصبر" };

let errors = 0;
const fail = (msg) => {
  errors++;
  console.error(`✗ ${msg}`);
};

// 1. Arabic against Tirmidhi 3507.
const tirmidhi = JSON.parse(readFileSync(path.join(root, "src/data/hadith/tirmidhi/48.json"), "utf8"));
const listText = norm(tirmidhi.find((h) => h.n === 3507).ar);
const words = listText.split(/\s+/);
// The list opens "هو الله الذي لا إله إلا هو الرحمن ...": the edition counts "Allah", then al-Rahman … al-Sabur.
const expected = ["الله", ...words.slice(words.indexOf("الرحمن"), words.indexOf("الصبور") + 1)].join(" ");
const actual = allahNames.map((x) => norm(x.ar)).join(" ");
if (allahNames.length !== 99) fail(`expected 99 names, found ${allahNames.length}`);
if (expected !== actual) fail("Arabic names do not match Tirmidhi 3507 in order");
allahNames.forEach((x, i) => x.n !== i + 1 && fail(`name ${x.translit} has n=${x.n}, expected ${i + 1}`));

// 2. Quran references.
const verses = new Map();
for (const line of readFileSync(path.join(root, "src/data/quran/tanzil-simple-clean.txt"), "utf8").split(/\r?\n/)) {
  const [s, a, text] = line.split("|");
  if (text) verses.set(`${s}:${a}`, norm(text));
}
for (const x of allahNames) {
  if (!x.quran) continue;
  const key = x.quran.join(":");
  const verse = verses.get(key);
  if (!verse) {
    fail(`${x.n} ${x.translit}: Quran ${key} not found`);
    continue;
  }
  const word = RELATED[x.n] ? norm(RELATED[x.n]) : norm(x.ar).replace(/^ال/, "");
  if (!verse.includes(word)) fail(`${x.n} ${x.translit}: Quran ${key} does not contain "${word}"`);
}

// 3. Hadith references.
for (const x of allahNames) {
  if (!x.hadith) continue;
  const { book, chapter, n } = x.hadith;
  const file = path.join(root, "src/data/hadith", book, `${chapter}.json`);
  const hadith = JSON.parse(readFileSync(file, "utf8")).find((h) => h.n === n);
  if (!hadith) fail(`${x.n} ${x.translit}: ${book} ${n} not found in chapter ${chapter}`);
  else if (!norm(hadith.ar).includes(norm(HADITH_WORD[x.n] ?? ""))) fail(`${x.n} ${x.translit}: ${book} ${n} lacks "${HADITH_WORD[x.n]}"`);
  else if (!HADITH_WORD[x.n]) fail(`${x.n} ${x.translit}: add the expected word to HADITH_WORD`);
}

const withRef = allahNames.filter((x) => x.quran || x.hadith).length;
if (errors) {
  console.error(`\n${errors} problem(s) found.`);
  process.exit(1);
}
console.log(`✓ 99 names match Tirmidhi 3507; ${withRef} references checked, ${99 - withRef} names have none.`);
