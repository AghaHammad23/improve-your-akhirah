/**
 * Prayer times and Qibla, calculated in the browser with adhan-js (MIT, https://github.com/batoulapps/adhan-js).
 * Nothing about the visitor's location leaves the device.
 */
import { CalculationMethod, Coordinates, HighLatitudeRule, Madhab, PrayerTimes, Qibla } from "adhan";

/* ---------------- Places ---------------- */

export type Place = {
  /** City name as GeoNames gives it (Latin script); for a GPS fix, the nearest listed city. */
  name: string;
  /** ISO country code, e.g. "PK". */
  cc: string;
  /** State or province, to tell same-named cities apart. */
  admin?: string;
  lat: number;
  lng: number;
  /** IANA timezone of the place, e.g. "Asia/Karachi". Times are shown in it. */
  tz: string;
  source: "gps" | "city";
};

/** The Kaaba, Masjid al-Haram. */
export const KAABA = { lat: 21.422487, lng: 39.826206 } as const;

/* ---------------- Calculation settings ---------------- */

export const METHOD_IDS = [
  "karachi",
  "mwl",
  "ummAlQura",
  "egyptian",
  "dubai",
  "qatar",
  "kuwait",
  "moonsighting",
  "northAmerica",
  "singapore",
  "turkey",
  "tehran",
] as const;
export type MethodId = (typeof METHOD_IDS)[number];
export type AsrMethod = "shafi" | "hanafi";

const METHODS: Record<MethodId, () => ReturnType<typeof CalculationMethod.Karachi>> = {
  karachi: CalculationMethod.Karachi,
  mwl: CalculationMethod.MuslimWorldLeague,
  ummAlQura: CalculationMethod.UmmAlQura,
  egyptian: CalculationMethod.Egyptian,
  dubai: CalculationMethod.Dubai,
  qatar: CalculationMethod.Qatar,
  kuwait: CalculationMethod.Kuwait,
  moonsighting: CalculationMethod.MoonsightingCommittee,
  northAmerica: CalculationMethod.NorthAmerica,
  singapore: CalculationMethod.Singapore,
  turkey: CalculationMethod.Turkey,
  tehran: CalculationMethod.Tehran,
};

/** The method most mosques use in each country; Muslim World League elsewhere. */
const METHOD_BY_COUNTRY: Partial<Record<string, MethodId>> = {
  PK: "karachi", IN: "karachi", BD: "karachi", AF: "karachi",
  SA: "ummAlQura", YE: "ummAlQura",
  AE: "dubai", QA: "qatar", BH: "qatar", KW: "kuwait",
  EG: "egyptian", SD: "egyptian", LY: "egyptian", SY: "egyptian", LB: "egyptian", IQ: "egyptian", JO: "egyptian", PS: "egyptian",
  MY: "singapore", SG: "singapore", ID: "singapore", BN: "singapore",
  TR: "turkey", IR: "tehran",
  US: "moonsighting", CA: "moonsighting", GB: "moonsighting", IE: "moonsighting",
};

/** Countries where the Hanafi Asr (shadow twice the object's length) is the common practice. */
const HANAFI_COUNTRIES = new Set(["PK", "IN", "BD", "AF", "UZ", "TJ", "KZ", "KG", "TM", "CN"]);

export function defaultMethod(cc: string): MethodId {
  return METHOD_BY_COUNTRY[cc] ?? "mwl";
}

export function defaultAsr(cc: string): AsrMethod {
  return HANAFI_COUNTRIES.has(cc) ? "hanafi" : "shafi";
}

/* ---------------- Dates in a place's timezone ---------------- */

export type DayKey = { y: number; m: number; d: number };

/** The calendar date at `instant` in `tz` (month 1–12). */
export function dayIn(tz: string, instant: number): DayKey {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: tz, year: "numeric", month: "numeric", day: "numeric" }).formatToParts(
    instant,
  );
  const get = (t: string) => Number(parts.find((p) => p.type === t)!.value);
  return { y: get("year"), m: get("month"), d: get("day") };
}

export function addDays({ y, m, d }: DayKey, days: number): DayKey {
  const t = new Date(Date.UTC(y, m - 1, d + days));
  return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1, d: t.getUTCDate() };
}

export function sameDay(a: DayKey, b: DayKey) {
  return a.y === b.y && a.m === b.m && a.d === b.d;
}

export function daysInMonth(y: number, m: number) {
  return new Date(Date.UTC(y, m, 0)).getUTCDate();
}

/** Noon UTC on that date: a safe instant for formatting the date itself in any timezone. */
export function dayInstant({ y, m, d }: DayKey) {
  return Date.UTC(y, m - 1, d, 12);
}

/* ---------------- Prayer times ---------------- */

export const TIME_KEYS = ["fajr", "sunrise", "dhuhr", "asr", "maghrib", "isha"] as const;
export type TimeKey = (typeof TIME_KEYS)[number];
/** Sunrise is listed for reference (Fajr ends), but it isn't a prayer. */
export const PRAYER_KEYS = ["fajr", "dhuhr", "asr", "maghrib", "isha"] as const;
export type DayTimes = Record<TimeKey, number>;

export type CalcSettings = { method: MethodId; asr: AsrMethod };

