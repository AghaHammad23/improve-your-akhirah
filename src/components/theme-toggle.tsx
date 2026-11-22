"use client";

import { useRef, useSyncExternalStore } from "react";
import { MoonIcon, SunIcon } from "./icons";

type Theme = "light" | "dark";

function subscribe(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["data-theme"] });
  return () => observer.disconnect();
}

const getTheme = (): Theme => (document.documentElement.dataset.theme === "dark" ? "dark" : "light");
const getServerTheme = (): Theme | null => null;

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  try {
    localStorage.setItem("theme", theme);
  } catch {
    // Storage can be unavailable (private mode); the theme still applies for this page view.
  }
}

/**
 * Light/dark switch. The new theme is revealed as a circle growing from the button
 * (View Transitions API). Falls back to an instant switch when the API is missing
 * or the user prefers reduced motion. The inline script in the root layout applies
 * the saved theme before first paint.
 */
export function ThemeToggle({ toDark, toLight }: { toDark: string; toLight: string }) {
  const theme = useSyncExternalStore(subscribe, getTheme, getServerTheme);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const label = theme === "dark" ? toLight : toDark;

  function toggle() {
    const next: Theme = getTheme() === "dark" ? "light" : "dark";
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (!document.startViewTransition || reduceMotion || !buttonRef.current) {
      applyTheme(next);
      return;
    }

    const { left, top, width, height } = buttonRef.current.getBoundingClientRect();
    const x = left + width / 2;
    const y = top + height / 2;
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));

    const transition = document.startViewTransition(() => applyTheme(next));
    transition.ready
      .then(() => {
        document.documentElement.animate(
          { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
          { duration: 700, easing: "cubic-bezier(0.65, 0, 0.35, 1)", pseudoElement: "::view-transition-new(root)" },
        );
      })
      .catch(() => {
        // Transition skipped (e.g. tab hidden); the theme is already applied.
      });
  }

  return (
    <button ref={buttonRef} type="button" onClick={toggle} aria-label={label} title={label} className="icon-btn">
      {/* key forces a remount so the icon "pops" in each time the theme changes */}
      <span key={theme ?? "unknown"} className="inline-flex animate-icon-pop">
        {theme === "dark" ? <SunIcon /> : <MoonIcon />}
      </span>
    </button>
  );
}
