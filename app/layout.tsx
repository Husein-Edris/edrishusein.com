import type { Metadata } from "next";
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
      </head>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}