import type { HeroTab } from "@/components/page-hero";

/** The Prayer times / Qibla switch in the page heading. */
export function prayerTabs(locale: string, labels: { tabTimes: string; tabQibla: string }, active: "times" | "qibla"): HeroTab[] {
  return [
    { href: `/${locale}/prayer-times`, label: labels.tabTimes, current: active === "times" },
    { href: `/${locale}/prayer-times/qibla`, label: labels.tabQibla, current: active === "qibla" },
  ];
}

/** Credits required by the sources (GeoNames CC BY 4.0) and for the calculation library. */
export function PrayerCredits({ labels }: { labels: { credit: string; cityCredit: string } }) {
  return (
    <footer className="mx-auto mt-10 max-w-2xl text-center text-xs leading-relaxed text-muted print:hidden">
      <p>{labels.credit}</p>
      <p className="mt-1">
        {labels.cityCredit}{" "}
        <a href="https://www.geonames.org" className="underline underline-offset-2 hover:text-accent" rel="noopener">
          geonames.org
        </a>
      </p>
    </footer>
  );
}
