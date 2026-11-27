"use client";

import { useSyncExternalStore } from "react";
import { METHOD_IDS, defaultAsr, defaultMethod, type AsrMethod, type CalcSettings, type MethodId, type Place } from "./prayer";

/** Location and calculation choices, saved in this browser only (synced to the account later). */
export type PrayerPrefs = {
  place: Place | null;
  /** "auto" follows the place's country. */
  method: MethodId | "auto";
  asr: AsrMethod | "auto";
  /** Days added to the Umm al-Qura Hijri date, −2…+2. */
  hijriAdjust: number;
};

const KEY = "prayer:v1";
const DEFAULTS: PrayerPrefs = { place: null, method: "auto", asr: "auto", hijriAdjust: 0 };

const listeners = new Set<() => void>();
/** In private mode (storage unavailable) the prefs live here until the page is left. */
let memory: string | null = null;

function readRaw(): string | null {
  if (memory) return memory;
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}

function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}

let cache: { raw: string | null; value: PrayerPrefs } | null = null;
function parse(raw: string | null): PrayerPrefs {
  if (cache && cache.raw === raw) return cache.value;
  let value = DEFAULTS;
  try {
    const s = raw ? (JSON.parse(raw) as Partial<PrayerPrefs>) : {};
    const p = s.place;
    const validPlace =
      p && typeof p.lat === "number" && typeof p.lng === "number" && typeof p.tz === "string" && typeof p.name === "string";
    value = {
      place: validPlace ? p : null,
      method: s.method && (s.method === "auto" || METHOD_IDS.includes(s.method)) ? s.method : "auto",
      asr: s.asr === "hanafi" || s.asr === "shafi" ? s.asr : "auto",
      hijriAdjust: Number.isInteger(s.hijriAdjust) ? Math.max(-2, Math.min(2, s.hijriAdjust!)) : 0,
    };
  } catch {
    // Corrupt value: start again from the defaults.
  }
  cache = { raw, value };
  return value;
}

export function savePrayerPrefs(patch: Partial<PrayerPrefs>) {
  const next = JSON.stringify({ ...parse(readRaw()), ...patch });
  try {
    localStorage.setItem(KEY, next);
    memory = null;
  } catch {
    memory = next;
  }
  listeners.forEach((l) => l());
}

/** `null` while rendering on the server and during hydration; the saved prefs after that. */
export function usePrayerPrefs(): PrayerPrefs | null {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const hydrated = useSyncExternalStore(noSubscribe, () => true, () => false);
  return hydrated ? parse(raw) : null;
}

const noSubscribe = () => () => {};

/** The settings actually used, with "auto" resolved from the place's country. */
export function resolveSettings(prefs: PrayerPrefs, place: Place): CalcSettings {
  return {
    method: prefs.method === "auto" ? defaultMethod(place.cc) : prefs.method,
    asr: prefs.asr === "auto" ? defaultAsr(place.cc) : prefs.asr,
  };
}

/* ---------------- The current time, ticking (client only) ---------------- */

let now = 0;
let timer: ReturnType<typeof setInterval> | undefined;
const clockListeners = new Set<() => void>();

function subscribeClock(onChange: () => void) {
  clockListeners.add(onChange);
  if (!timer) {
    timer = setInterval(() => {
      now = Date.now();
      clockListeners.forEach((l) => l());
    }, 1000);
  }
  return () => {
    clockListeners.delete(onChange);
    if (!clockListeners.size) {
      clearInterval(timer);
      timer = undefined;
    }
  };
}

function readClock() {
  // Re-read after a pause (e.g. the tab was in the background) so the first render isn't stale.
  if (!timer || Date.now() - now > 1500) now = Date.now();
  return now;
}

/** Milliseconds since the epoch, updated every second; `null` on the server, so nothing time-based is prerendered. */
export function useNow(): number | null {
  const t = useSyncExternalStore(subscribeClock, readClock, () => 0);
  return t || null;
}
