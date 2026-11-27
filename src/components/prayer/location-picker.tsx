"use client";

import { useEffect, useId, useRef, useState } from "react";
import { LocateIcon, PinIcon, SearchIcon } from "@/components/icons";
import { loadCities, nearestCity, searchCities } from "@/lib/cities";
import { fill } from "@/lib/format";
import { countryName, type Place } from "@/lib/prayer";
import { savePrayerPrefs } from "@/lib/prayer-store";

export type LocationLabels = {
  heading: string;
  choose: string;
  useMyLocation: string;
  locating: string;
  searchLabel: string;
  searchPlaceholder: string;
  loadingCities: string;
  noCities: string;
  citiesError: string;
  retry: string;
  change: string;
  cancel: string;
  near: string;
  myLocation: string;
  gpsDenied: string;
  gpsUnavailable: string;
  gpsUnsupported: string;
  privacy: string;
};

/** Main line and detail line for a place, e.g. "Lahore" / "Punjab, Pakistan". */
export function placeLines(locale: string, place: Place, labels: Pick<LocationLabels, "near" | "myLocation">) {
  const country = place.cc ? countryName(locale, place.cc) : "";
  if (place.source === "gps") {
    return { main: labels.myLocation, detail: place.name ? fill(labels.near, { city: [place.name, country].filter(Boolean).join(", ") }) : "" };
  }
  return { main: place.name, detail: [place.admin, country].filter(Boolean).join(", ") };
}

/**
 * Shows the saved place with a "Change" button, or (when there is none, or while changing) a "Use my location"
 * button and a city search. The choice is saved in this browser and shared by Prayer times and Qibla.
 */
export function LocationPicker({ place, locale, labels }: { place: Place | null; locale: string; labels: LocationLabels }) {
  const [editing, setEditing] = useState(false);

  if (place && !editing) {
    const { main, detail } = placeLines(locale, place, labels);
    return (
      <section aria-label={labels.heading} className="glass flex items-center gap-3 rounded-2xl p-3 ps-4">
        <PinIcon className="size-5 shrink-0 text-accent" />
        <p className="min-w-0 flex-1">
          <span className="block truncate font-bold text-ink">{main}</span>
          {detail && <span className="block truncate text-sm text-muted">{detail}</span>}
        </p>
        <button type="button" onClick={() => setEditing(true)} className="chip shrink-0">
          {labels.change}
        </button>
      </section>
    );
  }

  return (
    <LocationForm
      locale={locale}
      labels={labels}
      onDone={() => setEditing(false)}
      onCancel={place ? () => setEditing(false) : undefined}
    />
  );
}

type GpsState = "idle" | "locating" | "denied" | "unavailable" | "unsupported";

