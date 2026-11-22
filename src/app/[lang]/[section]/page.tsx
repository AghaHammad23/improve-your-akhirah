import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { placeholderSlugs, sections } from "@/lib/sections";

/** Temporary "coming soon" pages for sections that aren't built yet. Real routes (e.g. app/[lang]/quran) take precedence. */
export async function generateStaticParams() {
  return placeholderSlugs.map((section) => ({ section }));
}

async function sectionTitle(slug: string) {
  const dict = await getDictionary();
  if (slug === "sources") return dict.nav.sources;
  const section = sections.find((s) => s.slug === slug);
  return section ? dict.nav[section.key] : null;
}

export async function generateMetadata({ params }: PageProps<"/[lang]/[section]">): Promise<Metadata> {
  const title = await sectionTitle((await params).section);
  return title ? { title } : {};
}

export default function SectionPlaceholder({ params }: PageProps<"/[lang]/[section]">) {
  // The section slug is URL data, so read it inside <Suspense>.
  return (
    <Suspense fallback={<div className="flex-1" aria-busy="true" />}>
      <SectionContent params={params} />
    </Suspense>
  );
}

async function SectionContent({ params }: Pick<PageProps<"/[lang]/[section]">, "params">) {
  const { section } = await params;
  const [title, dict, locale] = await Promise.all([sectionTitle(section), getDictionary(), getLocale()]);
  if (!title) notFound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <p className="rounded-full bg-gold-100 px-3 py-1 text-sm font-semibold text-gold-800 dark:bg-gold-800/30 dark:text-gold-200">
        {dict.section.comingSoonTitle}
      </p>
      <h1 className="font-heading mt-4 text-3xl font-bold text-ink sm:text-4xl">{title}</h1>
      <p className="mt-3 text-muted">{dict.section.comingSoonText}</p>
      <Link
        href={`/${locale}`}
        className="btn btn-teal mt-8"
      >
        {dict.section.backHome}
      </Link>
    </div>
  );
}
