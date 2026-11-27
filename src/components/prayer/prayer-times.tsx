"use client";

import { useMemo, useState } from "react";
import { ArrowIcon } from "@/components/icons";
import { fill, formatNumber } from "@/lib/format";
import {
  METHOD_IDS,
  TIME_KEYS,
  addDays,
  currentPrayer,
  dayIn,
  dayInstant,
  daysInMonth,
  defaultAsr,
  defaultMethod,
  formatGregorian,
  formatHijri,
  formatTime,
  nextPrayer,
  sameDay,
  timesFor,
  type CalcSettings,
  type DayKey,
  type MethodId,
  type Place,
} from "@/lib/prayer";
import { resolveSettings, savePrayerPrefs, useNow, usePrayerPrefs, type PrayerPrefs } from "@/lib/prayer-store";
import { LocationPicker, placeLines, type LocationLabels } from "./location-picker";

type TimeName = (typeof TIME_KEYS)[number] | "jumuah";

export type PrayerLabels = {
  names: Record<TimeName, string>;
  location: LocationLabels;
  today: string;
  backToToday: string;
  previousDay: string;
  nextDay: string;
  hijri: string;
  nextPrayer: string;
  inTime: string;
  hoursMinutes: string;
  minutes: string;
  underMinute: string;
  now: string;
  sunriseNote: string;
  timezoneNote: string;
  settings: {
    title: string;
    method: string;
    auto: string;
    asr: string;
    asrShafi: string;
    asrHanafi: string;
    autoAsr: string;
    hijriAdjust: string;
    hijriAdjustHelp: string;
    days: string;
  };
  methods: Record<MethodId, string>;
  month: { show: string; hide: string; title: string; date: string; previous: string; next: string; print: string };
  disclaimer: string;
};

/** "2 h 05 min" until `at`. */
export function countdown(locale: string, labels: Pick<PrayerLabels, "hoursMinutes" | "minutes" | "underMinute">, ms: number) {
  const totalMin = Math.floor(ms / 60000);
  if (totalMin < 1) return labels.underMinute;
  const h = Math.floor(totalMin / 60);
  const m = totalMin % 60;
  const n = (v: number) => formatNumber(locale, v);
  return h ? fill(labels.hoursMinutes, { h: n(h), m: n(m) }) : fill(labels.minutes, { m: n(m) });
}

const isFriday = (day: DayKey) => new Date(dayInstant(day)).getUTCDay() === 5;

/** Prayer times for the saved place: today (or another day), the next prayer, settings and a monthly timetable. */
export function PrayerTimesView({ locale, labels }: { locale: string; labels: PrayerLabels }) {
  const prefs = usePrayerPrefs();
  const now = useNow();

  if (!prefs || !now) {
    return <div aria-busy="true" className="glass mx-auto h-40 w-full max-w-2xl animate-pulse rounded-2xl" />;
  }

  return (
    <div className="mx-auto w-full max-w-2xl">
      <LocationPicker place={prefs.place} locale={locale} labels={labels.location} />
      {prefs.place && <Times place={prefs.place} prefs={prefs} now={now} locale={locale} labels={labels} />}
    </div>
  );
}

