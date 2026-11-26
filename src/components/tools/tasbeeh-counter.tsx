"use client";

import Link from "next/link";
import { useCallback, useMemo, useState, useSyncExternalStore } from "react";
import { fill, formatNumber } from "@/lib/format";
import { afterPrayerSteps, dhikrList, TARGETS } from "@/lib/tasbeeh";

export type TasbeehLabels = {
  modeLabel: string;
  counter: string;
  afterPrayer: string;
  dhikrLabel: string;
  targetLabel: string;
  noLimit: string;
  tap: string;
  countOf: string;
  countFree: string;
  undo: string;
  reset: string;
  undoReset: string;
  rounds: string;
  total: string;
  vibrate: string;
  roundDone: string;
  stepDone: string;
  allDone: string;
  startAgain: string;
  stepOf: string;
  afterPrayerNote: string;
  source: string;
  saved: string;
};

/* ---------------- Saved state (this browser only; synced to the account later) ---------------- */
type Saved = {
  mode: "single" | "afterPrayer";
  dhikr: string;
  /** 0 = no limit. */
  target: number;
  counts: Record<string, number>;
  rounds: Record<string, number>;
  /** After-prayer sequence: current step (3 = finished) and the count within it. */
  step: number;
  stepCount: number;
  total: number;
  vibrate: boolean;
};

const KEY = "tasbeeh:v1";
const DEFAULTS: Saved = {
  mode: "single",
  dhikr: dhikrList[0].id,
  target: 33,
  counts: {},
  rounds: {},
  step: 0,
  stepCount: 0,
  total: 0,
  vibrate: true,
};

const listeners = new Set<() => void>();
function subscribe(onChange: () => void) {
  listeners.add(onChange);
  const onStorage = (e: StorageEvent) => e.key === KEY && onChange();
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(onChange);
    window.removeEventListener("storage", onStorage);
  };
}
/** In private mode (storage unavailable) the state lives here until the page is left. */
let memory: string | null = null;
function readRaw(): string | null {
  if (memory) return memory;
  try {
    return localStorage.getItem(KEY);
  } catch {
    return null;
  }
}
function parse(raw: string | null): Saved {
  if (!raw) return DEFAULTS;
  try {
    return { ...DEFAULTS, ...(JSON.parse(raw) as Partial<Saved>) };
  } catch {
    return DEFAULTS;
  }
}
function save(next: Saved) {
  const json = JSON.stringify(next);
  try {
    localStorage.setItem(KEY, json);
    memory = null;
  } catch {
    memory = json;
  }
  listeners.forEach((l) => l());
}
const current = () => parse(readRaw());

const noSubscribe = () => () => {};
const canVibrate = () => typeof navigator.vibrate === "function";

function buzz(enabled: boolean, done: boolean) {
  if (enabled && canVibrate()) navigator.vibrate(done ? [70, 50, 70] : 12);
}

/**
 * Tap counter for dhikr: one large button with a progress ring, presets, targets and the after-prayer
 * sequence (33 · 33 · 34). Everything is saved in localStorage.
 */
