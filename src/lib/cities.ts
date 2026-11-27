"use client";

import type { Place } from "./prayer";
import { normalizeArabic } from "./text-match";

/** public/prayer/cities.json, built by scripts/import-cities.mjs from GeoNames (CC BY 4.0). */
type CityFile = {
  credit: string;
  tz: string[];
  admin: string[];
  /** [name, cc, adminIdx, lat, lng, tzIdx, arabicScriptNames], largest city first. */
  cities: [string, string, number, number, number, number, string][];
};

type City = { place: Place; latin: string; arabic: string[] };

let loading: Promise<City[]> | null = null;

/** Loads the city list once (about 0.8 MB compressed), on the first search or location lookup. */
export function loadCities(): Promise<City[]> {
  loading ??= fetch("/prayer/cities.json")
    .then((r) => {
      if (!r.ok) throw new Error(`cities.json: HTTP ${r.status}`);
      return r.json() as Promise<CityFile>;
    })
    .then((f) =>
      f.cities.map(([name, cc, a, lat, lng, t, alt]) => ({
        place: { name, cc, admin: f.admin[a] || undefined, lat, lng, tz: f.tz[t], source: "city" as const },
        latin: latinKey(name),
        arabic: alt ? alt.split("|").map(arabicKey) : [],
      })),
    )
    .catch((e) => {
      loading = null; // allow a retry
      throw e;
    });
  return loading;
}

/** Lowercase, accents removed, letters and digits only: "São Paulo" → "saopaulo". */
function latinKey(s: string) {
  return s
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "");
}

/** Arabic-script names: diacritics, spaces and ZWNJ removed; Urdu and Arabic letter forms merged (ھ ہ ه, ی ي, ک ك). */
function arabicKey(s: string) {
  return normalizeArabic(s.replace(/[‌‍]/g, "").replace(/ھ/g, "ه")).replace(/[\s'-]/g, "");
}

/** Common English spellings GeoNames doesn't use as the main name. */
const ALIASES: Record<string, string> = { mecca: "makkah", medina: "madinah", madina: "madinah", makka: "makkah" };

const ARABIC_SCRIPT = /[؀-ۿ]/;

/** Cities whose name starts with the query come first (largest first), then names that contain it. */
export function searchCities(cities: City[], query: string, limit = 8): Place[] {
  const q = query.trim();
  if (!q) return [];
  const arabic = ARABIC_SCRIPT.test(q);
  let key = arabic ? arabicKey(q) : latinKey(q);
  if (!key) return [];
  if (!arabic) key = ALIASES[key] ?? key;
  const starts: Place[] = [];
  const contains: Place[] = [];
  for (const c of cities) {
    const names = arabic ? c.arabic : [c.latin];
    if (names.some((n) => n.startsWith(key))) {
      starts.push(c.place);
      if (starts.length >= limit) break;
    } else if (contains.length < limit && key.length >= 3 && names.some((n) => n.includes(key))) {
      contains.push(c.place);
    }
  }
  return [...starts, ...contains].slice(0, limit);
}

/** The listed city closest to a GPS fix, to name the place and give its country (for the default method). */
export function nearestCity(cities: City[], lat: number, lng: number): Place | null {
  let best: City | null = null;
  let bestD = Infinity;
  const cosLat = Math.cos((lat * Math.PI) / 180);
  for (const c of cities) {
    const dLat = c.place.lat - lat;
    let dLng = Math.abs(c.place.lng - lng);
    if (dLng > 180) dLng = 360 - dLng;
    const d = dLat * dLat + (dLng * cosLat) ** 2;
    if (d < bestD) {
      bestD = d;
      best = c;
    }
  }
  return best?.place ?? null;
}
