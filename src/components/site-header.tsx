import Image from "next/image";
import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { sections } from "@/lib/sections";
import { LanguageSwitcher } from "./language-switcher";
import { MobileMenu } from "./mobile-menu";
import { ThemeToggle } from "./theme-toggle";

export async function SiteHeader() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const items = sections.map((s) => ({ href: `/${locale}/${s.slug}`, label: dict.nav[s.key] }));

  return (
    <header className="sticky top-0 z-50 bg-brand-900/90 text-cream-100 backdrop-blur-xl backdrop-saturate-150">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:gap-4">
        <Link
          href={`/${locale}`}
          className="group flex min-h-11 shrink-0 items-center gap-3 rounded-full pe-2"
          aria-label={dict.brand.name}
        >
          <Image
            src="/brand/logo-192.png"
            alt=""
            width={44}
            height={44}
            priority
            className="size-11 rounded-full shadow-[0_0_0_1px_rgb(217_196_143/0.5),0_6px_16px_-6px_rgb(0_0_0/0.6)] transition-transform duration-500 ease-out-expo group-hover:rotate-[-8deg] group-hover:scale-105"
          />
          <span
            lang="en"
            className="hidden font-serif text-[1.35rem] leading-none font-bold tracking-wide text-cream-200 sm:inline"
          >
            {dict.brand.name}
          </span>
        </Link>

        <nav aria-label={dict.nav.label} className="ms-auto hidden lg:block">
          <ul className="flex items-center">
            {items.map((item) => (
              <li key={item.href}>
                <Link href={item.href} className="nav-link">
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>

        <div className="ms-auto flex items-center gap-1 lg:ms-2">
          <LanguageSwitcher current={locale} label={dict.a11y.language} className="hidden sm:block" />
          <ThemeToggle toDark={dict.a11y.themeToDark} toLight={dict.a11y.themeToLight} />
          <MobileMenu
            items={items}
            locale={locale}
            labels={{
              open: dict.nav.menu,
              close: dict.nav.closeMenu,
              nav: dict.nav.label,
              language: dict.a11y.language,
            }}
          />
        </div>
      </div>
      {/* Gold hairline echoing the logo's ring, fading out at both ends */}
      <div aria-hidden="true" className="h-px bg-linear-to-r from-transparent via-gold-400/80 to-transparent" />
    </header>
  );
}
