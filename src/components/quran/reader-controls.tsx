"use client";

import { useCallback, useEffect, useId, useMemo, useRef, useState, useSyncExternalStore } from "react";
import { CloseIcon, NextIcon, PauseIcon, PlayIcon, PrevIcon, SlidersIcon } from "@/components/icons";
import { fill, formatNumber } from "@/lib/format";
import {
  applyPrefsToReader,
  parsePrefs,
  readPrefsRaw,
  savePrefs,
  SIZE_MAX,
  SIZE_MIN,
  SIZE_STEP,
  subscribePrefs,
  type ReaderPrefs,
} from "@/lib/reader-prefs";
import { reciters, verseAudioUrl } from "@/lib/reciters";

export type ReaderLabels = {
  translations: string;
  urdu: string;
  english: string;
  textSize: string;
  smaller: string;
  larger: string;
  notesError: string;
  copied: string;
  linkCopied: string;
  copyFailed: string;
  goToVerse: string;
  go: string;
  playSurah: string;
  play: string;
  pause: string;
  previous: string;
  next: string;
  reciter: string;
  repeat: string;
  once: string;
  times: string;
  speed: string;
  follow: string;
  close: string;
  nowPlaying: string;
  loading: string;
  error: string;
  options: string;
  bismillah: string;
};

const REPEAT_OPTIONS = [1, 2, 3, 5, 10, 0];
const SPEED_OPTIONS = [0.75, 1, 1.25, 1.5];

/**
 * Sticky reading toolbar (translations, text size, play) plus the floating audio player.
 * Verses are server-rendered; this component drives them through the DOM:
 * it toggles data attributes on #reader, listens for clicks on [data-play-verse],
 * and marks the playing verse with data-active.
 */
