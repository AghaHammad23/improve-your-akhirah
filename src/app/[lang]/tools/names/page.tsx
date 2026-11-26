import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { TranslationText } from "@/components/quran/translation-text";
import { type NameCard, NamesList } from "@/components/tools/names-list";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { fill, formatNumber } from "@/lib/format";
import { bookName, getHadith, gradeTone, type HadithRef, hadithHref } from "@/lib/hadith";
import { allahNames, NAMES_LIST_SOURCE, NAMES_VIRTUE_SOURCE } from "@/lib/names";
import { getSurahVerses } from "@/lib/quran";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.tools.names.title, description: dict.tools.names.subtitle };
}

/** "Allah has the Most Beautiful Names, so call upon Him by them" (Quran 7:180). */
const VERSE = [7, 180] as const;

export default async function NamesPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = dict.tools.names;
  const num = (n: number) => formatNumber(locale, n);
  const quranRef = (s: number, a: number) => fill(t.quranRef, { ref: `${num(s)}:${num(a)}` });
  const hadithLabel = (ref: HadithRef) =>
    fill(t.hadithRef, { book: bookName(ref.book, locale), n: num(ref.n) });

  const verse = getSurahVerses(VERSE[0])[VERSE[1] - 1];
  const verseHref = `/${locale}/quran/${VERSE[0]}#v-${VERSE[1]}`;
  const translation = locale === "ur" ? verse.ur : locale === "en" ? verse.en : null;
  const grades = getHadith(NAMES_LIST_SOURCE)?.g ?? [];
  const withRef = allahNames.filter((x) => x.quran || x.hadith).length;

  const names: NameCard[] = allahNames.map((x) => ({
    n: x.n,
    numberText: num(x.n),
    ar: x.ar,
    translit: x.translit,
    meaning: locale === "ur" ? x.meaning.ur : locale === "en" ? x.meaning.en : undefined,
    search: `${x.meaning.en} ${x.meaning.ur}`,
    ref: x.quran
      ? { label: quranRef(...x.quran), href: `/${locale}/quran/${x.quran[0]}#v-${x.quran[1]}` }
      : x.hadith
        ? { label: hadithLabel(x.hadith), href: hadithHref(locale, x.hadith) }
        : undefined,
  }));

  return (
    <div className="ambient flex-1 overflow-x-clip">
      <PageHero eyebrow={verse.ar.split(" ").slice(0, 3).join(" ")} title={t.title} subtitle={t.subtitle}>
        <Link
          href={`/${locale}/tools`}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-cream-100/80 transition-colors hover:text-gold-300"
        >
          <ArrowIcon className="size-4 -scale-x-100 rtl:scale-x-100" />
          {dict.tools.title}
        </Link>
      </PageHero>

      <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-16">
        <section className="glass mx-auto max-w-3xl rounded-3xl p-5 sm:p-8">
          <figure>
            <blockquote>
              <p lang="ar" dir="rtl" className="font-quran text-center text-2xl leading-[2.1] text-ink sm:text-3xl">
                {verse.ar}
              </p>
              {translation && (
                <p
                  lang={locale}
                  className={`mt-3 text-center leading-relaxed text-muted ${locale === "ur" ? "font-urdu text-lg leading-[2.2]" : ""}`}
                >
                  <TranslationText text={translation} />
                </p>
              )}
            </blockquote>
            <figcaption className="mt-2 text-center">
              <Link
                href={verseHref}
                className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                {quranRef(...VERSE)}
              </Link>
            </figcaption>
          </figure>

          <figure className="mt-6 border-t border-line pt-6">
            <blockquote>
              <p className="text-center leading-relaxed text-ink">{t.virtue}</p>
            </blockquote>
            <figcaption className="mt-2 text-center">
              <Link
                href={hadithHref(locale, NAMES_VIRTUE_SOURCE)}
                className="inline-flex min-h-11 items-center rounded-full px-3 text-sm font-semibold text-accent underline-offset-4 hover:underline"
              >
                {hadithLabel(NAMES_VIRTUE_SOURCE)}
              </Link>
            </figcaption>
          </figure>

          <details className="names-about mt-6 border-t border-line pt-4">
            <summary className="flex min-h-11 cursor-pointer items-center gap-2 rounded-xl px-2 font-semibold text-ink">
              <ArrowIcon className="names-about-arrow size-4 shrink-0 text-accent rtl:-scale-x-100" />
              {t.aboutTitle}
            </summary>
            <div className="space-y-3 px-2 pt-2 pb-1 text-sm leading-relaxed text-muted">
              <p>
                {t.aboutText.split("{source}")[0]}
                <Link href={hadithHref(locale, NAMES_LIST_SOURCE)} className="font-semibold text-accent underline underline-offset-4">
                  {hadithLabel(NAMES_LIST_SOURCE)}
                </Link>
                {t.aboutText.split("{source}")[1]}
              </p>
              {grades.length > 0 && (
                <div>
                  <p className="text-xs font-bold">{t.grading}</p>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {grades.map(([scholar, grade]) => (
                      <li key={scholar} lang="en" dir="ltr" className="grade" data-tone={gradeTone(grade)}>
                        <span className="text-muted">{scholar}:</span> <strong>{grade}</strong>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <p>{fill(t.refsText, { n: num(withRef) })}</p>
              <p className="font-semibold text-ink">{t.review}</p>
            </div>
          </details>
        </section>

        <div className="mt-10">
          <NamesList
            names={names}
            locale={locale}
            labels={{
              search: t.searchLabel,
              placeholder: t.searchPlaceholder,
              noResults: t.noResults,
              count: t.resultCount,
              numberLabel: t.numberLabel,
            }}
          />
        </div>
      </div>
    </div>
  );
}
