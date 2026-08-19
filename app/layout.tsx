import type { Metadata } from "next";
import { Inter, Syncopate } from "next/font/google";
import CookieBanner from "@/src/components/CookieBanner/CookieBanner";
import Analytics from "@/src/components/Analytics/Analytics";
import "./globals.css";

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

export const metadata: Metadata = {
  metadataBase: new URL("https://edrishusein.com"),
  // No global canonical here: it would leak "/" onto every page that does not
  // override alternates. Each page declares its own self-canonical instead.
  title: "Edris Husein - Full-Stack Web Developer, Austria",
  description: "Edris Husein is a full-stack web developer in Dornbirn, Austria, building fast websites and web apps with Next.js, React, TypeScript and WordPress.",
  keywords: "Edris Husein, full-stack developer, web developer Austria, React, Next.js, WordPress, TypeScript",
  robots: "index, follow",
  openGraph: {
    title: "Edris Husein - Full-Stack Web Developer, Austria",
    description: "Full-stack web developer in Austria building fast websites and web apps with Next.js, React and WordPress.",
    url: "/",
    type: "website",
    locale: "en_US",
    // Default share image so links to any page without its own image (homepage,
    // about, tech-stack, etc.) render a preview card instead of a bare text link.
    images: [
      {
        url: "/images/Edris-Husein-Hero.png",
        width: 450,
        height: 450,
        alt: "Edris Husein - Full-Stack Web Developer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Edris Husein - Full-Stack Web Developer, Austria",
    description: "Full-stack web developer in Austria building fast websites and web apps with Next.js, React and WordPress.",
    images: ["/images/Edris-Husein-Hero.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} ${syncopate.variable}`} suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://cms.edrishusein.com" />
        <link rel="dns-prefetch" href="https://cms.edrishusein.com" />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        {/* No hardcoded <meta name="description"> here. It emitted before Next's
            metadata API output and shadowed every page's own description, so all
            27 URLs advertised the same generic text. The description now comes
            solely from `metadata.description` above (inherited by the homepage)
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
        
        {/* Recent updates: Footer layout, cookie settings, case-study spacing */}
      </head>
      <body suppressHydrationWarning={true}>
        <a href="#main-content" className="skip-link">Skip to main content</a>
        {children}
        <CookieBanner />
        <Analytics />
      </body>
    </html>
  );
}