export function timesFor(place: Pick<Place, "lat" | "lng">, day: DayKey, settings: CalcSettings): DayTimes {
  const coords = new Coordinates(place.lat, place.lng);
  const params = METHODS[settings.method]();
  params.madhab = settings.asr === "hanafi" ? Madhab.Hanafi : Madhab.Shafi;
  // Far north/south, Fajr and Isha by angle can fall in the middle of the night or not at all.
  params.highLatitudeRule = HighLatitudeRule.recommended(coords);
  // adhan reads the date from the Date's local fields, so build it from the place's calendar date.
  const t = new PrayerTimes(coords, new Date(day.y, day.m - 1, day.d), params);
  return { fajr: +t.fajr, sunrise: +t.sunrise, dhuhr: +t.dhuhr, asr: +t.asr, maghrib: +t.maghrib, isha: +t.isha };
}

/** The next prayer after `now`: today's, or tomorrow's Fajr after Isha. */
export function nextPrayer(place: Place, settings: CalcSettings, now: number): { key: (typeof PRAYER_KEYS)[number]; at: number } {
  const today = dayIn(place.tz, now);
  const times = timesFor(place, today, settings);
  for (const key of PRAYER_KEYS) if (times[key] > now) return { key, at: times[key] };
  return { key: "fajr", at: timesFor(place, addDays(today, 1), settings).fajr };
}

/** The prayer whose time it is now (Fajr ends at sunrise; the others run until the next prayer). */
export function currentPrayer(times: DayTimes, now: number): (typeof PRAYER_KEYS)[number] | null {
  if (now >= times.isha) return "isha";
  if (now >= times.maghrib) return "maghrib";
  if (now >= times.asr) return "asr";
  if (now >= times.dhuhr) return "dhuhr";
  if (now >= times.fajr && now < times.sunrise) return "fajr";
  return null;
}

/* ---------------- Formatting ---------------- */

export function formatTime(locale: string, tz: string, instant: number, withPeriod = true): string {
  const fmt = new Intl.DateTimeFormat(locale, { timeZone: tz, hour: "numeric", minute: "2-digit" });
  if (withPeriod) return fmt.format(instant);
  return fmt
    .formatToParts(instant)
    .filter((p) => p.type !== "dayPeriod")
    .map((p) => p.value)
    .join("")
    .trim();
}

export function formatGregorian(locale: string, day: DayKey, opts: Intl.DateTimeFormatOptions = { weekday: "long", day: "numeric", month: "long", year: "numeric" }) {
  return new Intl.DateTimeFormat(locale, { ...opts, timeZone: "UTC" }).format(dayInstant(day));
}

/**
 * Hijri date by the Umm al-Qura calendar, shifted by `adjust` days. Local moon sighting (e.g. Pakistan's
 * Ruet-e-Hilal committee) is often a day behind, hence the setting.
 */
export function formatHijri(locale: string, day: DayKey, adjust: number) {
  const fmt = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, { day: "numeric", month: "long", year: "numeric", timeZone: "UTC" });
  return fmt.format(dayInstant(addDays(day, adjust)));
}

/** Country name in the page language, e.g. "PK" → "پاکستان". */
export function countryName(locale: string, cc: string) {
  try {
    return new Intl.DisplayNames([locale], { type: "region" }).of(cc) ?? cc;
  } catch {
    return cc;
  }
}

/* ---------------- Qibla ---------------- */

/** Direction of the Kaaba in degrees clockwise from true north. */
export function qiblaBearing(lat: number, lng: number): number {
  return Qibla(new Coordinates(lat, lng));
}

const rad = (deg: number) => (deg * Math.PI) / 180;
const deg = (r: number) => (r * 180) / Math.PI;

/** Great-circle distance in km. */
export function distanceKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }): number {
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return 2 * 6371.0088 * Math.asin(Math.min(1, Math.sqrt(h)));
}

/** Points along the great circle from a to b (the true shortest path, drawn on the map). */
export function greatCircle(a: { lat: number; lng: number }, b: { lat: number; lng: number }, steps = 96): [number, number][] {
  const φ1 = rad(a.lat), λ1 = rad(a.lng), φ2 = rad(b.lat), λ2 = rad(b.lng);
  const δ = distanceKm(a, b) / 6371.0088;
  if (δ < 1e-9) return [[a.lat, a.lng]];
  const points: [number, number][] = [];
  let prevLng = a.lng;
  for (let i = 0; i <= steps; i++) {
    const f = i / steps;
    const A = Math.sin((1 - f) * δ) / Math.sin(δ);
    const B = Math.sin(f * δ) / Math.sin(δ);
    const x = A * Math.cos(φ1) * Math.cos(λ1) + B * Math.cos(φ2) * Math.cos(λ2);
    const y = A * Math.cos(φ1) * Math.sin(λ1) + B * Math.cos(φ2) * Math.sin(λ2);
    const z = A * Math.sin(φ1) + B * Math.sin(φ2);
    let lng = deg(Math.atan2(y, x));
    // Keep the line continuous across the antimeridian.
    while (lng - prevLng > 180) lng -= 360;
    while (lng - prevLng < -180) lng += 360;
    prevLng = lng;
    points.push([deg(Math.atan2(z, Math.hypot(x, y))), lng]);
  }
  return points;
}

/** Smallest signed difference b − a in degrees, in (−180, 180]. */
export function angleDiff(a: number, b: number) {
  const d = (((b - a) % 360) + 540) % 360 - 180;
  return d === -180 ? 180 : d;
}
