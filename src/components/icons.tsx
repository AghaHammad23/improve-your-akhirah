import type { SVGProps } from "react";

type IconProps = SVGProps<SVGSVGElement>;

function Base({ children, ...props }: IconProps) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="24"
      height="24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      {children}
    </svg>
  );
}

export const BookIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 6.5C10 5 7.5 4.5 4 4.5v13c3.5 0 6 .5 8 2 2-1.5 4.5-2 8-2v-13c-3.5 0-6 .5-8 2Z" />
    <path d="M12 6.5v13" />
  </Base>
);

export const ScrollIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M7 4h10a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H7" />
    <path d="M7 4a2 2 0 0 0-2 2v1h4V6a2 2 0 0 0-2-2Z" />
    <path d="M7 20a2 2 0 0 1-2-2v-1h4v1a2 2 0 0 1-2 2Z" />
    <path d="M9 9h7M9 12.5h7M9 16h4" />
  </Base>
);

export const SearchIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="11" cy="11" r="6.5" />
    <path d="m20 20-4.2-4.2" />
  </Base>
);

export const CompassIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="8.5" />
    <path d="m15.5 8.5-2 5-5 2 2-5 5-2Z" />
  </Base>
);

export const HandsIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 20c-3 0-6-2-6-6V8.5a1.5 1.5 0 0 1 3 0V12" />
    <path d="M12 20c3 0 6-2 6-6V8.5a1.5 1.5 0 0 0-3 0V12" />
    <path d="M9 12V6a1.5 1.5 0 0 1 3 0v14M15 12V6a1.5 1.5 0 0 0-3 0" />
  </Base>
);

export const GridIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="4" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="4" width="6.5" height="6.5" rx="1.5" />
    <rect x="4" y="13.5" width="6.5" height="6.5" rx="1.5" />
    <rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1.5" />
  </Base>
);

export const SunIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2.5v2M12 19.5v2M4.6 4.6l1.4 1.4M18 18l1.4 1.4M2.5 12h2M19.5 12h2M4.6 19.4 6 18M18 6l1.4-1.4" />
  </Base>
);

export const MoonIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M20 14.5A8 8 0 0 1 9.5 4a8 8 0 1 0 10.5 10.5Z" />
  </Base>
);

export const MenuIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h16M4 12h16M4 17h16" />
  </Base>
);

export const CloseIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6l12 12M18 6 6 18" />
  </Base>
);

export const PlayIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M8 5.5v13l11-6.5-11-6.5Z" fill="currentColor" stroke="none" />
  </Base>
);

export const PauseIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="6.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
    <rect x="13.5" y="5" width="4" height="14" rx="1" fill="currentColor" stroke="none" />
  </Base>
);

/** Previous/next track; mirror with rtl:-scale-x-100 where direction matters. */
export const PrevIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M18 6v12L9 12l9-6Z" fill="currentColor" stroke="none" />
    <path d="M6 6v12" />
  </Base>
);

export const NextIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M6 6v12l9-6-9-6Z" fill="currentColor" stroke="none" />
    <path d="M18 6v12" />
  </Base>
);

export const SlidersIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M4 7h10M18 7h2M4 17h4M12 17h8" />
    <circle cx="16" cy="7" r="2" />
    <circle cx="10" cy="17" r="2" />
  </Base>
);

export const CopyIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="8.5" y="8.5" width="11" height="11" rx="2.5" />
    <path d="M15.5 8.5V6.5a2 2 0 0 0-2-2h-7a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h2" />
  </Base>
);

export const ShareIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="17.5" cy="5.5" r="2.5" />
    <circle cx="6.5" cy="12" r="2.5" />
    <circle cx="17.5" cy="18.5" r="2.5" />
    <path d="m8.7 10.8 6.6-4M8.7 13.2l6.6 4" />
  </Base>
);

/** Prayer beads (Tasbeeh). */
export const BeadsIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="4.5" r="1.6" />
    <circle cx="17.3" cy="6.7" r="1.6" />
    <circle cx="19.5" cy="12" r="1.6" />
    <circle cx="17.3" cy="17.3" r="1.6" />
    <circle cx="6.7" cy="17.3" r="1.6" />
    <circle cx="4.5" cy="12" r="1.6" />
    <circle cx="6.7" cy="6.7" r="1.6" />
    <path d="M12 17v4M10.5 21h3" />
  </Base>
);

/** Eight-point star (99 Names). */
export const StarIcon = (p: IconProps) => (
  <Base {...p}>
    <rect x="6" y="6" width="12" height="12" rx="1.5" />
    <rect x="6" y="6" width="12" height="12" rx="1.5" transform="rotate(45 12 12)" />
  </Base>
);

/** Stacked coins (Zakat). */
export const CoinsIcon = (p: IconProps) => (
  <Base {...p}>
    <ellipse cx="9" cy="7" rx="5" ry="2.5" />
    <path d="M4 7v4c0 1.4 2.2 2.5 5 2.5s5-1.1 5-2.5V7" />
    <path d="M10 15.4c.6 1.2 2.6 2.1 5 2.1 2.8 0 5-1.1 5-2.5v-4c0-1.4-2.2-2.5-5-2.5" />
    <path d="M4 11v4c0 1.4 2.2 2.5 5 2.5" />
  </Base>
);

/** Book with a check mark (Khatam tracker). */
export const BookCheckIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 4.5h11a3 3 0 0 1 3 3V20H8a3 3 0 0 1-3-3V4.5Z" />
    <path d="M5 17a3 3 0 0 1 3-3h11" />
    <path d="m9 8.5 2 2 3.5-3.5" />
  </Base>
);

/** Map pin (a chosen place). */
export const PinIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M12 21s-6.5-5.6-6.5-11a6.5 6.5 0 0 1 13 0c0 5.4-6.5 11-6.5 11Z" />
    <circle cx="12" cy="10" r="2.4" />
  </Base>
);

/** Crosshair (use my current location). */
export const LocateIcon = (p: IconProps) => (
  <Base {...p}>
    <circle cx="12" cy="12" r="6.5" />
    <circle cx="12" cy="12" r="2" />
    <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3" />
  </Base>
);

/** Points to the reading end; CSS mirrors it in RTL. */
export const ArrowIcon = (p: IconProps) => (
  <Base {...p}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </Base>
);

export const sectionIcons = {
  quran: BookIcon,
  hadith: ScrollIcon,
  search: SearchIcon,
  prayerTimes: CompassIcon,
  duas: HandsIcon,
  tools: GridIcon,
} as const;