function LocationForm({
  locale,
  labels,
  onDone,
  onCancel,
}: {
  locale: string;
  labels: LocationLabels;
  onDone: () => void;
  onCancel?: () => void;
}) {
  const [gps, setGps] = useState<GpsState>("idle");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<Place[]>([]);
  const [status, setStatus] = useState<"idle" | "loading" | "error">("idle");
  const [active, setActive] = useState(-1);
  const [attempt, setAttempt] = useState(0);
  const inputId = useId();
  const listId = useId();
  const inputRef = useRef<HTMLInputElement>(null);

  // Search as the visitor types; the city list loads on the first keystroke.
  useEffect(() => {
    const q = query.trim();
    if (!q) return;
    let stale = false;
    const t = setTimeout(() => {
      loadCities()
        .then((cities) => {
          if (stale) return;
          setResults(searchCities(cities, q));
          setActive(-1);
          setStatus("idle");
        })
        .catch(() => !stale && setStatus("error"));
    }, 120);
    return () => {
      stale = true;
      clearTimeout(t);
    };
  }, [query, attempt]);

  function pick(place: Place) {
    savePrayerPrefs({ place });
    onDone();
  }

  function useMyLocation() {
    if (!("geolocation" in navigator)) {
      setGps("unsupported");
      return;
    }
    setGps("locating");
    navigator.geolocation.getCurrentPosition(
      async ({ coords }) => {
        const lat = Math.round(coords.latitude * 1e4) / 1e4;
        const lng = Math.round(coords.longitude * 1e4) / 1e4;
        const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
        // The nearest listed city names the place and gives its country (for the default method).
        const near = await loadCities()
          .then((cities) => nearestCity(cities, lat, lng))
          .catch(() => null);
        pick({ name: near?.name ?? "", cc: near?.cc ?? "", admin: near?.admin, lat, lng, tz, source: "gps" });
      },
      (err) => setGps(err.code === err.PERMISSION_DENIED ? "denied" : "unavailable"),
      { enableHighAccuracy: false, timeout: 15000, maximumAge: 10 * 60 * 1000 },
    );
  }

  const q = query.trim();
  const open = q.length > 0 && status !== "error";
  const gpsMessage =
    gps === "denied" ? labels.gpsDenied : gps === "unavailable" ? labels.gpsUnavailable : gps === "unsupported" ? labels.gpsUnsupported : "";

  return (
    <section aria-labelledby={`${inputId}-h`} className="glass rounded-2xl p-4 sm:p-5">
      <h2 id={`${inputId}-h`} className="font-bold text-ink">
        {labels.heading}
      </h2>
      <p className="mt-1 text-sm text-muted">{labels.choose}</p>

      <button
        type="button"
        onClick={useMyLocation}
        disabled={gps === "locating"}
        className="btn btn-teal mt-4 w-full sm:w-auto"
      >
        <LocateIcon className="size-5" />
        {gps === "locating" ? labels.locating : labels.useMyLocation}
      </button>
      <p role="status" className="mt-2 min-h-5 text-sm text-muted">
        {gpsMessage}
      </p>

      <label htmlFor={inputId} className="mt-2 block text-sm font-bold text-ink">
        {labels.searchLabel}
      </label>
      <div className="relative mt-2">
        <SearchIcon className="pointer-events-none absolute inset-s-4 top-1/2 size-5 -translate-y-1/2 text-muted" />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          role="combobox"
          aria-expanded={open && results.length > 0}
          aria-controls={listId}
          aria-autocomplete="list"
          aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (e.target.value.trim()) setStatus((s) => (s === "error" ? s : "loading"));
          }}
          onKeyDown={(e) => {
            if (e.key === "ArrowDown" && results.length) {
              e.preventDefault();
              setActive((i) => (i + 1) % results.length);
            } else if (e.key === "ArrowUp" && results.length) {
              e.preventDefault();
              setActive((i) => (i <= 0 ? results.length - 1 : i - 1));
            } else if (e.key === "Enter" && results.length) {
              e.preventDefault();
              pick(results[Math.max(active, 0)]);
            } else if (e.key === "Escape") {
              setQuery("");
            }
          }}
          placeholder={labels.searchPlaceholder}
          autoComplete="off"
          enterKeyHint="search"
          className="glass min-h-12 w-full rounded-full ps-12 pe-5 text-base text-ink placeholder:text-muted/80 focus:border-gold-500 focus:outline-none"
        />
      </div>

      {open && results.length > 0 && (
        <ul id={listId} role="listbox" aria-label={labels.searchLabel} className="mt-2 overflow-hidden rounded-2xl border border-line">
          {results.map((place, i) => {
            const { main, detail } = placeLines(locale, place, labels);
            return (
              <li
                key={`${place.name}-${place.lat}-${place.lng}`}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onClick={() => pick(place)}
                onMouseEnter={() => setActive(i)}
                className={`flex min-h-12 cursor-pointer flex-col justify-center border-b border-line px-4 py-2 last:border-b-0 ${
                  i === active ? "bg-brand-500/10" : ""
                }`}
              >
                <span lang="en" dir="ltr" className="self-start font-semibold text-ink">
                  {main}
                </span>
                {detail && <span className="text-sm text-muted">{detail}</span>}
              </li>
            );
          })}
        </ul>
      )}
      <p role="status" aria-live="polite" className="mt-2 text-sm text-muted">
        {q && status === "loading" && results.length === 0 ? labels.loadingCities : ""}
        {q && status === "idle" && results.length === 0 ? labels.noCities : ""}
      </p>
      {status === "error" && (
        <p className="mt-1 text-sm text-ink">
          {labels.citiesError}{" "}
          <button
            type="button"
            className="font-semibold text-accent underline underline-offset-2"
            onClick={() => {
              setStatus("loading");
              setAttempt((n) => n + 1);
              inputRef.current?.focus();
            }}
          >
            {labels.retry}
          </button>
        </p>
      )}

      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs text-muted">{labels.privacy}</p>
        {onCancel && (
          <button type="button" onClick={onCancel} className="chip">
            {labels.cancel}
          </button>
        )}
      </div>
    </section>
  );
}
