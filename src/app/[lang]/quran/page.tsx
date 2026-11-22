import type { Metadata } from "next";
import { SurahIndex, type SurahCard } from "@/components/quran/surah-index";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { fill, formatNumber } from "@/lib/format";
import { getSurahList } from "@/lib/quran";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.quran.title, description: dict.quran.subtitle };
}

export default async function QuranIndexPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const q = dict.quran;

  const surahs: SurahCard[] = getSurahList().map((s) => ({
    number: s.number,
    nameArabic: s.nameArabic,
    transliteration: s.transliteration,
    meaning: locale === "en" ? s.meaningEn : undefined,
    details: `${fill(q.versesCount, { n: formatNumber(locale, s.ayahs) })} · ${s.type === "makki" ? q.makki : q.madani}`,
    numberLabel: fill(q.surahNumber, { n: formatNumber(locale, s.number) }),
    numberText: formatNumber(locale, s.number),
  }));

  return (
    <div className="ambient flex-1 overflow-hidden">
      <section className="relative isolate -mt-16 overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,var(--color-brand-700),var(--color-brand-800)_55%,var(--color-brand-950))] pt-16 text-cream-100">
        <div
          aria-hidden="true"
          className="islamic-pattern absolute inset-0 -z-10 opacity-[0.08] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
        <div className="mx-auto max-w-6xl px-4 pt-10 pb-16 text-center sm:pt-14 sm:pb-20">
          <p lang="ar" dir="rtl" className="font-quran text-3xl text-gold-300 sm:text-4xl">
            القرآن الكريم
          </p>
          <h1 className="font-heading mt-2 text-3xl font-bold text-cream-100 sm:text-5xl">{q.title}</h1>
          <p className="mx-auto mt-4 max-w-2xl text-cream-100/85">{q.subtitle}</p>
        </div>
        <div aria-hidden="true" className="absolute inset-x-0 bottom-0 h-8 rounded-t-[50%_100%] bg-surface sm:h-12" />
      </section>

      <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-16">
        <SurahIndex
          surahs={surahs}
          locale={locale}
          labels={{ search: q.searchLabel, placeholder: q.searchPlaceholder, noResults: q.noResults }}
        />
      </div>
    </div>
  );
}
