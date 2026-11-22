import Image from "next/image";
import Link from "next/link";
import { ArrowIcon, sectionIcons } from "@/components/icons";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { sections } from "@/lib/sections";

/** Staggered entrance for hero elements. */
const delay = (ms: number) => ({ animationDelay: `${ms}ms` });

export default async function HomePage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const features = dict.home.features;

  return (
    <>
      <section className="relative isolate -mt-16 overflow-hidden bg-[radial-gradient(ellipse_at_50%_20%,var(--color-brand-700),var(--color-brand-800)_50%,var(--color-brand-950))] pt-16 text-cream-100">
        {/* Star lattice, faded out towards the edges */}
        <div
          aria-hidden="true"
          className="islamic-pattern absolute inset-0 -z-10 opacity-[0.09] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
        {/* Gold glow behind the logo */}
        <div
          aria-hidden="true"
          className="absolute start-1/2 top-24 -z-10 size-72 -translate-x-1/2 rounded-full bg-gold-400/25 blur-3xl rtl:translate-x-1/2"
        />

        <div className="mx-auto flex max-w-6xl flex-col items-center px-4 pt-12 pb-20 text-center sm:pt-16 sm:pb-28">
          <div className="animate-fade-up">
            <Image
              src="/brand/logo-512.png"
              alt={dict.brand.name}
              width={176}
              height={176}
              priority
              className="size-36 animate-float drop-shadow-[0_20px_40px_rgb(0_0_0/0.45)] sm:size-44"
            />
          </div>
          <h1
            lang="en"
            style={delay(120)}
            className="mt-7 animate-fade-up bg-linear-to-b from-cream-50 via-cream-200 to-gold-400 bg-clip-text font-serif text-4xl font-bold tracking-wide text-transparent sm:text-6xl"
          >
            {dict.brand.name}
          </h1>
          <div style={delay(220)} className="mt-4 flex animate-fade-up items-center gap-3 text-gold-300">
            <span aria-hidden="true" className="h-px w-8 bg-linear-to-r from-transparent to-gold-400 sm:w-14" />
            <p className="font-heading text-lg sm:text-2xl">{dict.brand.tagline}</p>
            <span aria-hidden="true" className="h-px w-8 bg-linear-to-l from-transparent to-gold-400 sm:w-14" />
          </div>
          <p style={delay(320)} className="mt-5 max-w-2xl animate-fade-up text-base text-cream-100/85 sm:text-lg">
            {dict.home.heroText}
          </p>
          <div
            style={delay(420)}
            className="mt-9 flex w-full animate-fade-up flex-col gap-3 sm:w-auto sm:flex-row sm:gap-4"
          >
            <Link href={`/${locale}/quran`} className="btn btn-gold">
              {dict.home.ctaQuran}
              <ArrowIcon className="size-5 rtl:-scale-x-100" />
            </Link>
            <Link href={`/${locale}/prayer-times`} className="btn btn-glass">
              {dict.home.ctaPrayer}
            </Link>
          </div>
        </div>
        {/* Soft curve into the page */}
        <div
          aria-hidden="true"
          className="absolute inset-x-0 bottom-0 h-10 rounded-t-[50%_100%] bg-surface sm:h-14"
        />
      </section>

      <section aria-labelledby="features-title" className="ambient overflow-hidden">
        <div className="mx-auto w-full max-w-6xl px-4 pt-8 pb-16 sm:pb-24">
          <div className="text-center">
            <h2 id="features-title" className="font-heading text-3xl font-bold text-ink sm:text-4xl">
              {dict.home.featuresTitle}
            </h2>
            <div aria-hidden="true" className="mx-auto mt-4 flex items-center justify-center gap-2">
              <span className="h-px w-10 bg-linear-to-r from-transparent to-gold-500" />
              <span className="size-1.5 rotate-45 bg-gold-500" />
              <span className="h-px w-10 bg-linear-to-l from-transparent to-gold-500" />
            </div>
          </div>

          <ul className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sections.map(({ slug, key, ready }) => {
              const Icon = sectionIcons[key];
              return (
                <li key={slug}>
                  <Link href={`/${locale}/${slug}`} className="glass card-premium group flex h-full flex-col p-6">
                    <span className="flex items-start justify-between gap-3">
                      <span className="glass-icon size-14">
                        <Icon className="size-7" />
                      </span>
                      <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-muted">
                        <span
                          aria-hidden="true"
                          className={`size-1.5 rounded-full ${ready ? "bg-brand-500" : "bg-gold-500"}`}
                        />
                        {ready ? dict.home.available : dict.home.comingSoon}
                      </span>
                    </span>
                    <span className="font-heading mt-5 text-2xl font-bold text-ink transition-colors group-hover:text-accent">
                      {features[key].title}
                    </span>
                    <span className="mt-2 flex-1 text-sm leading-relaxed text-muted">{features[key].text}</span>
                    <span aria-hidden="true" className="card-arrow mt-5 inline-flex text-gold-600 dark:text-gold-300">
                      <ArrowIcon className="size-5" />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mt-12 text-center text-sm text-muted">{dict.home.freeNote}</p>
        </div>
      </section>
    </>
  );
}
