import Link from "next/link";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export default async function NotFound() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-1 flex-col items-center justify-center px-4 py-16 text-center">
      <h1 className="font-heading text-3xl font-bold text-ink">{dict.notFound.title}</h1>
      <p className="mt-3 text-muted">{dict.notFound.text}</p>
      <Link
        href={`/${locale}`}
        className="btn btn-teal mt-8"
      >
        {dict.notFound.home}
      </Link>
    </div>
  );
}
