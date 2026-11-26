import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import type { CSSProperties } from "react";
import { ArrowIcon, CopyIcon, ShareIcon } from "@/components/icons";
import { InlineScript } from "@/components/inline-script";
import { PageHero } from "@/components/page-hero";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { fill, formatNumber } from "@/lib/format";
import {
  bookName,
  chapterPath,
  getHadithBook,
  getHadithSection,
  gradeTone,
  hadithBooks,
  isHadithBook,
  sectionPages,
  parseChapterId,
  type Hadith,
} from "@/lib/hadith";
import { prefsScript } from "@/lib/reader-prefs-script";
import { HadithControls } from "./hadith-controls";

/** Resolves URL params to a book, chapter and page, or 404s. */
function resolve(bookParam: string, chapterParam: string, pageParam?: string) {
  if (!isHadithBook(bookParam)) notFound();
  const data = getHadithBook(bookParam);
  const id = parseChapterId(chapterParam);
  const index = data && id !== undefined ? data.sections.findIndex((s) => s.id === id && s.title) : -1;
  if (!data || index < 0) notFound();
  const section = data.sections[index];
  const pages = sectionPages(bookParam, section.id).length;
  // Page 1 lives at the chapter URL only, so /page/1 is not a valid address.
  const page = pageParam === undefined ? 1 : /^[1-9]\d{0,2}$/.test(pageParam) ? Number(pageParam) : 0;
  if (page < 1 || page > pages || (pageParam !== undefined && page === 1)) notFound();
  return { book: bookParam, data, section, page, pages };
}

export async function chapterMetadata(bookParam: string, chapterParam: string, pageParam?: string): Promise<Metadata> {
  if (!isHadithBook(bookParam)) return {};
  const section = getHadithBook(bookParam)?.sections.find((s) => String(s.id) === chapterParam && s.title);
  if (!section) return {};
  const dict = await getDictionary();
  const page = pageParam ? ` · ${fill(dict.hadith.pageNumber, { n: pageParam })}` : "";
  return { title: `${section.title}${page} · ${hadithBooks[bookParam].en}` };
}

export function ChapterSkeleton() {
  return (
    <div className="flex-1" aria-busy="true">
      <div className="-mt-16 bg-[radial-gradient(ellipse_at_50%_0%,var(--color-brand-700),var(--color-brand-800)_55%,var(--color-brand-950))] pt-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 pt-12 pb-16">
          <span className="h-8 w-40 animate-pulse rounded-full bg-white/10" />
          <span className="h-10 w-64 max-w-full animate-pulse rounded-2xl bg-white/10" />
          <span className="h-5 w-48 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-4xl space-y-6 px-4 pt-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 border-b border-line pb-6">
            <span className="ms-auto block h-6 w-4/5 animate-pulse rounded-xl bg-line" />
            <span className="ms-auto block h-6 w-3/5 animate-pulse rounded-xl bg-line" />
            <span className="block h-4 w-3/5 animate-pulse rounded-full bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

/** One reading page of a hadith chapter: a slice of hadith (see sectionPages) in Arabic, Urdu and English. */
export async function ChapterReader({
  bookParam,
  chapterParam,
  pageParam,
}: {
  bookParam: string;
  chapterParam: string;
  pageParam?: string;
}) {
  const { book, data, section, page, pages } = resolve(bookParam, chapterParam, pageParam);
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const h = dict.hadith;
  const q = dict.quran;
  const name = bookName(book, locale);
  const { start, end } = sectionPages(book, section.id)[page - 1];
  const items = getHadithSection(book, section.id).slice(start, end);
  const href = (chapter: number, p = 1) => `/${locale}${chapterPath(book, chapter, p)}`;

  const chapters = data.sections.filter((s) => s.title);
  const pos = chapters.indexOf(section);
  const prevChapter = pos > 0 ? chapters[pos - 1] : undefined;
  const nextChapter = pos < chapters.length - 1 ? chapters[pos + 1] : undefined;
  // Bottom links follow reading order: the neighbouring page within the chapter, else the neighbouring chapter.
  const prev =
    page > 1
      ? { href: href(section.id, page - 1), kind: h.previousPage, label: fill(h.pageNumber, { n: formatNumber(locale, page - 1) }), en: false }
      : prevChapter && { href: href(prevChapter.id, sectionPages(book, prevChapter.id).length), kind: h.previousChapter, label: prevChapter.title, en: true };
  const next =
    page < pages
      ? { href: href(section.id, page + 1), kind: h.nextPage, label: fill(h.pageNumber, { n: formatNumber(locale, page + 1) }), en: false }
      : nextChapter && { href: href(nextChapter.id), kind: h.nextChapter, label: nextChapter.title, en: true };

  const pager =
    pages > 1 ? (
      <nav aria-label={h.pages} className="flex flex-wrap justify-center gap-1.5">
        {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
          <Link
            key={p}
            href={href(section.id, p)}
            aria-current={p === page ? "page" : undefined}
            aria-label={fill(h.pageNumber, { n: formatNumber(locale, p) })}
            className="chip min-w-11 justify-center px-2"
          >
            {formatNumber(locale, p)}
          </Link>
        ))}
      </nav>
    ) : null;

  return (
    <div className="ambient flex-1 overflow-x-clip">
      <PageHero
        eyebrow={hadithBooks[book].ar}
        title={
          // Chapter titles exist only in English in the source data.
          <span lang="en" dir="ltr" className="font-serif">
            {section.title}
          </span>
        }
        subtitle={
          <>
            {name} · {section.id > 0 ? `${fill(h.chapterNumber, { n: formatNumber(locale, section.id) })} · ` : ""}
            {fill(h.hadithCount, { n: formatNumber(locale, section.count) })}
          </>
        }
      >
        <Link
          href={`/${locale}/hadith/${book}`}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-cream-100/80 transition-colors hover:text-gold-300"
        >
          <ArrowIcon className="size-4 -scale-x-100 rtl:scale-x-100" />
          {h.backToChapters}
        </Link>
      </PageHero>

      <HadithControls
        locale={locale}
        bookName={name}
        pagePath={href(section.id, page)}
        labels={{
          translations: q.translationsLabel,
          urdu: q.urdu,
          english: q.english,
          textSize: q.textSize,
          smaller: q.smaller,
          larger: q.larger,
          copied: h.copied,
          linkCopied: q.linkCopied,
          copyFailed: q.copyFailed,
        }}
      />

      <div
        id="reader"
        data-tr-ur={String(locale === "ur")}
        data-tr-en={String(locale === "en")}
        style={{ "--quran-scale": "1" } as CSSProperties}
        suppressHydrationWarning
        className="mx-auto max-w-4xl px-3 pt-6 pb-24 sm:px-4"
      >
        <InlineScript html={prefsScript} />

        {pages > 1 && (
          <div className="mb-2 space-y-3 text-center">
            <p className="text-sm text-muted">
              {fill(h.pageOf, { n: formatNumber(locale, page), total: formatNumber(locale, pages) })} ·{" "}
              {fill(h.hadithRange, {
                from: formatNumber(locale, items[0].n),
                to: formatNumber(locale, items[items.length - 1].n),
              })}
            </p>
            {pager}
          </div>
        )}

        <ol>
          {items.map((item, i) => (
            <HadithItem key={`${item.n}-${i}`} item={item} locale={locale} labels={h} />
          ))}
        </ol>

        {pager && <div className="mt-8">{pager}</div>}

        <nav aria-label={h.chapterNav} className="mt-8 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link href={prev.href} className="glass card-premium flex items-center gap-3 p-4">
              <ArrowIcon className="size-5 shrink-0 -scale-x-100 text-gold-600 rtl:scale-x-100 dark:text-gold-300" />
              <span className="min-w-0">
                <span className="block text-xs text-muted">{prev.kind}</span>
                <span lang={prev.en ? "en" : undefined} className="block truncate font-bold text-ink">
                  {prev.label}
                </span>
              </span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {next && (
            <Link href={next.href} className="glass card-premium flex items-center justify-end gap-3 p-4 text-end">
              <span className="min-w-0">
                <span className="block text-xs text-muted">{next.kind}</span>
                <span lang={next.en ? "en" : undefined} className="block truncate font-bold text-ink">
                  {next.label}
                </span>
              </span>
              <ArrowIcon className="size-5 shrink-0 text-gold-600 rtl:-scale-x-100 dark:text-gold-300" />
            </Link>
          )}
        </nav>

        <p className="mt-10 border-t border-line pt-6 text-xs text-muted">{h.credit}</p>
      </div>
    </div>
  );
}

