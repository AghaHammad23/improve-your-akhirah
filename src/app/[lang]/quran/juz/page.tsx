import type { Metadata } from "next";
import Link from "next/link";
import { QuranHero } from "@/components/quran/quran-hero";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { fill, formatNumber } from "@/lib/format";
import { getJuzList, getSurahMeta, surahsInJuz } from "@/lib/quran";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.quran.juzTitle, description: dict.quran.juzSubtitle };
}

export default async function JuzIndexPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const q = dict.quran;
  const nameOf = (n: number) => {
    const meta = getSurahMeta(n)!;
    return locale === "en" ? meta.transliteration : meta.nameArabic;
  };

  return (
    <div className="ambient flex-1 overflow-hidden">
      <QuranHero
        title={q.juzTitle}
        subtitle={q.juzSubtitle}
        locale={locale}
        active="juz"
        labels={{ surahs: q.tabSurahs, juz: q.tabJuz, browseBy: q.browseBy }}
      />

      <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-16">
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {getJuzList().map((j) => {
            const ref = `${formatNumber(locale, j.surah)}:${formatNumber(locale, j.ayah)}`;
            const label = fill(q.juzNumber, { n: formatNumber(locale, j.number) });
            return (
              <li key={j.number}>
                <Link
                  href={`/${locale}/quran/${j.surah}#v-${j.ayah}`}
                  className="glass card-premium group flex min-h-24 items-center gap-4 rounded-2xl p-4"
                >
                  <span className="star-badge shrink-0" aria-hidden="true">
                    <span>{formatNumber(locale, j.number)}</span>
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="flex items-baseline justify-between gap-2">
                      <span className="font-heading text-lg font-bold text-ink group-hover:text-accent">{label}</span>
                      <span lang="ar" dir="rtl" className="font-quran shrink-0 text-2xl text-accent">
                        {j.nameArabic}
                      </span>
                    </span>
                    <span className="mt-1 block truncate text-sm text-muted">
                      {fill(q.juzStartsAt, { surah: nameOf(j.surah), ref })}
                    </span>
                    <span className="block truncate text-xs text-muted/80">
                      {surahsInJuz(j.number).map(nameOf).join(" · ")}
                    </span>
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
