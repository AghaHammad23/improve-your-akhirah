import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { SiteSearch } from "@/components/search/site-search";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { bookName, hadithBooks, type HadithBookSlug } from "@/lib/hadith";
import { getSurahList } from "@/lib/quran";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.search.title, description: dict.search.subtitle };
}

/**
 * Quran and Hadith search. The page is static; the query lives in ?q= (and ?in=hadith), read on the client.
 * - Quran: runs in the browser over public/search/quran-*.json (scripts/build-search-index.mjs).
 * - Hadith: runs on the server at /api/search/hadith (index from scripts/build-hadith-search-index.mjs).
 */
export default async function SearchPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const s = dict.search;
  const surahs = getSurahList().map((m) => ({
    n: m.number,
    name: locale === "en" ? m.transliteration : m.nameArabic,
    ayahs: m.ayahs,
  }));
  const bookNames = (Object.keys(hadithBooks) as HadithBookSlug[]).map((slug): [string, string] => [slug, bookName(slug, locale)]);
  const shared = {
    loading: s.loading,
    loadError: s.loadError,
    retry: s.retry,
    showMore: s.showMore,
    arabic: s.arabic,
    urdu: dict.quran.urdu,
    english: dict.quran.english,
  };

  return (
    <div className="ambient flex-1 overflow-x-clip">
      <PageHero title={s.title} subtitle={s.subtitle} />
      <div className="mx-auto w-full max-w-3xl px-4 pt-4 pb-16">
        <SiteSearch
          locale={locale}
          surahs={surahs}
          bookNames={bookNames}
          labels={{
            label: s.label,
            placeholder: s.placeholder,
            hadithPlaceholder: s.hadithPlaceholder,
            hint: s.hint,
            romanNote: s.romanNote,
            scopeLabel: s.scopeLabel,
            quran: dict.nav.quran,
            hadith: dict.nav.hadith,
            quranResults: { ...shared, results: s.results, noResults: s.noResults, goTo: s.goTo },
            hadithResults: {
              ...shared,
              results: s.hadithResults,
              noResults: s.hadithNoResults,
              allBooks: s.allBooks,
              filterLabel: s.filterLabel,
              hadithLabel: dict.hadith.hadithLabel,
            },
          }}
        />
        <section className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-muted">
          <h2 className="font-bold text-ink">{dict.quran.creditsTitle}</h2>
          <ul className="mt-2 space-y-1">
            <li>
              {s.creditArabic}{" "}
              <a href="https://tanzil.net" className="underline underline-offset-2 hover:text-ink" lang="en">
                tanzil.net
              </a>
            </li>
            <li>{s.creditTranslations}</li>
            <li>{dict.hadith.credit}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
