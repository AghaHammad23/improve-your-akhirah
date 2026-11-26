import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { TasbeehCounter } from "@/components/tools/tasbeeh-counter";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";
import { hadithHref } from "@/lib/hadith";
import { AFTER_PRAYER_SOURCE } from "@/lib/tasbeeh";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.tools.tasbeeh.title, description: dict.tools.tasbeeh.subtitle };
}

export default async function TasbeehPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = dict.tools.tasbeeh;

  return (
    <div className="ambient flex-1 overflow-x-clip">
      <PageHero title={t.title} subtitle={t.subtitle}>
        <Link
          href={`/${locale}/tools`}
          className="mt-6 inline-flex min-h-11 items-center gap-2 rounded-full px-3 text-sm text-cream-100/80 transition-colors hover:text-gold-300"
        >
          <ArrowIcon className="size-4 -scale-x-100 rtl:scale-x-100" />
          {dict.tools.title}
        </Link>
      </PageHero>
      <div className="px-4 pt-4 pb-16">
        <TasbeehCounter locale={locale} labels={t} sourceHref={hadithHref(locale, AFTER_PRAYER_SOURCE)} />
      </div>
    </div>
  );
}