export function ReaderControls({
  locale,
  surah,
  surahName,
  totalVerses,
  hasBismillah,
  labels,
}: {
  locale: string;
  surah: number;
  surahName: string;
  totalVerses: number;
  hasBismillah: boolean;
  labels: ReaderLabels;
}) {
  const raw = useSyncExternalStore(subscribePrefs, readPrefsRaw, () => null);
  const prefs = useMemo(() => parsePrefs(raw, locale), [raw, locale]);
  const prefsRef = useRef(prefs);
  useEffect(() => {
    prefsRef.current = prefs;
  }, [prefs]);

  const update = useCallback(
    (patch: Partial<ReaderPrefs>) => {
      const next = { ...parsePrefs(readPrefsRaw(), locale), ...patch };
      prefsRef.current = next;
      savePrefs(next);
    },
    [locale],
  );

  // Keep the reader's translation visibility and text size in sync with saved prefs.
  useEffect(() => {
    const el = document.getElementById("reader");
    if (el) applyPrefsToReader(el, parsePrefs(readPrefsRaw(), locale));
  }, [raw, locale]);

  /* ---------------- Audio ---------------- */
  const audioRef = useRef<HTMLAudioElement>(null);
  const preloadRef = useRef<HTMLAudioElement | null>(null);
  const progressRef = useRef<HTMLSpanElement>(null);
  const verseRef = useRef(0);
  const playsLeft = useRef(1);
  const playingRef = useRef(false);

  const [active, setActive] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [verse, setVerse] = useState(0);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [showOptions, setShowOptions] = useState(false);
  const optionsId = useId();
  const goId = useId();
  const goInputRef = useRef<HTMLInputElement>(null);
  const [toast, setToast] = useState<string | null>(null);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 2200);
    return () => clearTimeout(t);
  }, [toast]);

  /** Scrolls to a verse, flashes it and moves focus there (also used for #v-N links). */
  const goTo = useCallback((n: number) => {
    const el = document.getElementById(`v-${n}`);
    if (!el) return;
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "start" });
    el.removeAttribute("data-flash");
    void el.offsetWidth; // restart the flash animation
    el.setAttribute("data-flash", "true");
    el.tabIndex = -1;
    el.focus({ preventScroll: true });
    history.replaceState(null, "", `#v-${n}`);
  }, []);

  // Open at the verse in the URL (#v-255), on load and when the hash changes.
  useEffect(() => {
    const fromHash = () => {
      const m = /^#v-(\d+)$/.exec(window.location.hash);
      if (m) goTo(Number(m[1]));
    };
    fromHash();
    window.addEventListener("hashchange", fromHash);
    return () => window.removeEventListener("hashchange", fromHash);
  }, [goTo]);

  /** Arabic plus the translations currently shown, without footnote markers. */
  const shareTextFor = useCallback((n: number) => {
    const li = document.getElementById(`v-${n}`);
    const root = document.getElementById("reader");
    if (!li || !root) return "";
    const parts = [li.querySelector(".quran-text")?.textContent?.trim() ?? ""];
    for (const lang of ["ur", "en"] as const) {
      if (root.dataset[lang === "ur" ? "trUr" : "trEn"] !== "true") continue;
      const p = li.querySelector(`.tr-${lang} > p`);
      if (!p) continue;
      const clone = p.cloneNode(true) as HTMLElement;
      clone.querySelectorAll(".fn-ref").forEach((sup) => sup.remove());
      parts.push((clone.textContent ?? "").replace(/\s+/g, " ").trim());
    }
    return parts.filter(Boolean).join("\n\n");
  }, []);

  // Copy and share buttons rendered next to each verse.
  useEffect(() => {
    const root = document.getElementById("reader");
    if (!root) return;
    const onClick = async (e: MouseEvent) => {
      const target = e.target as Element;
      const copyBtn = target.closest<HTMLElement>("[data-copy-verse]");
      const shareBtn = target.closest<HTMLElement>("[data-share-verse]");
      if (!copyBtn && !shareBtn) return;
      const n = Number(copyBtn ? copyBtn.dataset.copyVerse : shareBtn!.dataset.shareVerse);
      const url = `${window.location.origin}/${locale}/quran/${surah}#v-${n}`;
      const reference = `${surahName} ${surah}:${n}`;
      const text = `${shareTextFor(n)}\n\n(${reference})`;
      try {
        if (shareBtn && typeof navigator.share === "function") {
          await navigator.share({ title: reference, text, url });
          return;
        }
        await navigator.clipboard.writeText(copyBtn ? `${text}\n${url}` : url);
        setToast(copyBtn ? labels.copied : labels.linkCopied);
      } catch (err) {
        // Closing the share sheet is not an error.
        if (!(err instanceof DOMException && err.name === "AbortError")) setToast(labels.copyFailed);
      }
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [locale, surah, surahName, shareTextFor, labels.copied, labels.linkCopied, labels.copyFailed]);

  const srcFor = useCallback(
    (n: number, reciter: string) => (n === 0 ? verseAudioUrl(reciter, 1, 1) : verseAudioUrl(reciter, surah, n)),
    [surah],
  );

  const start = useCallback(
    (n: number) => {
      const audio = audioRef.current;
      if (!audio) return;
      const p = prefsRef.current;
      verseRef.current = n;
      playsLeft.current = n === 0 ? 1 : p.repeat === 0 ? Infinity : p.repeat;
      setActive(true);
      setVerse(n);
      setStatus("loading");
      audio.src = srcFor(n, p.reciter);
      audio.playbackRate = p.speed;
      audio.play().catch((err: unknown) => {
        // AbortError just means another verse was requested before this one started.
        if (!(err instanceof DOMException && err.name === "AbortError")) setStatus("error");
      });
      // Warm up the next verse so playback flows without a gap.
      if (n < totalVerses) {
        preloadRef.current ??= new Audio();
        preloadRef.current.preload = "auto";
        preloadRef.current.src = srcFor(n + 1, p.reciter);
      }
    },
    [srcFor, totalVerses],
  );

  const firstVerse = hasBismillah ? 0 : 1;

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (!active) return start(firstVerse);
    if (audio.paused) audio.play().catch(() => setStatus("error"));
    else audio.pause();
  }, [active, firstVerse, start]);

  const step = useCallback(
    (delta: number) => {
      const n = Math.min(totalVerses, Math.max(firstVerse, verseRef.current + delta));
      start(n);
    },
    [firstVerse, start, totalVerses],
  );

  function onEnded() {
    const audio = audioRef.current;
    if (!audio) return;
    playsLeft.current -= 1;
    if (playsLeft.current > 0) {
      audio.currentTime = 0;
      audio.play().catch(() => setStatus("error"));
    } else if (verseRef.current < totalVerses) {
      start(verseRef.current + 1);
    } else {
      setPlaying(false);
    }
  }

  function close() {
    audioRef.current?.pause();
    setActive(false);
    setShowOptions(false);
    document.querySelectorAll("#reader [data-active]").forEach((el) => el.removeAttribute("data-active"));
  }

  // Clicks on the play buttons rendered next to each verse.
  useEffect(() => {
    const root = document.getElementById("reader");
    if (!root) return;
    const onClick = (e: MouseEvent) => {
      const button = (e.target as Element).closest<HTMLElement>("[data-play-verse]");
      if (!button) return;
      const n = Number(button.dataset.playVerse);
      if (n === verseRef.current && playingRef.current) audioRef.current?.pause();
      else start(n);
    };
    root.addEventListener("click", onClick);
    return () => root.removeEventListener("click", onClick);
  }, [start]);

  // Footnotes are fetched the first time a "Footnotes" toggle is opened (one small file per surah and language).
  useEffect(() => {
    const root = document.getElementById("reader");
    if (!root) return;
    const cache = new Map<string, Promise<Record<string, string>>>();
    const onToggle = (e: Event) => {
      const details = e.target as HTMLElement;
      if (!(details instanceof HTMLDetailsElement) || !details.open || !details.dataset.notesLang) return;
      const body = details.querySelector<HTMLElement>(".notes-body");
      if (!body || body.dataset.loaded) return;
      const url = `/quran/notes/${details.dataset.notesLang}/${String(surah).padStart(3, "0")}.json`;
      if (!cache.has(url)) {
        cache.set(
          url,
          fetch(url).then((r) => {
            if (!r.ok) throw new Error(String(r.status));
            return r.json() as Promise<Record<string, string>>;
          }),
        );
      }
      body.textContent = labels.loading;
      cache
        .get(url)!
        .then((notes) => {
          body.textContent = notes[details.dataset.notesVerse ?? ""] ?? "";
          body.dataset.loaded = "true";
        })
        .catch(() => {
          cache.delete(url);
          body.textContent = labels.notesError;
        });
    };
    // "toggle" doesn't bubble, so listen in the capture phase.
    root.addEventListener("toggle", onToggle, true);
    return () => root.removeEventListener("toggle", onToggle, true);
  }, [surah, labels.loading, labels.notesError]);

  // Highlight and follow the verse being recited.
  useEffect(() => {
    if (!active) return;
    document.querySelectorAll("#reader [data-active]").forEach((el) => el.removeAttribute("data-active"));
    const el = document.getElementById(`v-${verse}`);
    if (!el) return;
    el.setAttribute("data-active", "true");
    if (prefsRef.current.follow) {
      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      el.scrollIntoView({ behavior: reduce ? "auto" : "smooth", block: "center" });
    }
  }, [verse, active]);

  // Reflect playing state on the per-verse buttons (aria-pressed) for screen readers and styling.
  useEffect(() => {
    playingRef.current = playing;
    document.querySelectorAll<HTMLElement>("#reader [data-play-verse]").forEach((b) => {
      b.setAttribute("aria-pressed", String(playing && Number(b.dataset.playVerse) === verse));
    });
  }, [playing, verse]);

  useEffect(() => {
    if (audioRef.current) audioRef.current.playbackRate = prefs.speed;
  }, [prefs.speed]);

  // Lock-screen / headset controls.
  useEffect(() => {
    if (!active || !("mediaSession" in navigator)) return;
    const reciter = reciters.find((r) => r.id === prefs.reciter) ?? reciters[0];
    navigator.mediaSession.metadata = new MediaMetadata({
      title: verse === 0 ? `${surahName} · ${labels.bismillah}` : `${surahName} · ${verse}`,
      artist: locale === "en" ? reciter.name : reciter.nameAr,
      album: "Improve Your Akhirah",
      artwork: [{ src: "/brand/logo-512.png", sizes: "512x512", type: "image/png" }],
    });
    navigator.mediaSession.setActionHandler("play", () => audioRef.current?.play());
    navigator.mediaSession.setActionHandler("pause", () => audioRef.current?.pause());
    navigator.mediaSession.setActionHandler("previoustrack", () => step(-1));
    navigator.mediaSession.setActionHandler("nexttrack", () => step(1));
  }, [active, verse, prefs.reciter, surahName, labels.bismillah, locale, step]);

  // Stop audio when leaving the page.
  useEffect(() => {
    const audio = audioRef.current;
    return () => audio?.pause();
  }, []);

  const verseText = verse === 0 ? labels.bismillah : formatNumber(locale, verse);
  const statusText =
    status === "error" ? labels.error : status === "loading" ? labels.loading : fill(labels.nowPlaying, { surah: surahName, n: verseText });

  return (
    <>
      {/* Reading toolbar */}
      <div className="sticky top-16 z-40 border-b border-line/60 bg-surface/80 backdrop-blur-xl">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-2 px-4 py-2">
          <button type="button" onClick={togglePlay} className="btn btn-gold min-h-11 px-5 text-sm">
            {playing ? <PauseIcon className="size-5" /> : <PlayIcon className="size-5" />}
            {playing ? labels.pause : active ? labels.play : labels.playSurah}
          </button>

          <form
            onSubmit={(e) => {
              e.preventDefault();
              const n = Number(goInputRef.current?.value);
              if (Number.isInteger(n) && n >= 1 && n <= totalVerses) goTo(n);
            }}
            className="flex items-center gap-1"
          >
            <label htmlFor={goId} className="sr-only">
              {labels.goToVerse}
            </label>
            <input
              ref={goInputRef}
              id={goId}
              type="number"
              inputMode="numeric"
              min={1}
              max={totalVerses}
              placeholder="#"
              title={labels.goToVerse}
              className="chip verse-input w-18 justify-center text-center text-ink"
            />
            <button type="submit" className="chip">
              {labels.go}
            </button>
          </form>

          <div className="flex items-center gap-2">
            <div role="group" aria-label={labels.translations} className="flex gap-1">
              {(["ur", "en"] as const).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  aria-pressed={prefs.tr[lang]}
                  onClick={() => update({ tr: { ...prefs.tr, [lang]: !prefs.tr[lang] } })}
                  className="chip"
                >
                  {lang === "ur" ? labels.urdu : labels.english}
                </button>
              ))}
            </div>
            <div role="group" aria-label={labels.textSize} className="flex gap-1">
              <button
                type="button"
                aria-label={labels.smaller}
                title={labels.smaller}
                disabled={prefs.size <= SIZE_MIN}
                onClick={() => update({ size: Math.max(SIZE_MIN, +(prefs.size - SIZE_STEP).toFixed(1)) })}
                className="chip w-11 justify-center px-0"
              >
                <span aria-hidden="true" className="text-sm font-bold">
                  A−
                </span>
              </button>
              <button
                type="button"
                aria-label={labels.larger}
                title={labels.larger}
                disabled={prefs.size >= SIZE_MAX}
                onClick={() => update({ size: Math.min(SIZE_MAX, +(prefs.size + SIZE_STEP).toFixed(1)) })}
                className="chip w-11 justify-center px-0"
              >
                <span aria-hidden="true" className="text-lg font-bold">
                  A+
                </span>
              </button>
            </div>
          </div>
        </div>
      </div>

      <audio
        ref={audioRef}
        preload="auto"
        onPlay={() => setPlaying(true)}
        onPause={() => setPlaying(false)}
        onPlaying={() => setStatus("idle")}
        onWaiting={() => setStatus("loading")}
        onError={() => active && setStatus("error")}
        onEnded={onEnded}
        onTimeUpdate={(e) => {
          const a = e.currentTarget;
          if (progressRef.current && a.duration) {
            progressRef.current.style.transform = `scaleX(${a.currentTime / a.duration})`;
          }
        }}
      />

      {/* Confirmation after copy/share */}
      <p
        role="status"
        aria-live="polite"
        className={`pointer-events-none fixed inset-x-0 z-50 mx-auto w-fit rounded-full bg-brand-900/95 px-5 py-2.5 text-sm font-semibold text-cream-100 shadow-lg backdrop-blur transition-all duration-300 ${
          active ? "bottom-28" : "bottom-6"
        } ${toast ? "translate-y-0 opacity-100" : "translate-y-2 opacity-0"}`}
      >
        {toast}
      </p>

      {/* Floating player */}
      {active && (
        <div className="fixed inset-x-0 bottom-0 z-50 px-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="mx-auto max-w-2xl animate-fade-up overflow-hidden rounded-3xl border border-gold-400/30 bg-brand-900/90 text-cream-100 shadow-[0_20px_50px_-20px_rgb(0_0_0/0.7)] backdrop-blur-xl">
            <span aria-hidden="true" className="block h-0.5 bg-white/10">
              <span
                ref={progressRef}
                className="block h-full origin-left bg-linear-to-r from-gold-300 to-gold-500 transition-transform duration-200 rtl:origin-right"
                style={{ transform: "scaleX(0)" }}
              />
            </span>

            {showOptions && (
              <div id={optionsId} className="grid gap-3 border-b border-white/10 p-4 sm:grid-cols-3">
                <label className="flex flex-col gap-1 text-xs text-cream-100/70">
                  {labels.reciter}
                  <select
                    value={prefs.reciter}
                    onChange={(e) => {
                      update({ reciter: e.target.value });
                      if (active) start(verseRef.current);
                    }}
                    className="player-select"
                  >
                    {reciters.map((r) => (
                      <option key={r.id} value={r.id}>
                        {locale === "en" ? r.name : r.nameAr}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs text-cream-100/70">
                  {labels.repeat}
                  <select
                    value={prefs.repeat}
                    onChange={(e) => {
                      const repeat = Number(e.target.value);
                      update({ repeat });
                      playsLeft.current = repeat === 0 ? Infinity : repeat;
                    }}
                    className="player-select"
                  >
                    {REPEAT_OPTIONS.map((n) => (
                      <option key={n} value={n}>
                        {n === 1 ? labels.once : n === 0 ? "∞" : fill(labels.times, { n: formatNumber(locale, n) })}
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex flex-col gap-1 text-xs text-cream-100/70">
                  {labels.speed}
                  <select
                    value={prefs.speed}
                    onChange={(e) => update({ speed: Number(e.target.value) })}
                    className="player-select"
                  >
                    {SPEED_OPTIONS.map((s) => (
                      <option key={s} value={s}>
                        {formatNumber(locale, s)}×
                      </option>
                    ))}
                  </select>
                </label>
                <label className="flex min-h-11 items-center gap-2 text-sm sm:col-span-3">
                  <input
                    type="checkbox"
                    checked={prefs.follow}
                    onChange={(e) => update({ follow: e.target.checked })}
                    className="size-5 accent-gold-400"
                  />
                  {labels.follow}
                </label>
              </div>
            )}

            <div className="flex items-center gap-1 p-2 sm:gap-2 sm:p-3">
              <button type="button" onClick={() => step(-1)} aria-label={labels.previous} className="icon-btn">
                <PrevIcon className="size-5 rtl:-scale-x-100" />
              </button>
              <button
                type="button"
                onClick={togglePlay}
                aria-label={playing ? labels.pause : labels.play}
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-full bg-linear-to-br from-gold-200 via-gold-400 to-gold-500 text-brand-900 shadow-[0_8px_20px_-8px_rgb(200_171_104/0.9)] transition-transform duration-300 hover:scale-105"
              >
                {playing ? <PauseIcon /> : <PlayIcon />}
              </button>
              <button type="button" onClick={() => step(1)} aria-label={labels.next} className="icon-btn">
                <NextIcon className="size-5 rtl:-scale-x-100" />
              </button>

              <p
                role="status"
                aria-live="polite"
                className={`min-w-0 flex-1 truncate px-2 text-sm ${status === "error" ? "text-gold-300" : "text-cream-100/90"}`}
              >
                {statusText}
              </p>

              <button
                type="button"
                onClick={() => setShowOptions((v) => !v)}
                aria-expanded={showOptions}
                aria-controls={optionsId}
                aria-label={labels.options}
                title={labels.options}
                className="icon-btn"
              >
                <SlidersIcon className="size-5" />
              </button>
              <button type="button" onClick={close} aria-label={labels.close} title={labels.close} className="icon-btn">
                <CloseIcon className="size-5" />
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