function Times({ place, prefs, now, locale, labels }: { place: Place; prefs: PrayerPrefs; now: number; locale: string; labels: PrayerLabels }) {
  const [offset, setOffset] = useState(0);
  const [showMonth, setShowMonth] = useState(false);
  // prefs and place keep their identity until they change, so this (and the timetable) isn't redone every second.
  const settings = useMemo(() => resolveSettings(prefs, place), [prefs, place]);
  const today = dayIn(place.tz, now);
  const day = addDays(today, offset);
  const isToday = offset === 0;
  // One day takes microseconds to calculate, so it is simply redone with each clock tick.
  const times = timesFor(place, day, settings);
  const current = isToday ? currentPrayer(times, now) : null;
  const next = nextPrayer(place, settings, now);
  const friday = isFriday(day);
  const browserTz = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const time = (t: number) => formatTime(locale, place.tz, t);
  const nameOf = (key: TimeName) => (key === "dhuhr" && friday ? `${labels.names.dhuhr} · ${labels.names.jumuah}` : labels.names[key]);

  return (
    <>
      {/* Next prayer */}
      <section aria-label={labels.nextPrayer} className="prayer-next mt-4 rounded-3xl p-5 text-center sm:p-6">
        <p className="text-sm font-semibold text-cream-100/80">{labels.nextPrayer}</p>
        <p className="font-heading mt-1 text-3xl font-bold text-cream-50 sm:text-4xl">
          {labels.names[next.key === "dhuhr" && isFriday(dayIn(place.tz, next.at)) ? "jumuah" : next.key]}
        </p>
        <p className="mt-1 text-2xl font-bold text-gold-300 tabular-nums">{time(next.at)}</p>
        <p className="mt-1 text-sm text-cream-100/85">{fill(labels.inTime, { time: countdown(locale, labels, next.at - now) })}</p>
      </section>

      {/* Day */}
      <section aria-labelledby="prayer-day" className="glass mt-4 rounded-3xl p-4 sm:p-6">
        <div className="flex items-center justify-between gap-2">
          <button type="button" onClick={() => setOffset((o) => o - 1)} aria-label={labels.previousDay} className="chip size-11 justify-center px-0">
            <ArrowIcon className="size-5 -scale-x-100 rtl:scale-x-100" />
          </button>
          <div className="min-w-0 text-center">
            <h2 id="prayer-day" className="font-bold text-ink">
              {isToday && <span className="text-accent">{labels.today} · </span>}
              {formatGregorian(locale, day)}
            </h2>
            <p className="mt-0.5 text-sm text-muted">
              <span className="sr-only">{labels.hijri}: </span>
              {formatHijri(locale, day, prefs.hijriAdjust)}
            </p>
          </div>
          <button type="button" onClick={() => setOffset((o) => o + 1)} aria-label={labels.nextDay} className="chip size-11 justify-center px-0">
            <ArrowIcon className="size-5 rtl:-scale-x-100" />
          </button>
        </div>
        {!isToday && (
          <p className="mt-2 text-center">
            <button type="button" onClick={() => setOffset(0)} className="text-sm font-semibold text-accent underline underline-offset-2">
              {labels.backToToday}
            </button>
          </p>
        )}

        <ol className="mt-4 divide-y divide-line">
          {TIME_KEYS.map((key) => {
            const isNow = current === key;
            const sunrise = key === "sunrise";
            return (
              <li
                key={key}
                aria-current={isNow ? "time" : undefined}
                className={`flex min-h-14 items-center justify-between gap-3 rounded-xl px-3 ${isNow ? "prayer-now" : ""} ${sunrise ? "text-muted" : ""}`}
              >
                <span className={`flex items-center gap-2 ${sunrise ? "text-sm" : "font-semibold text-ink"}`}>
                  {nameOf(key)}
                  {isNow && <span className="rounded-full bg-gold-400 px-2 py-0.5 text-xs font-bold text-brand-900">{labels.now}</span>}
                </span>
                <span className={`tabular-nums ${sunrise ? "text-sm" : "text-lg font-bold text-ink"}`}>{time(times[key])}</span>
              </li>
            );
          })}
        </ol>
        <p className="mt-3 text-xs text-muted">{labels.sunriseNote}</p>
        {place.tz !== browserTz && (
          <p className="mt-1 text-xs text-muted">{fill(labels.timezoneNote, { place: placeLines(locale, place, labels.location).main, tz: place.tz })}</p>
        )}
      </section>

      <Settings place={place} prefs={prefs} settings={settings} locale={locale} labels={labels} />

      <div className="mt-4 text-center">
        <button type="button" aria-expanded={showMonth} onClick={() => setShowMonth((v) => !v)} className="chip">
          {showMonth ? labels.month.hide : labels.month.show}
        </button>
      </div>
      {showMonth && <MonthTable place={place} settings={settings} today={today} start={day} locale={locale} labels={labels} hijriAdjust={prefs.hijriAdjust} />}

      <p className="mt-6 text-center text-sm leading-relaxed text-muted">{labels.disclaimer}</p>
    </>
  );
}

