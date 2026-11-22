"use client";

import Link from "next/link";
import { useId, useState } from "react";
import type { Locale } from "@/i18n/config";
import { CloseIcon, MenuIcon } from "./icons";
import { LanguageSwitcher } from "./language-switcher";

type NavItem = { href: string; label: string };

/** Navigation for small screens: a toggle button and a panel below the header bar. */
export function MobileMenu({
  items,
  locale,
  labels,
}: {
  items: NavItem[];
  locale: Locale;
  labels: { open: string; close: string; nav: string; language: string };
}) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const close = () => setOpen(false);

  return (
    <div className="lg:hidden">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        aria-label={open ? labels.close : labels.open}
        onClick={() => setOpen((v) => !v)}
        className="icon-btn"
      >
        {open ? <CloseIcon /> : <MenuIcon />}
      </button>

      <div
        id={panelId}
        hidden={!open}
        className="absolute inset-x-0 top-full z-40 border-b border-gold-400/30 bg-brand-900/95 px-4 pt-2 pb-5 shadow-2xl backdrop-blur-xl"
        onKeyDown={(e) => {
          if (e.key === "Escape") close();
        }}
      >
        <nav aria-label={labels.nav}>
          <ul className="flex flex-col">
            {items.map((item) => (
              <li key={item.href}>
                <Link
                  href={item.href}
                  onClick={close}
                  className="flex min-h-12 items-center rounded-xl border-s-2 border-transparent px-3 text-base font-semibold text-cream-100 transition-all duration-300 hover:border-gold-400 hover:bg-white/8 hover:ps-4"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <LanguageSwitcher
          current={locale}
          label={labels.language}
          onNavigate={close}
          className="mt-3 border-t border-white/10 pt-3"
        />
      </div>
    </div>
  );
}
