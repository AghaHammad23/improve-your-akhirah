"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LOCALE_COOKIE, localeNames, locales, type Locale } from "@/i18n/config";

const localePrefix = new RegExp(`^/(${locales.join("|")})(?=/|$)`);

/** Links to the same page in each language. Remembers the choice in a cookie for the proxy. */
export function LanguageSwitcher({
  current,
  label,
  className = "",
  onNavigate,
}: {
  current: Locale;
  label: string;
  className?: string;
  onNavigate?: () => void;
}) {
  const rest = (usePathname() ?? "").replace(localePrefix, "");

  return (
    <nav aria-label={label} className={className}>
      <ul className="flex items-center gap-0.5 rounded-full border border-cream-200/15 bg-white/5 p-0.5">
        {locales.map((locale) => {
          const active = locale === current;
          return (
            <li key={locale}>
              <Link
                href={`/${locale}${rest}`}
                hrefLang={locale}
                lang={locale}
                aria-current={active ? "true" : undefined}
                onClick={() => {
                  document.cookie = `${LOCALE_COOKIE}=${locale}; path=/; max-age=31536000; SameSite=Lax`;
                  onNavigate?.();
                }}
                className={`inline-flex min-h-10 min-w-11 items-center justify-center rounded-full px-3 text-sm transition-all duration-300 ${
                  active
                    ? "bg-linear-to-br from-gold-200 via-gold-400 to-gold-500 font-bold text-brand-900 shadow-[0_6px_16px_-8px_rgb(200_171_104/0.9)]"
                    : "text-cream-100/80 hover:bg-white/10 hover:text-cream-50"
                }`}
              >
                {localeNames[locale]}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
