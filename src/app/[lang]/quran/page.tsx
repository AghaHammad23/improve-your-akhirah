import type { Metadata } from "next";
import { QuranHero } from "@/components/quran/quran-hero";
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
      <QuranHero
        title={q.title}
        subtitle={q.subtitle}
        locale={locale}
        active="surahs"
        labels={{ surahs: q.tabSurahs, juz: q.tabJuz, browseBy: q.browseBy }}
      />

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
