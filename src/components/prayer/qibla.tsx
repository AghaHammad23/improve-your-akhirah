"use client";

import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import { fill, formatNumber } from "@/lib/format";
import { KAABA, angleDiff, distanceKm, qiblaBearing, type Place } from "@/lib/prayer";
import { usePrayerPrefs } from "@/lib/prayer-store";
import { LocationPicker, type LocationLabels } from "./location-picker";

export type QiblaLabels = {
  choose: string;
  bearing: string;
  bearingHelp: string;
  distance: string;
  compassLabel: string;
  startCompass: string;
  stopCompass: string;
  compassWaiting: string;
  compassUnsupported: string;
  compassDenied: string;
  facing: string;
  turnLeft: string;
  turnRight: string;
  tips: string;
  noCompass: string;
  kaaba: string;
  north: string;
  mapTitle: string;
  mapHelp: string;
  showMap: string;
  mapPrivacy: string;
  mapLabel: string;
  showRoute: string;
  showHere: string;
  mapError: string;
  mapLoading: string;
};

// Leaflet touches `window` when it loads, and the map is optional, so it loads only when asked for.
const QiblaMap = dynamic(() => import("./qibla-map").then((m) => m.QiblaMap), {
  ssr: false,
  loading: () => <div aria-busy="true" className="qibla-map animate-pulse bg-line/40" />,
});

export function QiblaView({ locale, labels, location }: { locale: string; labels: QiblaLabels; location: LocationLabels }) {
  const prefs = usePrayerPrefs();
  if (!prefs) return <div aria-busy="true" className="glass mx-auto h-40 w-full max-w-2xl animate-pulse rounded-2xl" />;

  return (
    <div className="mx-auto w-full max-w-2xl">
      <LocationPicker place={prefs.place} locale={locale} labels={location} />
      {prefs.place ? (
        <Qibla key={`${prefs.place.lat},${prefs.place.lng}`} place={prefs.place} locale={locale} labels={labels} />
      ) : (
        <p className="mt-4 text-center text-sm text-muted">{labels.choose}</p>
      )}
    </div>
  );
}

function Qibla({ place, locale, labels }: { place: Place; locale: string; labels: QiblaLabels }) {
  const bearing = qiblaBearing(place.lat, place.lng);
  const km = distanceKm(place, KAABA);
  const n = (v: number, digits = 0) => new Intl.NumberFormat(locale, { maximumFractionDigits: digits, minimumFractionDigits: digits }).format(v);
  const [showMap, setShowMap] = useState(false);

  return (
    <>
      <section aria-labelledby="qibla-bearing" className="prayer-next mt-4 rounded-3xl p-5 text-center sm:p-6">
        <p id="qibla-bearing" className="font-heading text-4xl font-bold text-gold-300 tabular-nums sm:text-5xl">
          {fill(labels.bearing, { deg: n(bearing, 1) })}
        </p>
        <p className="mx-auto mt-2 max-w-md text-sm text-cream-100/85">{labels.bearingHelp}</p>
        <p className="mt-2 text-sm font-semibold text-cream-100">{fill(labels.distance, { km: n(Math.round(km)) })}</p>
      </section>

      <Compass bearing={bearing} locale={locale} labels={labels} />

      <section aria-labelledby="qibla-map-title" className="glass mt-4 rounded-3xl p-4 sm:p-6">
        <h2 id="qibla-map-title" className="font-bold text-ink">
          {labels.mapTitle}
        </h2>
        <p className="mt-1 text-sm text-muted">{labels.mapHelp}</p>
        {showMap ? (
          <div className="mt-4">
            <QiblaMap place={place} labels={labels} />
          </div>
        ) : (
          <div className="mt-4">
            <button type="button" onClick={() => setShowMap(true)} className="btn btn-teal w-full sm:w-auto">
              {labels.showMap}
            </button>
            <p className="mt-2 text-xs text-muted">{labels.mapPrivacy}</p>
          </div>
        )}
      </section>
    </>
  );
}

type CompassState = "off" | "waiting" | "on" | "unsupported" | "denied";

type OrientationEvent = DeviceOrientationEvent & { webkitCompassHeading?: number };
type OrientationCtor = typeof DeviceOrientationEvent & { requestPermission?: () => Promise<"granted" | "denied"> };

/** Within this many degrees of the Qibla counts as facing it. */
const ALIGNED = 4;

