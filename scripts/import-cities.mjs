/**
 * Builds the city list used by Prayer times and Qibla: public/prayer/cities.json.
 *
 *   node scripts/import-cities.mjs
 *
 * Source (licence in docs/SOURCES.md): GeoNames "cities15000" (every city with 15,000+ people) and
 * "admin1CodesASCII" (state/province names), CC BY 4.0, https://www.geonames.org.
 * Downloads are cached in .cache/geonames/ (gitignored). The output is committed, so builds don't depend on GeoNames.
 *
 * Output: { credit, tz: string[], admin: string[], cities: [name, cc, adminIdx, lat, lng, tzIdx, alt][] }, largest city first
 *   - names stay in Latin script as GeoNames gives them; `alt` holds only the Arabic-script alternate names
 *     ("|"-joined), so Urdu and Arabic input can find a city. They are used for matching, not shown.
 *   - lat/lng rounded to 4 decimals (about 11 m), which is far finer than prayer times or the Qibla need.
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";
import { inflateRawSync } from "node:zlib";

const CACHE = path.join(process.cwd(), ".cache", "geonames");
const OUT = path.join(process.cwd(), "public", "prayer", "cities.json");
const BASE = "https://download.geonames.org/export/dump/";

async function cached(file) {
  const p = path.join(CACHE, file);
  if (!existsSync(p)) {
    console.log(`Downloading ${file}…`);
    const res = await fetch(BASE + file);
    if (!res.ok) throw new Error(`${file}: HTTP ${res.status}`);
    await writeFile(p, Buffer.from(await res.arrayBuffer()));
  }
  return readFile(p);
}

/** Reads the first file of a zip archive (GeoNames zips hold a single entry). */
function unzipFirst(buf) {
  if (buf.readUInt32LE(0) !== 0x04034b50) throw new Error("Not a zip file");
  const method = buf.readUInt16LE(8);
  const nameLen = buf.readUInt16LE(26);
  const extraLen = buf.readUInt16LE(28);
  const start = 30 + nameLen + extraLen;
  // Sizes may sit in a data descriptor, so read the compressed size from the central directory instead.
  const eocd = buf.lastIndexOf(Buffer.from([0x50, 0x4b, 0x05, 0x06]));
  const cd = buf.readUInt32LE(eocd + 16);
  const size = buf.readUInt32LE(cd + 20);
  const data = buf.subarray(start, start + size);
  if (method === 0) return data;
  if (method === 8) return inflateRawSync(data);
  throw new Error(`Unsupported zip method ${method}`);
}

/** Alternate names written only in Arabic script (Arabic, Urdu, Persian…): no Latin letters mixed in. */
const ARABIC_ONLY = /^[؀-ۿݐ-ݿ‌s'-]+$/;
const MAX_ALT = 4;
/** Urdu spellings first (ہ ی ک ے ٹ ڈ ڑ ں ھ), then Arabic (ه ي ك), then other scripts (Persian, Pashto, Sindhi, Uyghur…). */
const URDU = /[ہیکےٹڈڑںھ]/;
const OTHER = /[ۆڭۇېۍڪڄڃڳڱټډړږښۀ]/;
const ARABIC = /[هيك]/;
const scriptRank = (s) => (OTHER.test(s) ? 3 : URDU.test(s) ? 0 : ARABIC.test(s) ? 1 : 2);

async function main() {
  await mkdir(CACHE, { recursive: true });
  await mkdir(path.dirname(OUT), { recursive: true });

  const admin1 = new Map(
    (await cached("admin1CodesASCII.txt"))
      .toString("utf8")
      .split("\n")
      .filter(Boolean)
      .map((line) => {
        const [code, name] = line.split("\t");
        return [code, name];
      }),
  );

  const rows = unzipFirst(await cached("cities15000.zip")).toString("utf8").split("\n").filter(Boolean);
  const tz = [];
  const tzIdx = new Map();
  const admin = [];
  const adminIdx = new Map();
  const index = (list, map, value) => {
    if (!map.has(value)) {
      map.set(value, list.length);
      list.push(value);
    }
    return map.get(value);
  };

  const cities = rows.map((line) => {
    const f = line.split("\t");
    const [, name, , alternates, lat, lng, , , cc, , a1, , , , population, , , timezone] = f;
    if (!timezone) throw new Error(`No timezone for ${name}`);
    const alt = [...new Set(alternates.split(",").filter((a) => ARABIC_ONLY.test(a)))]
      .sort((x, y) => scriptRank(x) - scriptRank(y) || x.length - y.length)
      .slice(0, MAX_ALT)
      .join("|");
    const adminName = admin1.get(`${cc}.${a1}`) ?? "";
    return [
      name,
      cc,
      index(admin, adminIdx, adminName),
      Math.round(Number(lat) * 1e4) / 1e4,
      Math.round(Number(lng) * 1e4) / 1e4,
      index(tz, tzIdx, timezone),
      Number(population),
      alt,
    ];
  });
  // Largest first, so a search lists the best-known place first; population isn't needed after that.
  cities.sort((a, b) => b[6] - a[6]);
  for (const c of cities) c.splice(6, 1);

  const credit = "City data © GeoNames (https://www.geonames.org), CC BY 4.0.";
  await writeFile(OUT, JSON.stringify({ credit, tz, admin, cities }));
  const kb = Math.round((await readFile(OUT)).length / 1024);
  console.log(`Wrote ${cities.length} cities, ${tz.length} timezones, ${admin.length} regions (${kb} KB).`);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
