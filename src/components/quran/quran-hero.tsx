import Link from "next/link";

/** Dark teal heading band shared by the Quran list pages, with the Surahs / Juz switch. */
export function QuranHero({
  title,
  subtitle,
  locale,
  active,
  labels,
}: {
  title: string;
  subtitle: string;
  locale: string;
  active: "surahs" | "juz";
  labels: { surahs: string; juz: string; browseBy: string };
}) {
  const tabs = [
    { id: "surahs", href: `/${locale}/quran`, label: labels.surahs },
    { id: "juz", href: `/${locale}/quran/juz`, label: labels.juz },
  ] as const;

  return (
    <section className="relative isolate -mt-16 overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,var(--color-brand-700),var(--color-brand-800)_55%,var(--color-brand-950))] pt-16 text-cream-100">
      <div
        aria-hidden="true"
        className="islamic-pattern absolute inset-0 -z-10 opacity-[0.08] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
      />
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 text-center sm:pt-14 sm:pb-20">
        <p lang="ar" dir="rtl" className="font-quran text-3xl text-gold-300 sm:text-4xl">
          القرآن الكريم
        </p>
        <h1 className="font-heading mt-2 text-3xl font-bold text-cream-100 sm:text-5xl">{title}</h1>
        <p className="mx-auto mt-4 max-w-2xl text-cream-100/85">{subtitle}</p>

        <nav aria-label={labels.browseBy} className="mt-8 flex justify-center">
          <ul className="inline-flex gap-1 rounded-full border border-cream-200/20 bg-white/5 p-1 backdrop-blur">
            {tabs.map((tab) => {
              const current = tab.id === active;
              return (
                <li key={tab.id}>
                  <Link
                    href={tab.href}
                    aria-current={current ? "page" : undefined}
                    className={`inline-flex min-h-11 items-center rounded-full px-5 text-sm font-semibold transition-all duration-300 ${
                      current
                        ? "bg-linear-to-br from-gold-200 via-gold-400 to-gold-500 text-brand-900 shadow-[0_6px_16px_-8px_rgb(200_171_104/0.9)]"
                        : "text-cream-100/85 hover:bg-white/10 hover:text-cream-50"
                    }`}
                  >
                    {tab.label}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>
      </div>
      <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-8 rounded-t-[50%_100%] bg-surface sm:h-12" />
    </section>
  );
}