export function TasbeehCounter({
  locale,
  labels,
  sourceHref,
}: {
  locale: string;
  labels: TasbeehLabels;
  /** Link to the after-prayer hadith in our reader. */
  sourceHref: string;
}) {
  const raw = useSyncExternalStore(subscribe, readRaw, () => null);
  const s = useMemo(() => parse(raw), [raw]);
  const vibrationSupported = useSyncExternalStore(noSubscribe, canVibrate, () => false);
  const [message, setMessage] = useState("");
  const [beforeReset, setBeforeReset] = useState<Saved | null>(null);

  const sequence = s.mode === "afterPrayer";
  const finished = sequence && s.step >= afterPrayerSteps.length;
  const step = afterPrayerSteps[Math.min(s.step, afterPrayerSteps.length - 1)];
  const dhikrId = sequence ? step.id : s.dhikr;
  const dhikr = dhikrList.find((d) => d.id === dhikrId) ?? dhikrList[0];
  const count = sequence ? (finished ? step.target : s.stepCount) : (s.counts[s.dhikr] ?? 0);
  const target = sequence ? step.target : s.target;
  const progress = target > 0 ? Math.min(count / target, 1) : 0;
  const n = (v: number) => formatNumber(locale, v);
  const meaning = locale === "ur" ? dhikr.meaning.ur : locale === "en" ? dhikr.meaning.en : null;

  const update = useCallback((patch: Partial<Saved>) => save({ ...current(), ...patch }), []);

  const tap = useCallback(() => {
    const c = current();
    const next: Saved = { ...c, total: c.total + 1 };
    setBeforeReset(null);
    if (c.mode === "single") {
      const was = c.counts[c.dhikr] ?? 0;
      const now = c.target > 0 && was >= c.target ? 1 : was + 1;
      next.counts = { ...c.counts, [c.dhikr]: now };
      const done = c.target > 0 && now === c.target;
      if (done) next.rounds = { ...c.rounds, [c.dhikr]: (c.rounds[c.dhikr] ?? 0) + 1 };
      buzz(c.vibrate, done);
      const name = dhikrList.find((d) => d.id === c.dhikr)?.translit ?? "";
      setMessage(done ? fill(labels.roundDone, { dhikr: name, n: formatNumber(locale, c.target) }) : "");
    } else if (c.step >= afterPrayerSteps.length) {
      // Finished: the next tap starts a new round.
      next.step = 0;
      next.stepCount = 1;
      buzz(c.vibrate, false);
      setMessage("");
    } else {
      const { id, target: t } = afterPrayerSteps[c.step];
      const now = c.stepCount + 1;
      const done = now >= t;
      next.step = done ? c.step + 1 : c.step;
      next.stepCount = done ? 0 : now;
      buzz(c.vibrate, done);
      const name = dhikrList.find((d) => d.id === id)?.translit ?? "";
      setMessage(done ? (next.step >= afterPrayerSteps.length ? labels.allDone : fill(labels.stepDone, { dhikr: name })) : "");
    }
    save(next);
  }, [labels.allDone, labels.roundDone, labels.stepDone, locale]);

  const undo = useCallback(() => {
    if (beforeReset) {
      save(beforeReset);
      setBeforeReset(null);
      return;
    }
    const c = current();
    if (c.mode === "single") {
      const was = c.counts[c.dhikr] ?? 0;
      if (!was) return;
      const patch: Partial<Saved> = { counts: { ...c.counts, [c.dhikr]: was - 1 }, total: Math.max(0, c.total - 1) };
      if (c.target > 0 && was === c.target) patch.rounds = { ...c.rounds, [c.dhikr]: Math.max(0, (c.rounds[c.dhikr] ?? 0) - 1) };
      update(patch);
    } else if (c.stepCount > 0) {
      update({ stepCount: c.stepCount - 1, total: Math.max(0, c.total - 1) });
    } else if (c.step > 0) {
      update({ step: c.step - 1, stepCount: afterPrayerSteps[c.step - 1].target - 1, total: Math.max(0, c.total - 1) });
    }
    setMessage("");
  }, [beforeReset, update]);

  const reset = useCallback(() => {
    const c = current();
    setBeforeReset(c);
    update(c.mode === "single" ? { counts: { ...c.counts, [c.dhikr]: 0 } } : { step: 0, stepCount: 0 });
    setMessage("");
  }, [update]);

  const canUndo = beforeReset !== null || (sequence ? s.step > 0 || s.stepCount > 0 : count > 0);

  return (
    <div className="mx-auto w-full max-w-xl">
      {/* Mode */}
      <div role="group" aria-label={labels.modeLabel} className="flex flex-wrap justify-center gap-1.5">
        {(["single", "afterPrayer"] as const).map((m) => (
          <button
            key={m}
            type="button"
            aria-pressed={s.mode === m}
            onClick={() => {
              update({ mode: m });
              setBeforeReset(null);
              setMessage("");
            }}
            className="chip"
          >
            {m === "single" ? labels.counter : labels.afterPrayer}
          </button>
        ))}
      </div>

      {/* Presets and target (counter mode) or the three steps (after prayer) */}
      {sequence ? (
        <ol className="mt-6 grid grid-cols-3 gap-2" aria-label={labels.afterPrayer}>
          {afterPrayerSteps.map((st, i) => {
            const d = dhikrList.find((x) => x.id === st.id)!;
            const state = i < s.step ? "done" : i === s.step ? "now" : "next";
            return (
              <li
                key={st.id}
                aria-current={state === "now" ? "step" : undefined}
                className={`glass rounded-2xl px-2 py-3 text-center ${state === "now" ? "ring-2 ring-gold-500" : ""} ${state === "next" ? "opacity-60" : ""}`}
              >
                <span lang="ar" dir="rtl" className="block font-arabic-display text-lg text-ink">
                  {d.ar}
                </span>
                <span className="mt-1 block text-xs text-muted">
                  {state === "done" ? "✓ " : ""}
                  {n(st.target)}
                </span>
                <span className="sr-only">{fill(labels.stepOf, { n: n(i + 1), total: n(afterPrayerSteps.length) })}</span>
              </li>
            );
          })}
        </ol>
      ) : (
        <>
          <fieldset className="mt-6">
            <legend className="mb-2 text-sm font-bold text-ink">{labels.dhikrLabel}</legend>
            <div className="grid grid-cols-2 gap-2">
              {dhikrList.map((d) => (
                <button
                  key={d.id}
                  type="button"
                  aria-pressed={s.dhikr === d.id}
                  onClick={() => {
                    update({ dhikr: d.id });
                    setBeforeReset(null);
                    setMessage("");
                  }}
                  className="dhikr-option"
                >
                  <span lang="ar" dir="rtl" className="block font-arabic-display text-lg leading-snug">
                    {d.ar}
                  </span>
                  <span lang="en" dir="ltr" className="mt-0.5 block text-xs opacity-80">
                    {d.translit}
                  </span>
                </button>
              ))}
            </div>
          </fieldset>
          <div role="group" aria-label={labels.targetLabel} className="mt-4 flex flex-wrap items-center gap-1.5">
            <span className="me-1 text-sm font-bold text-ink">{labels.targetLabel}</span>
            {TARGETS.map((t) => (
              <button key={t} type="button" aria-pressed={s.target === t} onClick={() => update({ target: t })} className="chip">
                {t ? n(t) : labels.noLimit}
              </button>
            ))}
          </div>
        </>
      )}

      {/* Current dhikr */}
      <div className="mt-8 text-center">
        <p lang="ar" dir="rtl" className="font-arabic-display text-3xl leading-relaxed text-ink sm:text-4xl">
          {dhikr.ar}
        </p>
        <p lang="en" dir="ltr" className="mt-1 text-sm font-semibold text-accent">
          {dhikr.translit}
        </p>
        {meaning && <p className="mt-1 text-sm text-muted">{meaning}</p>}
      </div>

      {/* Counter */}
      <div className="relative mx-auto mt-6 grid size-64 place-items-center sm:size-72">
        <svg viewBox="0 0 100 100" aria-hidden="true" className="pointer-events-none absolute inset-0 size-full -rotate-90 rtl:-scale-y-100">
          <circle cx="50" cy="50" r="47" pathLength={100} className="fill-none stroke-line" strokeWidth="2.5" />
          <circle
            cx="50"
            cy="50"
            r="47"
            pathLength={100}
            strokeDasharray="100"
            strokeDashoffset={100 - progress * 100}
            strokeLinecap="round"
            strokeWidth="2.5"
            className="fill-none stroke-gold-500 transition-[stroke-dashoffset] duration-300"
          />
        </svg>
        <button
          type="button"
          onClick={tap}
          aria-label={
            target > 0
              ? fill(labels.countOf, { dhikr: dhikr.translit, n: n(count), target: n(target) })
              : fill(labels.countFree, { dhikr: dhikr.translit, n: n(count) })
          }
          className="tasbeeh-button"
        >
          <span className="font-sans text-6xl font-bold tabular-nums">{n(count)}</span>
          <span className="mt-1 text-sm text-cream-100/80">
            {finished ? labels.startAgain : target > 0 ? `/ ${n(target)}` : labels.tap}
          </span>
        </button>
      </div>

      <p role="status" aria-live="polite" className="mt-4 min-h-6 text-center text-sm font-semibold text-accent">
        {message}
      </p>

      <div className="mt-2 flex flex-wrap items-center justify-center gap-2">
        <button type="button" onClick={undo} disabled={!canUndo} className="chip">
          {beforeReset ? labels.undoReset : labels.undo}
        </button>
        <button type="button" onClick={reset} disabled={!canUndo && !beforeReset} className="chip">
          {labels.reset}
        </button>
        {vibrationSupported && (
          <label className="chip cursor-pointer gap-2">
            <input
              type="checkbox"
              checked={s.vibrate}
              onChange={(e) => update({ vibrate: e.target.checked })}
              className="size-4 accent-brand-600"
            />
            {labels.vibrate}
          </label>
        )}
      </div>

      <dl className="mt-6 grid grid-cols-2 gap-3 text-center">
        {!sequence && (
          <div className="glass rounded-2xl p-3">
            <dt className="text-xs text-muted">{labels.rounds}</dt>
            <dd className="mt-1 text-xl font-bold text-ink tabular-nums">{n(s.rounds[s.dhikr] ?? 0)}</dd>
          </div>
        )}
        <div className={`glass rounded-2xl p-3 ${sequence ? "col-span-2" : ""}`}>
          <dt className="text-xs text-muted">{labels.total}</dt>
          <dd className="mt-1 text-xl font-bold text-ink tabular-nums">{n(s.total)}</dd>
        </div>
      </dl>

      {sequence && (
        <p className="mt-6 text-sm leading-relaxed text-muted">
          {labels.afterPrayerNote}{" "}
          <Link href={sourceHref} className="font-semibold text-accent underline underline-offset-2">
            {labels.source}
          </Link>
        </p>
      )}
      <p className="mt-6 text-center text-xs text-muted">{labels.saved}</p>
    </div>
  );
}
