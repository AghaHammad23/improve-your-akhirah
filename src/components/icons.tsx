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
