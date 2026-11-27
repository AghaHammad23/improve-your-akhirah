import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { PrayerTimesView } from "@/components/prayer/prayer-times";
import { PrayerCredits, prayerTabs } from "@/components/prayer/prayer-credits";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.prayer.title, description: dict.prayer.subtitle };
}

/** The page shell is static; times are worked out in the browser from the visitor's saved place. */
export default async function PrayerTimesPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const p = dict.prayer;

  return (
    <div className="ambient flex-1 overflow-x-clip">
      <PageHero title={p.title} subtitle={p.subtitle} tabs={prayerTabs(locale, p, "times")} tabsLabel={p.tabsLabel} />
      <div className="px-4 pt-4 pb-16">
        <PrayerTimesView locale={locale} labels={p} />
        <PrayerCredits labels={p} />
      </div>
    </div>
  );
}
