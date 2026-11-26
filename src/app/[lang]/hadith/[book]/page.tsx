import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { ArrowIcon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { fill, formatNumber } from "@/lib/format";
import { bookName, compilerName, getHadithBook, hadithBooks, isHadithBook } from "@/lib/hadith";

export async function generateStaticParams() {
  return Object.keys(hadithBooks).map((book) => ({ book }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/hadith/[book]">): Promise<Metadata> {
  const { book } = await params;
  if (!isHadithBook(book)) return {};
  const dict = await getDictionary();
  return { title: `${hadithBooks[book].en} · ${dict.hadith.title}` };
}

/** The book slug is URL data, so it is read inside <Suspense> (instant navigation). */
export default function HadithBookPage({ params }: PageProps<"/[lang]/hadith/[book]">) {
  return (
    <Suspense fallback={<div className="flex-1" aria-busy="true" />}>
      <BookContent params={params} />
    </Suspense>
  );
}

async function BookContent({ params }: Pick<PageProps<"/[lang]/hadith/[book]">, "params">) {
  const { book } = await params;
  if (!isHadithBook(book)) notFound();
  const data = getHadithBook(book);
  if (!data) notFound();
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const h = dict.hadith;

  return (
    <div className="ambient flex-1 overflow-hidden">
      <PageHero
        eyebrow={hadithBooks[book].ar}
        title={bookName(book, locale)}
        subtitle={
          <>
            {fill(h.compiler, { name: compilerName(book, locale) })} ·{" "}
            {fill(h.hadithCount, { n: formatNumber(locale, data.total) })} ·{" "}
            {fill(h.chaptersCount, { n: formatNumber(locale, data.sections.length) })}
          </>
        }
      >
        <Link
          href={`/${locale}/hadith`}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-cream-100/80 transition-colors hover:text-gold-300"
        >
          <ArrowIcon className="size-4 -scale-x-100 rtl:scale-x-100" />
          {h.allBooks}
        </Link>
      </PageHero>

      <div className="mx-auto w-full max-w-4xl px-4 pt-4 pb-16">
        {data.missing.ur > 0 && (
          <p className="glass mb-6 rounded-2xl px-4 py-3 text-sm text-muted">
            {fill(h.missingUrdu, { n: formatNumber(locale, data.missing.ur) })}
          </p>
        )}

        <h2 className="font-heading text-2xl font-bold text-ink">{h.chapters}</h2>

        <ol className="mt-4 grid gap-2">
          {data.sections
            .filter((s) => s.title)
            .map((s) => (
              <li key={s.id}>
                <Link
                  href={`/${locale}/hadith/${book}/${s.id}`}
                  className="glass card-premium flex min-h-14 items-center gap-4 rounded-2xl px-4 py-3"
                >
                  {/* Chapter 0 is an introduction in some books (e.g. Muslim), so it gets no number. */}
                  <span className="star-badge shrink-0" aria-hidden={s.id > 0 ? undefined : true}>
                    <span>{s.id > 0 ? formatNumber(locale, s.id) : "•"}</span>
                  </span>
                  {/* Chapter titles exist only in English in the source data. */}
                  <span lang="en" dir="ltr" className="min-w-0 flex-1 font-sans font-semibold text-ink">
                    {s.title}
                  </span>
                  <span className="shrink-0 text-xs text-muted">{fill(h.hadithCount, { n: formatNumber(locale, s.count) })}</span>
                </Link>
              </li>
            ))}
        </ol>

        <p className="mt-10 text-xs text-muted">{h.credit}</p>
      </div>
    </div>
  );
}