function Compass({ bearing, locale, labels }: { bearing: number; locale: string; labels: QiblaLabels }) {
  const [state, setState] = useState<CompassState>("off");
  const [heading, setHeading] = useState<number | null>(null);
  const smoothed = useRef<number | null>(null);
  const stopRef = useRef<(() => void) | null>(null);
  const wasAligned = useRef(false);

  const stop = useCallback(() => {
    stopRef.current?.();
    stopRef.current = null;
    smoothed.current = null;
    setHeading(null);
    setState("off");
  }, []);

  useEffect(() => () => stopRef.current?.(), []);

  async function start() {
    const Ctor = (typeof window !== "undefined" ? window.DeviceOrientationEvent : undefined) as OrientationCtor | undefined;
    if (!Ctor) {
      setState("unsupported");
      return;
    }
    // iPhone and iPad ask for permission, and only from a tap.
    if (typeof Ctor.requestPermission === "function") {
      try {
        if ((await Ctor.requestPermission()) !== "granted") {
          setState("denied");
          return;
        }
      } catch {
        setState("denied");
        return;
      }
    }
    setState("waiting");
    // Chrome on Android gives headings relative to north only on the "absolute" event.
    const eventName = "ondeviceorientationabsolute" in window ? "deviceorientationabsolute" : "deviceorientation";
    let frame = 0;
    const onOrientation = (event: Event) => {
      const e = event as OrientationEvent;
      let h: number | null = null;
      if (typeof e.webkitCompassHeading === "number") h = e.webkitCompassHeading;
      else if ((e.absolute || eventName === "deviceorientationabsolute") && e.alpha !== null) h = 360 - e.alpha;
      if (h === null || Number.isNaN(h)) return;
      h = (h + (screen.orientation?.angle ?? 0) + 360) % 360;
      // Smooth out jitter, going the short way round.
      smoothed.current = smoothed.current === null ? h : (smoothed.current + angleDiff(smoothed.current, h) * 0.25 + 360) % 360;
      if (!frame) {
        frame = requestAnimationFrame(() => {
          frame = 0;
          setHeading(smoothed.current);
          setState("on");
        });
      }
    };
    window.addEventListener(eventName, onOrientation);
    // No reading at all after a few seconds: there's no usable compass.
    const timeout = setTimeout(() => {
      if (smoothed.current === null) {
        window.removeEventListener(eventName, onOrientation);
        stopRef.current = null;
        setState("unsupported");
      }
    }, 3000);
    stopRef.current = () => {
      clearTimeout(timeout);
      cancelAnimationFrame(frame);
      window.removeEventListener(eventName, onOrientation);
    };
  }

  const live = state === "on" && heading !== null;
  // Without a compass the dial is drawn with north at the top.
  const dialRotation = live ? -heading : 0;
  const diff = live ? angleDiff(heading, bearing) : null;
  const aligned = diff !== null && Math.abs(diff) <= ALIGNED;

  useEffect(() => {
    if (aligned && !wasAligned.current && "vibrate" in navigator) navigator.vibrate?.(60);
    wasAligned.current = aligned;
  }, [aligned]);

  const deg = (v: number) => formatNumber(locale, Math.round(Math.abs(v)));
  const message =
    state === "waiting"
      ? labels.compassWaiting
      : state === "unsupported"
        ? labels.compassUnsupported
        : state === "denied"
          ? labels.compassDenied
          : diff === null
            ? labels.noCompass
            : aligned
              ? labels.facing
              : diff > 0
                ? fill(labels.turnRight, { deg: deg(diff) })
                : fill(labels.turnLeft, { deg: deg(diff) });

  // Kaaba mark on the dial, at the Qibla bearing.
  const rad = (bearing * Math.PI) / 180;
  const kx = 100 + 70 * Math.sin(rad);
  const ky = 100 - 70 * Math.cos(rad);

  return (
    <section aria-label={labels.compassLabel} className="glass mt-4 rounded-3xl p-4 text-center sm:p-6">
      <div className={`qibla-dial mx-auto ${aligned ? "is-aligned" : ""}`} dir="ltr">
        <svg viewBox="0 0 200 200" role="img" aria-label={labels.compassLabel} className="size-full">
          <circle cx="100" cy="100" r="94" className="qibla-ring" />
          <g style={{ transform: `rotate(${dialRotation}deg)`, transformOrigin: "100px 100px" }} className="qibla-rotor">
            {Array.from({ length: 72 }, (_, i) => {
              const major = i % 6 === 0;
              return (
                <line
                  key={i}
                  x1="100"
                  y1={major ? 12 : 14}
                  x2="100"
                  y2={major ? 24 : 19}
                  className={major ? "qibla-tick-major" : "qibla-tick"}
                  transform={`rotate(${i * 5} 100 100)`}
                />
              );
            })}
            <text x="100" y="40" textAnchor="middle" className="qibla-north">
              {labels.north}
            </text>
            <line x1="100" y1="100" x2={kx} y2={ky} className="qibla-needle" />
            <g transform={`translate(${kx} ${ky}) rotate(${-dialRotation})`}>
              <rect x="-9" y="-9" width="18" height="18" rx="2" className="qibla-kaaba" />
              <path d="M-9 -3.5h18" className="qibla-kaaba-band" />
            </g>
            <circle cx="100" cy="100" r="5" className="qibla-hub" />
          </g>
          {/* The top of the phone */}
          <path d="M100 2 l7 11 h-14 Z" className="qibla-pointer" />
        </svg>
      </div>

      <p aria-hidden="true" className={`mt-4 min-h-6 font-bold ${aligned ? "text-accent" : "text-ink"}`}>
        {message}
      </p>
      {/* Announce changes of state and reaching the Qibla, not every degree while turning. */}
      <p role="status" aria-live="polite" className="sr-only">
        {state === "on" ? (aligned ? labels.facing : "") : message}
      </p>
      {state === "on" && !aligned && <p className="sr-only">{message}</p>}

      <div className="mt-3">
        {state === "on" || state === "waiting" ? (
          <button type="button" onClick={stop} className="chip">
            {labels.stopCompass}
          </button>
        ) : (
          state !== "unsupported" && (
            <button type="button" onClick={start} className="btn btn-teal">
              {labels.startCompass}
            </button>
          )
        )}
      </div>
      <p className="mx-auto mt-4 max-w-md text-xs leading-relaxed text-muted">{labels.tips}</p>
    </section>
  );
}
