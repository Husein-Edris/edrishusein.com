import type { Metadata } from "next";
import { Inter, Syncopate } from "next/font/google";
import CookieBanner from "@/src/components/CookieBanner/CookieBanner";
import Analytics from "@/src/components/Analytics/Analytics";
import LangProvider from "@/src/components/LangProvider/LangProvider";
import { getSiteContentOrDefaults } from "@/src/lib/site-content";
import { dictionary } from "@/src/lib/i18n/dictionary";
import { OG_LOCALE, otherLang } from "@/src/lib/i18n/lang";
import { localePath } from "@/src/lib/i18n/paths";
import { langFromParams, langStaticParams, type LangParams } from "@/src/lib/i18n/route";
import "../globals.css";

// Self-hosted at build time (next/font) so there is no render-blocking request to
// fonts.googleapis.com. Exposed as CSS variables consumed in src/styles/variables.scss.
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});
const syncopate = Syncopate({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-syncopate",
});

// Root layout of both languages: English pages are served at unprefixed URLs
// (proxy.ts rewrites them to /en/...), German pages at /de/.... Rendering <html
// lang> here puts the right language in the server HTML, not only after hydration.
export const generateStaticParams = langStaticParams;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langFromParams(params);
  const { meta } = await getSiteContentOrDefaults(lang);
  const text = dictionary(lang);

  return {
    metadataBase: new URL("https://edrishusein.com"),
    // No global canonical here: it would leak "/" onto every page that does not
    // override alternates. Each page declares its own self-canonical instead.
    title: meta.homeTitle,
    description: meta.homeDescription,
    keywords: text.keywords,
    robots: "index, follow",
    openGraph: {
      title: meta.homeTitle,
      description: text.homeOgDescription,
      url: localePath("/", lang),
      type: "website",
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[otherLang(lang)]],
      // Default share image so links to any page without its own image (homepage,
      // about, tech-stack, etc.) render a preview card instead of a bare text link.
      images: [
        {
          url: "/images/Edris-Husein-Hero.png",
          width: 450,
          height: 450,
          alt: text.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: meta.homeTitle,
      description: text.homeOgDescription,
      images: ["/images/Edris-Husein-Hero.png"],
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
} & LangParams) {
  const lang = await langFromParams(params);
  // Cookie banner, skip link and navigation labels (Site Content). The banner
  // and header are client components, so the text is fetched here and passed
  // down. This uses the never-throwing variant on purpose: the layout wraps
  // every route, so a rethrown transient CMS error would break every page (and
  // every route of a build) for a few labels. On error the code defaults show.
  // The fetch is ISR-cached (revalidate 60) and deduped with page-level calls.
  const siteContent = await getSiteContentOrDefaults(lang);

  return (
    <html lang={lang} className={`${inter.variable} ${syncopate.variable}`} suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://cms.edrishusein.com" />
        <link rel="dns-prefetch" href="https://cms.edrishusein.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        {/* No hardcoded <meta name="description"> here. It emitted before Next's
            metadata API output and shadowed every page's own description, so all
            27 URLs advertised the same generic text. The description now comes
            solely from `generateMetadata` above (inherited by the homepage)
            and each page's own `generateMetadata`. */}

        {/* Tech Stack Showcase - Headless Architecture (kept accurate post REST migration) */}
        <meta name="generator" content="WordPress (Headless CMS), Next.js 16, React 19" />
        <meta name="framework" content="Next.js" />
        <meta name="cms" content="WordPress" />
        <meta name="architecture" content="Headless" />
        <meta name="frontend" content="React, Next.js, TypeScript, SCSS" />
        <meta name="backend" content="WordPress REST API, Advanced Custom Fields Pro" />
        <meta name="deployment" content="Node.js standalone server" />
        
        {/* WordPress Headless CMS Indicators */}
        <link rel="alternate" type="application/json" href="https://cms.edrishusein.com/wp-json/" />
        <link rel="https://api.w.org/" href="https://cms.edrishusein.com/wp-json/" />
      </head>
      <body suppressHydrationWarning={true}>
        <LangProvider lang={lang} nav={siteContent.nav}>
          <a href="#main-content" className="skip-link">{siteContent.chrome.skipToContent}</a>
          {children}
          <CookieBanner copy={siteContent.cookieBanner} />
        </LangProvider>
        <Analytics />
      </body>
    </html>
  );
}
