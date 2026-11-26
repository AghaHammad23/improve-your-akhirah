import type { ReactNode } from "react";

/** Dark teal heading band with the star lattice, used at the top of section pages. */
export function PageHero({
  eyebrow,
  title,
  subtitle,
  children,
}: {
  /** Small Arabic line above the title (rendered in the Quran font). */
  eyebrow?: string;
  title: ReactNode;
  subtitle?: ReactNode;
  children?: ReactNode;
}) {
  return (
    <section className="relative isolate -mt-16 overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,var(--color-brand-700),var(--color-brand-800)_55%,var(--color-brand-950))] pt-16 text-cream-100">
      <div
        aria-hidden="true"
        className="islamic-pattern absolute inset-0 -z-10 opacity-[0.08] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 text-center sm:pt-14 sm:pb-20">
        {eyebrow && (
          <p lang="ar" dir="rtl" className="font-quran text-3xl text-gold-300 sm:text-4xl">
            {eyebrow}
          </p>
        )}
        <h1 className="font-heading mt-2 text-3xl font-bold text-cream-100 sm:text-5xl">{title}</h1>
        {subtitle && <p className="mx-auto mt-4 max-w-2xl text-cream-100/85">{subtitle}</p>}
        {children}
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-8 rounded-t-[50%_100%] bg-surface sm:h-12" />
    </section>
  );
}
