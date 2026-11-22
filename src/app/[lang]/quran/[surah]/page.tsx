import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense, type CSSProperties } from "react";
import { ArrowIcon, CopyIcon, PlayIcon, ShareIcon } from "@/components/icons";
import { InlineScript } from "@/components/inline-script";
import { ReaderControls } from "@/components/quran/reader-controls";
import { TranslationText } from "@/components/quran/translation-text";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { fill, formatNumber } from "@/lib/format";
import {
  getQuranSources,
  getSurahMeta,
  getSurahVerses,
  parseSurahNumber,
  showsBismillah,
  type SurahMeta,
} from "@/lib/quran";
import { PREFS_KEY } from "@/lib/reader-prefs";

export async function generateStaticParams() {
  return Array.from({ length: 114 }, (_, i) => ({ surah: String(i + 1) }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/quran/[surah]">): Promise<Metadata> {
  const n = parseSurahNumber((await params).surah);
  const meta = n ? getSurahMeta(n) : undefined;
  if (!meta) return {};
  const dict = await getDictionary();
  return {
    title: `${meta.transliteration} · ${meta.nameArabic}`,
    description: `${dict.quran.title}: ${meta.transliteration} (${meta.meaningEn}), ${meta.ayahs}`,
  };
}

/** Applies saved translation/size prefs before first paint (full page loads only). */
const prefsScript = `(function(){try{var s=JSON.parse(localStorage.getItem(${JSON.stringify(PREFS_KEY)})||"null");var r=document.getElementById("reader");if(!s||!r)return;if(s.tr){if("ur" in s.tr)r.dataset.trUr=String(!!s.tr.ur);if("en" in s.tr)r.dataset.trEn=String(!!s.tr.en)}if(s.size)r.style.setProperty("--quran-scale",String(s.size))}catch(e){}})()`;

function surahName(meta: SurahMeta, locale: string) {
  return locale === "en" ? meta.transliteration : meta.nameArabic;
}

/**
 * The surah number is URL data, so it is read inside <Suspense> (Partial Prefetching / instant navigation).
 * All 114 surahs are still prerendered at build time via generateStaticParams.
 */
export default function SurahPage({ params }: PageProps<"/[lang]/quran/[surah]">) {
  return (
    <Suspense fallback={<SurahSkeleton />}>
      <SurahContent params={params} />
    </Suspense>
  );
}

function SurahSkeleton() {
  return (
    <div className="flex-1" aria-busy="true">
      <div className="-mt-16 bg-[radial-gradient(ellipse_at_50%_0%,var(--color-brand-700),var(--color-brand-800)_55%,var(--color-brand-950))] pt-16">
        <div className="mx-auto flex max-w-4xl flex-col items-center gap-3 px-4 pt-12 pb-14">
          <span className="h-4 w-24 animate-pulse rounded-full bg-white/10" />
          <span className="h-14 w-48 animate-pulse rounded-2xl bg-white/10" />
          <span className="h-6 w-36 animate-pulse rounded-full bg-white/10" />
        </div>
      </div>
      <div className="mx-auto max-w-4xl space-y-6 px-4 pt-10">
        {[0, 1, 2].map((i) => (
          <div key={i} className="space-y-3 border-b border-line pb-6">
            <span className="ms-auto block h-8 w-4/5 animate-pulse rounded-xl bg-line" />
            <span className="block h-4 w-3/5 animate-pulse rounded-full bg-line" />
          </div>
        ))}
      </div>
    </div>
  );
}

async function SurahContent({ params }: Pick<PageProps<"/[lang]/quran/[surah]">, "params">) {
  const n = parseSurahNumber((await params).surah);
  if (!n) notFound();
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const q = dict.quran;
  const meta = getSurahMeta(n)!;
  const verses = getSurahVerses(n);
  const sources = getQuranSources();
  const bismillah = showsBismillah(n) ? getSurahVerses(1)[0].ar : null;
  const prev = n > 1 ? getSurahMeta(n - 1) : undefined;
  const next = n < 114 ? getSurahMeta(n + 1) : undefined;

  return (
    <div className="ambient flex-1 overflow-x-clip">
      {/* Surah heading */}
      <section className="relative isolate -mt-16 overflow-hidden bg-[radial-gradient(ellipse_at_50%_0%,var(--color-brand-700),var(--color-brand-800)_55%,var(--color-brand-950))] pt-16 text-cream-100">
        <div
          aria-hidden="true"
          className="islamic-pattern absolute inset-0 -z-10 opacity-[0.08] mask-[radial-gradient(ellipse_at_center,black_30%,transparent_75%)]"
        />
        <div className="mx-auto max-w-4xl px-4 pt-8 pb-12 text-center sm:pt-10 sm:pb-14">
          <Link
            href={`/${locale}/quran`}
            className="inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-cream-100/80 transition-colors hover:text-gold-300"
          >
            <ArrowIcon className="size-4 -scale-x-100 rtl:scale-x-100" />
            {q.allSurahs}
          </Link>
          <p className="mt-2 text-sm tracking-widest text-gold-300 uppercase">
            {fill(q.surahNumber, { n: formatNumber(locale, n) })}
          </p>
          <h1>
            <span lang="ar" dir="rtl" className="font-quran mt-1 block text-5xl leading-snug text-cream-50 sm:text-6xl">
              {meta.nameArabic}
            </span>
            <span lang="en" className="mt-1 block font-serif text-2xl font-bold text-gold-300 sm:text-3xl">
              {meta.transliteration}
            </span>
          </h1>
          <p className="mt-2 text-sm text-cream-100/80">
            {locale === "en" && <>{meta.meaningEn} · </>}
            {fill(q.versesCount, { n: formatNumber(locale, meta.ayahs) })} · {meta.type === "makki" ? q.makki : q.madani}
          </p>
        </div>
      </section>

      <ReaderControls
        locale={locale}
        surah={n}
        surahName={surahName(meta, locale)}
        totalVerses={meta.ayahs}
        hasBismillah={bismillah !== null}
        labels={{
          translations: q.translationsLabel,
          urdu: q.urdu,
          english: q.english,
          textSize: q.textSize,
          smaller: q.smaller,
          larger: q.larger,
          notesError: q.notesError,
          copied: q.copied,
          linkCopied: q.linkCopied,
          copyFailed: q.copyFailed,
          goToVerse: q.goToVerse,
          go: q.go,
          ...dict.player,
        }}
      />

      <div
        id="reader"
        data-tr-ur={String(locale === "ur")}
        data-tr-en={String(locale === "en")}
        style={{ "--quran-scale": "1" } as CSSProperties}
        suppressHydrationWarning
        className="mx-auto max-w-4xl px-3 pt-6 pb-40 sm:px-4"
      >
        <InlineScript html={prefsScript} />

        {bismillah && (
          <p id="v-0" lang="ar" dir="rtl" className="verse bismillah font-quran text-center text-ink">
            {bismillah}
          </p>
        )}

        <ol className="mt-2">
          {verses.map((v) => (
            <li key={v.n} id={`v-${v.n}`} className="verse">
              <div className="flex items-center justify-between gap-3">
                <span className="star-badge" aria-label={fill(q.verseLabel, { n: formatNumber(locale, v.n) })}>
                  <span>{formatNumber(locale, v.n)}</span>
                </span>
                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    data-copy-verse={v.n}
                    aria-label={fill(q.copyVerse, { n: formatNumber(locale, v.n) })}
                    title={fill(q.copyVerse, { n: formatNumber(locale, v.n) })}
                    className="verse-play"
                  >
                    <CopyIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    data-share-verse={v.n}
                    aria-label={fill(q.shareVerse, { n: formatNumber(locale, v.n) })}
                    title={fill(q.shareVerse, { n: formatNumber(locale, v.n) })}
                    className="verse-play"
                  >
                    <ShareIcon className="size-4" />
                  </button>
                  <button
                    type="button"
                    data-play-verse={v.n}
                    aria-pressed="false"
                    aria-label={fill(q.playVerse, { n: formatNumber(locale, v.n) })}
                    title={fill(q.playVerse, { n: formatNumber(locale, v.n) })}
                    className="verse-play"
                  >
                    <PlayIcon className="size-4" />
                  </button>
                </div>
              </div>
              <p lang="ar" dir="rtl" className="quran-text mt-3">
                {v.ar}
              </p>
              <div lang="ur" dir="rtl" className="tr tr-ur font-urdu">
                <p>
                  <TranslationText text={v.ur} />
                </p>
                {v.urNotes && (
                  <details className="notes" data-notes-lang="ur" data-notes-verse={v.n}>
                    <summary>{q.footnotes}</summary>
                    <p className="notes-body whitespace-pre-line" />
                  </details>
                )}
              </div>
              <div lang="en" dir="ltr" className="tr tr-en font-sans">
                <p>
                  <TranslationText text={v.en} />
                </p>
                {v.enNotes && (
                  <details className="notes" data-notes-lang="en" data-notes-verse={v.n}>
                    <summary>{q.footnotes}</summary>
                    <p className="notes-body whitespace-pre-line" />
                  </details>
                )}
              </div>
            </li>
          ))}
        </ol>

        <nav aria-label={q.allSurahs} className="mt-10 grid gap-3 sm:grid-cols-2">
          {prev ? (
            <Link href={`/${locale}/quran/${prev.number}`} className="glass card-premium flex items-center gap-3 p-4">
              <ArrowIcon className="size-5 shrink-0 -scale-x-100 text-gold-600 rtl:scale-x-100 dark:text-gold-300" />
              <span className="min-w-0">
                <span className="block text-xs text-muted">{q.previous}</span>
                <span className="block truncate font-bold text-ink">{surahName(prev, locale)}</span>
              </span>
            </Link>
          ) : (
            <span className="hidden sm:block" />
          )}
          {next && (
            <Link
              href={`/${locale}/quran/${next.number}`}
              className="glass card-premium flex items-center justify-end gap-3 p-4 text-end"
            >
              <span className="min-w-0">
                <span className="block text-xs text-muted">{q.next}</span>
                <span className="block truncate font-bold text-ink">{surahName(next, locale)}</span>
              </span>
              <ArrowIcon className="size-5 shrink-0 text-gold-600 rtl:-scale-x-100 dark:text-gold-300" />
            </Link>
          )}
        </nav>

        <section className="mt-10 border-t border-line pt-6 text-xs leading-relaxed text-muted">
          <h2 className="font-bold text-ink">{q.creditsTitle}</h2>
          <ul className="mt-2 space-y-1">
            <li>{q.creditArabic}</li>
            <li>{fill(q.creditUr, { v: sources.translations.ur.version })}</li>
            <li>{fill(q.creditEn, { v: sources.translations.en.version })}</li>
            <li>{q.creditMeta}</li>
            <li>{q.creditAudio}</li>
          </ul>
        </section>
      </div>
    </div>
  );
}
