import type { Metadata } from "next";
import { Suspense } from "react";
import { ChapterReader, ChapterSkeleton, chapterMetadata } from "@/components/hadith/chapter-reader";
import { allChapters } from "@/lib/hadith";

/** Every chapter of every book is prerendered (first page; later pages live under /page/[n]). */
export async function generateStaticParams() {
  return allChapters().map(({ book, section }) => ({ book, chapter: String(section.id) }));
}

export async function generateMetadata({ params }: PageProps<"/[lang]/hadith/[book]/[chapter]">): Promise<Metadata> {
  const { book, chapter } = await params;
  return chapterMetadata(book, chapter);
}

/** Book and chapter are URL data, so they are read inside <Suspense> (instant navigation). */
export default function HadithChapterPage({ params }: PageProps<"/[lang]/hadith/[book]/[chapter]">) {
  return (
    <Suspense fallback={<ChapterSkeleton />}>
      <Content params={params} />
    </Suspense>
  );
}

async function Content({ params }: Pick<PageProps<"/[lang]/hadith/[book]/[chapter]">, "params">) {
  const { book, chapter } = await params;
  return <ChapterReader bookParam={book} chapterParam={chapter} />;
}
