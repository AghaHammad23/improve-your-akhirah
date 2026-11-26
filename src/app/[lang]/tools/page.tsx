import type { Metadata } from "next";
import Link from "next/link";
import { ArrowIcon, BeadsIcon, BookCheckIcon, CoinsIcon, StarIcon } from "@/components/icons";
import { PageHero } from "@/components/page-hero";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.tools.title, description: dict.tools.subtitle };
}

/** Tools built so far link to their page; the rest show "Coming soon". */
const tools = [
  { key: "tasbeeh", Icon: BeadsIcon, href: "/tools/tasbeeh" },
  { key: "names", Icon: StarIcon, href: "/tools/names" },
  { key: "zakat", Icon: CoinsIcon, href: null },
  { key: "khatam", Icon: BookCheckIcon, href: null },
] as const;

export default async function ToolsPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const t = dict.tools;

  return (
    <div className="ambient flex-1 overflow-x-clip">
      <PageHero title={t.title} subtitle={t.subtitle} />
      <ul className="mx-auto grid w-full max-w-4xl gap-4 px-4 pt-4 pb-16 sm:grid-cols-2">
        {tools.map(({ key, Icon, href }) => {
          const body = (
            <>
              <span className="flex items-start justify-between gap-3">
                <span className="glass-icon size-14">
                  <Icon className="size-7" />
                </span>
                {!href && (
                  <span className="glass inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold text-muted">
                    <span aria-hidden="true" className="size-1.5 rounded-full bg-gold-500" />
                    {dict.home.comingSoon}
                  </span>
                )}
              </span>
              <span className="font-heading mt-5 block text-2xl font-bold text-ink">{t.items[key].title}</span>
              <span className="mt-2 block text-sm leading-relaxed text-muted">{t.items[key].text}</span>
              {href && (
                <span className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-accent">
                  {t.open}
                  <ArrowIcon className="size-4 rtl:-scale-x-100" />
                </span>
              )}
            </>
          );
          return (
            <li key={key}>
              {href ? (
                <Link href={`/${locale}${href}`} className="glass card-premium block h-full p-6">
                  {body}
                </Link>
              ) : (
                <div className="glass block h-full p-6 opacity-80">{body}</div>
              )}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
