import type { Metadata } from "next";
import { PageHero } from "@/components/page-hero";
import { PrayerCredits, prayerTabs } from "@/components/prayer/prayer-credits";
import { QiblaView } from "@/components/prayer/qibla";
import { getDictionary, getLocale } from "@/i18n/get-dictionary";

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return { title: dict.prayer.qibla.title, description: dict.prayer.qibla.subtitle };
}

export default async function QiblaPage() {
  const [dict, locale] = await Promise.all([getDictionary(), getLocale()]);
  const p = dict.prayer;

  return (
    <div className="ambient flex-1 overflow-x-clip">
      <PageHero title={p.qibla.title} subtitle={p.qibla.subtitle} tabs={prayerTabs(locale, p, "qibla")} tabsLabel={p.tabsLabel} />
      <div className="px-4 pt-4 pb-16">
        <QiblaView locale={locale} labels={p.qibla} location={p.location} />
        <PrayerCredits labels={p} />
      </div>
    </div>
  );
}
