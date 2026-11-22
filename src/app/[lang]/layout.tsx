import type { Metadata, Viewport } from "next";
import {
  Amiri,
  Amiri_Quran,
  Cormorant_Garamond,
  Gulzar,
  IBM_Plex_Sans_Arabic,
  Manrope,
  Noto_Nastaliq_Urdu,
} from "next/font/google";
import { notFound } from "next/navigation";
import "../globals.css";
import { SiteFooter } from "@/components/site-footer";
import { SiteHeader } from "@/components/site-header";
import { isLocale, localeDir, locales } from "@/i18n/config";
import { getDictionary } from "@/i18n/get-dictionary";

// English: Manrope (UI) + Cormorant Garamond (headings).
const manrope = Manrope({ subsets: ["latin"], variable: "--font-manrope", display: "swap" });
const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-cormorant",
  display: "swap",
});
// Arabic: IBM Plex Sans Arabic (UI) + Amiri (headings). Urdu: Noto Nastaliq Urdu (UI) + Gulzar (headings).
// Arabic-script fonts are only needed on ar/ur pages, so they are not preloaded everywhere.
const plexArabic = IBM_Plex_Sans_Arabic({
  subsets: ["arabic"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-plex-arabic",
  display: "swap",
  preload: false,
});
const amiri = Amiri({
  subsets: ["arabic"],
  weight: ["400", "700"],
  variable: "--font-amiri",
  display: "swap",
  preload: false,
});
const nastaliq = Noto_Nastaliq_Urdu({
  subsets: ["arabic"],
  variable: "--font-nastaliq",
  display: "swap",
  preload: false,
});
const gulzar = Gulzar({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-gulzar",
  display: "swap",
  preload: false,
});
// Quran text: Amiri Quran (full Uthmani mark support).
const amiriQuran = Amiri_Quran({
  subsets: ["arabic"],
  weight: "400",
  variable: "--font-amiri-quran",
  display: "swap",
  preload: false,
});
const fontVariables = [manrope, cormorant, plexArabic, amiri, nastaliq, gulzar, amiriQuran].map((f) => f.variable).join(" ");

export async function generateStaticParams() {
  return locales.map((lang) => ({ lang }));
}

export async function generateMetadata(): Promise<Metadata> {
  const dict = await getDictionary();
  return {
    title: { default: dict.meta.title, template: `%s · ${dict.brand.name}` },
    description: dict.meta.description,
    applicationName: dict.brand.name,
    icons: {
      icon: [
        { url: "/brand/favicon-32.png", sizes: "32x32", type: "image/png" },
        { url: "/brand/logo-192.png", sizes: "192x192", type: "image/png" },
      ],
      apple: "/brand/apple-touch-icon.png",
    },
  };
}

export const viewport: Viewport = {
  themeColor: "#0a4444",
};

// Applies the saved (or system) theme before first paint, so there is no light/dark flash.
const themeScript = `(function(){try{var t=localStorage.getItem("theme");if(t!=="light"&&t!=="dark"){t=window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}document.documentElement.setAttribute("data-theme",t)}catch(e){}})()`;

export default async function RootLayout({ children, params }: LayoutProps<"/[lang]">) {
  const { lang } = await params;
  if (!isLocale(lang)) notFound();
  const dict = await getDictionary();

  return (
    <html
      lang={lang}
      dir={localeDir[lang]}
      data-theme="light"
      suppressHydrationWarning
      className={`${fontVariables} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeScript }} />
      </head>
      <body className="flex min-h-full flex-col">
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:absolute focus:inset-s-2 focus:top-2 focus:z-50 focus:rounded-lg focus:bg-gold-300 focus:px-4 focus:py-3 focus:text-brand-900"
        >
          {dict.a11y.skip}
        </a>
        <SiteHeader />
        <main id="main" className="flex flex-1 flex-col">
          {children}
        </main>
        <SiteFooter />
      </body>
    </html>
  );
}
