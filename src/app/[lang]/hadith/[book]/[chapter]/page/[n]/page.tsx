import type { Metadata } from "next";
import { Suspense } from "react";
import { ChapterReader, ChapterSkeleton, chapterMetadata } from "@/components/hadith/chapter-reader";
import { allChapters, sectionPages } from "@/lib/hadith";

/** Pages 2+ of the chapters that are longer than one page. */
export async function generateStaticParams() {
  return allChapters().flatMap(({ book, section }) =>
    Array.from({ length: sectionPages(book, section.id).length - 1 }, (_, i) => ({ book, chapter: String(section.id), n: String(i + 2) })),
  );
}

export async function generateMetadata({ params }: PageProps<"/[lang]/hadith/[book]/[chapter]/page/[n]">): Promise<Metadata> {
  const { book, chapter, n } = await params;
  return chapterMetadata(book, chapter, n);
}

export default function HadithChapterPageN({ params }: PageProps<"/[lang]/hadith/[book]/[chapter]/page/[n]">) {
  return (
    <Suspense fallback={<ChapterSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Pick<PageProps<"/[lang]/hadith/[book]/[chapter]/page/[n]">, "params">) {
  const { book, chapter, n } = await params;
  return <ChapterReader bookParam={book} chapterParam={chapter} pageParam={n} />;
}
