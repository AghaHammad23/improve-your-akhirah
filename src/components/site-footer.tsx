import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export async function SiteFooter() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <footer className="mt-auto border-t border-line bg-surface-raised">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p lang="en" className="font-serif font-bold text-ink">
            {dict.brand.name}
          </p>
          <p>{dict.footer.free}</p>
        </div>
        <Link
          href={`/${locale}/sources`}
          className="inline-flex min-h-11 items-center text-accent underline-offset-4 hover:underline"
        >
          {dict.footer.sources}
        </Link>
      </div>
    </footer>
  );
}
