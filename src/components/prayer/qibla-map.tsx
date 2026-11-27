"use client";

import "leaflet/dist/leaflet.css";
import L from "leaflet";
import { useEffect, useRef, useState } from "react";
import { KAABA, greatCircle, type Place } from "@/lib/prayer";
import type { QiblaLabels } from "./qibla";

/** Theme colour from the design tokens (globals.css), so the map follows them instead of hard-coding. */
function token(name: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
}

/**
 * OpenStreetMap with a great-circle line from the place to the Kaaba. It opens zoomed in on the place, so the
 * line can be lined up with nearby streets; "Whole line" shows the full route.
 * Tiles: © OpenStreetMap contributors (ODbL), served under the OSM tile usage policy (see docs/SOURCES.md).
 */
export function QiblaMap({ place, labels }: { place: Place; labels: Pick<QiblaLabels, "mapLabel" | "showRoute" | "showHere" | "mapError" | "kaaba"> }) {
  const el = useRef<HTMLDivElement>(null);
  const map = useRef<L.Map | null>(null);
  const line = useRef<L.Polyline | null>(null);
  const [failed, setFailed] = useState(false);
  const here: L.LatLngTuple = [place.lat, place.lng];

  useEffect(() => {
    if (!el.current) return;
    const m = L.map(el.current, { zoomControl: true, attributionControl: true }).setView([place.lat, place.lng], 16);
    m.attributionControl.setPrefix('<a href="https://leafletjs.com">Leaflet</a>');
    let loadedAny = false;
    L.tileLayer("https://tile.openstreetmap.org/{z}/{x}/{y}.png", {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    })
      .on("tileload", () => (loadedAny = true))
      .on("tileerror", () => !loadedAny && setFailed(true))
      .addTo(m);

    const gold = token("--color-gold-500");
    const teal = token("--color-brand-700");
    line.current = L.polyline(greatCircle(place, KAABA), { color: gold, weight: 5, opacity: 0.95 }).addTo(m);
    L.circleMarker([place.lat, place.lng], { radius: 8, color: token("--color-cream-50"), weight: 3, fillColor: teal, fillOpacity: 1 }).addTo(m);
    L.circleMarker([KAABA.lat, KAABA.lng], { radius: 9, color: gold, weight: 3, fillColor: token("--color-brand-950"), fillOpacity: 1 })
      .bindTooltip(labels.kaaba, { permanent: true, direction: "top", offset: [0, -8] })
      .addTo(m);
    map.current = m;
    return () => {
      m.remove();
      map.current = null;
    };
  }, [place, labels.kaaba]);

  return (
    <div>
      <div ref={el} dir="ltr" role="region" aria-label={labels.mapLabel} className="qibla-map" />
      {failed && <p className="mt-2 text-sm text-ink">{labels.mapError}</p>}
      <div className="mt-3 flex flex-wrap justify-center gap-2">
        <button type="button" className="chip" onClick={() => map.current?.setView(here, 16)}>
          {labels.showHere}
        </button>
        <button
          type="button"
          className="chip"
          onClick={() => line.current && map.current?.fitBounds(line.current.getBounds(), { padding: [32, 32] })}
        >
          {labels.showRoute}
        </button>
      </div>
    </div>
  );
}
