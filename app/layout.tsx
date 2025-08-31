import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Edris Husein",
  description: "Full-stack developer and digital creative specializing in modern web applications, UI/UX design, and WordPress development.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <head>
        <link
          rel="preload"
          href="/fonts/Syncopate-Regular.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Syncopate-Bold.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
        <link
          rel="preload"
          href="/fonts/Inter-VariableFont_opsz,wght.ttf"
          as="font"
          type="font/ttf"
          crossOrigin="anonymous"
        />
      </head>
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}