type HadithLabels = Awaited<ReturnType<typeof getDictionary>>["hadith"];

function HadithItem({ item, locale, labels: h }: { item: Hadith; locale: string; labels: HadithLabels }) {
  const n = formatNumber(locale, item.n);
  return (
    <li id={`h-${item.n}`} className="verse">
      <div className="flex items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <span className="star-badge shrink-0" aria-label={fill(h.hadithLabel, { n })}>
            <span>{n}</span>
          </span>
          <span className="truncate text-xs text-muted">{fill(h.arabicNumber, { n: formatNumber(locale, item.an) })}</span>
        </div>
        <div className="flex shrink-0 items-center gap-1.5">
          <button
            type="button"
            data-copy-hadith={item.n}
            aria-label={fill(h.copyHadith, { n })}
            title={fill(h.copyHadith, { n })}
            className="verse-play"
          >
            <CopyIcon className="size-4" />
          </button>
          <button
            type="button"
            data-share-hadith={item.n}
            aria-label={fill(h.shareHadith, { n })}
            title={fill(h.shareHadith, { n })}
            className="verse-play"
          >
            <ShareIcon className="size-4" />
          </button>
        </div>
      </div>

      {item.ar ? (
        <p lang="ar" dir="rtl" className="hadith-ar mt-3">
          {item.ar}
        </p>
      ) : (
        <p className="tr-missing mt-3">{h.arabicMissing}</p>
      )}

      {item.ur ? (
        <p lang="ur" dir="rtl" className="tr tr-ur font-urdu">
          {item.ur}
        </p>
      ) : (
        <p className="tr tr-ur tr-missing">{h.urduMissing}</p>
      )}

      {item.en ? (
        <p lang="en" dir="ltr" className="tr tr-en font-sans">
          {item.en}
        </p>
      ) : (
        <p className="tr tr-en tr-missing">{h.englishMissing}</p>
      )}

      {item.g && item.g.length > 0 && (
        <div className="mt-4">
          <p className="text-xs font-bold text-muted">{h.grading}</p>
          <ul className="mt-2 flex flex-wrap gap-2">
            {item.g.map(([scholar, grade]) => (
              <li key={scholar} lang="en" dir="ltr" className="grade" data-tone={gradeTone(grade)}>
                <span className="text-muted">{scholar}:</span> <strong>{grade}</strong>
              </li>
            ))}
          </ul>
        </div>
      )}
    </li>
  );
}

