import type { Metadata } from "next";
import CookieBanner from "@/src/components/CookieBanner/CookieBanner";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edris Husein - Full-stack Developer",
  description: "Full-stack developer and digital creative specializing in modern web applications, UI/UX design, and WordPress development.",
  keywords: "Full-stack developer, React, Next.js, WordPress, UI/UX design, web development",
  robots: "index, follow",
  openGraph: {
    title: "Edris Husein - Full-stack Developer",
    description: "Full-stack developer specializing in modern web applications and UI/UX design.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Edris Husein - Full-stack Developer",
    description: "Full-stack developer specializing in modern web applications and UI/UX design.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning={true}>
      <head>
        <link rel="preconnect" href="https://cms.edrishusein.com" />
        <link rel="dns-prefetch" href="https://cms.edrishusein.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:ital,opsz,wght@0,14..32,100..900;1,14..32,100..900&family=Syncopate:wght@400;700&display=swap"
          rel="stylesheet"
        />
        <meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover" />
        <meta name="theme-color" content="#ffffff" />
        <meta name="description" content="Full-stack developer and digital creative specializing in modern web applications, UI/UX design, and WordPress development." />
        
        {/* Tech Stack Showcase - Headless Architecture */}
        <meta name="generator" content="WordPress (Headless CMS), Next.js 15, React 19" />
        <meta name="framework" content="Next.js" />
        <meta name="cms" content="WordPress" />
        <meta name="architecture" content="Headless" />
        <meta name="frontend" content="React, Next.js, TypeScript, SCSS" />
        <meta name="backend" content="WordPress, GraphQL, WPGraphQL" />
        <meta name="deployment" content="PM2, Node.js" />
        
        {/* WordPress Headless CMS Indicators */}
        <link rel="alternate" type="application/json" href="https://cms.edrishusein.com/wp-json/" />
        <link rel="https://api.w.org/" href="https://cms.edrishusein.com/wp-json/" />
        
        {/* Recent updates: Footer layout, cookie settings, case-study spacing */}
      </head>
      <body suppressHydrationWarning={true}>
        {children}
        <CookieBanner />
      </body>
    </html>
  );
}