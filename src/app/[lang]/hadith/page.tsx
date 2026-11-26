import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, ScrollIcon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { fill, formatNumber } from "@/lib/format";
import { bookName, compilerName, getHadithBooks, hadithBooks, isHadithBook } from "@/lib/hadith";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.hadith.title, description: dict.hadith.subtitle };
}

export default async function HadithBooksPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const h = dict.hadith;
  const books = getHadithBooks().filter((b) => isHadithBook(b.slug));
  // Keep the traditional order of the six books.
  const order = Object.keys(hadithBooks);
  books.sort((a, b) => order.indexOf(a.slug) - order.indexOf(b.slug));

  return (
    <div className="ambient flex-1 overflow-hidden">
      <PageHero eyebrow="الحديث الشريف" title={h.title} subtitle={h.subtitle} />

      <div className="mx-auto w-full max-w-6xl px-4 pt-4 pb-16">
        <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => {
            if (!isHadithBook(b.slug)) return null;
            const slug = b.slug;
            return (
              <li key={slug}>
                <Link href={`/${locale}/hadith/${slug}`} className="glass card-premium group flex h-full flex-col p-6">
                  <span className="flex items-start justify-between gap-3">
                    <span className="glass-icon size-14">
                      <ScrollIcon className="size-7" />
                    </span>
                    <span lang="ar" dir="rtl" className="font-quran text-2xl text-accent">
                      {hadithBooks[slug].ar}
                    </span>
                  </span>
                  <span className="font-heading mt-5 text-2xl font-bold text-ink group-hover:text-accent">
                    {bookName(slug, locale)}
                  </span>
                  <span className="mt-1 text-sm text-muted">{fill(h.compiler, { name: compilerName(slug, locale) })}</span>
                  <span className="mt-4 flex flex-1 flex-wrap content-start gap-2 text-xs">
                    <span className="glass rounded-full px-3 py-1 font-semibold text-muted">
                      {fill(h.hadithCount, { n: formatNumber(locale, b.total) })}
                    </span>
                    <span className="glass rounded-full px-3 py-1 font-semibold text-muted">
                      {fill(h.chaptersCount, { n: formatNumber(locale, b.sections.length) })}
                    </span>
                    {b.graded && (
                      <span className="glass rounded-full px-3 py-1 font-semibold text-muted">{h.graded}</span>
                    )}
                  </span>
                  <span aria-hidden="true" className="card-arrow mt-5 inline-flex text-gold-600 dark:text-gold-300">
                    <ArrowIcon className="size-5" />
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>

        <p className="mt-12 text-center text-xs text-muted">{h.credit}</p>
      </div>
    </div>
  );
}