function Settings({
  place,
  prefs,
  settings,
  locale,
  labels,
}: {
  place: Place;
  prefs: PrayerPrefs;
  settings: CalcSettings;
  locale: string;
  labels: PrayerLabels;
}) {
  const s = labels.settings;
  const autoMethod = labels.methods[defaultMethod(place.cc)];
  const autoAsr = defaultAsr(place.cc) === "hanafi" ? s.asrHanafi : s.asrShafi;
  const signed = (n: number) => (n > 0 ? "+" : "") + formatNumber(locale, n);

  return (
    <details className="prayer-settings glass mt-4 rounded-3xl">
      <summary className="flex min-h-14 cursor-pointer items-center justify-between gap-3 px-5 font-bold text-ink">
        <span>{s.title}</span>
        <span className="truncate text-sm font-normal text-muted">
          {labels.methods[settings.method]} · {labels.names.asr}: {settings.asr === "hanafi" ? s.asrHanafi : s.asrShafi}
        </span>
      </summary>
      <div className="grid gap-4 px-5 pb-5">
        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          {s.method}
          <select
            className="field-select"
            value={prefs.method}
            onChange={(e) => savePrayerPrefs({ method: e.target.value as PrayerPrefs["method"] })}
          >
            <option value="auto">{fill(s.auto, { name: autoMethod })}</option>
            {METHOD_IDS.map((id) => (
              <option key={id} value={id}>
                {labels.methods[id]}
              </option>
            ))}
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          {s.asr}
          <select className="field-select" value={prefs.asr} onChange={(e) => savePrayerPrefs({ asr: e.target.value as PrayerPrefs["asr"] })}>
            <option value="auto">{fill(s.autoAsr, { name: autoAsr })}</option>
            <option value="shafi">{s.asrShafi}</option>
            <option value="hanafi">{s.asrHanafi}</option>
          </select>
        </label>
        <label className="grid gap-1.5 text-sm font-semibold text-ink">
          {s.hijriAdjust}
          <select
            className="field-select"
            value={prefs.hijriAdjust}
            onChange={(e) => savePrayerPrefs({ hijriAdjust: Number(e.target.value) })}
          >
            {[-2, -1, 0, 1, 2].map((n) => (
              <option key={n} value={n}>
                {fill(s.days, { n: signed(n) })}
              </option>
            ))}
          </select>
          <span className="text-xs font-normal text-muted">{s.hijriAdjustHelp}</span>
        </label>
      </div>
    </details>
  );
}

function MonthTable({
  place,
  settings,
  today,
  start,
  locale,
  labels,
  hijriAdjust,
}: {
  place: Place;
  settings: CalcSettings;
  today: DayKey;
  start: DayKey;
  locale: string;
  labels: PrayerLabels;
  hijriAdjust: number;
}) {
  const [month, setMonth] = useState({ y: start.y, m: start.m });
  const rows = useMemo(
    () =>
      Array.from({ length: daysInMonth(month.y, month.m) }, (_, i) => {
        const day = { y: month.y, m: month.m, d: i + 1 };
        return { day, times: timesFor(place, day, settings) };
      }),
    [month, place, settings],
  );
  const shift = (by: number) =>
    setMonth(({ y, m }) => {
      const t = new Date(Date.UTC(y, m - 1 + by, 1));
      return { y: t.getUTCFullYear(), m: t.getUTCMonth() + 1 };
    });
  const monthName = formatGregorian(locale, { ...month, d: 1 }, { month: "long", year: "numeric" });
  const hijriDay = new Intl.DateTimeFormat(`${locale}-u-ca-islamic-umalqura`, { day: "numeric", month: "short", timeZone: "UTC" });
  const weekday = new Intl.DateTimeFormat(locale, { weekday: "short", timeZone: "UTC" });
  const title = fill(labels.month.title, { month: monthName });

  return (
    <section aria-label={title} className="print-area glass mt-4 rounded-3xl p-3 sm:p-5">
      <div className="flex items-center justify-between gap-2">
        <button type="button" onClick={() => shift(-1)} aria-label={labels.month.previous} className="chip size-11 justify-center px-0 print:hidden">
          <ArrowIcon className="size-5 -scale-x-100 rtl:scale-x-100" />
        </button>
        <h2 className="text-center font-bold text-ink">
          {title}
          <span className="block text-sm font-normal text-muted">{placeLines(locale, place, labels.location).main}</span>
        </h2>
        <button type="button" onClick={() => shift(1)} aria-label={labels.month.next} className="chip size-11 justify-center px-0 print:hidden">
          <ArrowIcon className="size-5 rtl:-scale-x-100" />
        </button>
      </div>
      <div className="mt-3 overflow-x-auto">
        <table className="prayer-table w-full text-center text-xs tabular-nums sm:text-sm">
          <thead>
            <tr>
              <th scope="col">{labels.month.date}</th>
              {TIME_KEYS.map((k) => (
                <th key={k} scope="col">
                  {labels.names[k]}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map(({ day, times }) => {
              const isToday = sameDay(day, today);
              return (
                <tr key={day.d} aria-current={isToday ? "date" : undefined} className={isToday ? "prayer-now" : ""}>
                  <th scope="row" className="whitespace-nowrap">
                    <span className="block font-bold text-ink">
                      {formatNumber(locale, day.d)} {weekday.format(dayInstant(day))}
                    </span>
                    <span className="block font-normal text-muted">{hijriDay.format(dayInstant(addDays(day, hijriAdjust)))}</span>
                  </th>
                  {TIME_KEYS.map((k) => (
                    <td key={k} className={k === "sunrise" ? "text-muted" : "text-ink"}>
                      {formatTime(locale, place.tz, times[k], false)}
                    </td>
                  ))}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <p className="mt-3 text-center print:hidden">
        <button type="button" onClick={() => window.print()} className="chip">
          {labels.month.print}
        </button>
      </p>
    </section>
  );
}

