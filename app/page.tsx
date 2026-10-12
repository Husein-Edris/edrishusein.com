// app/page.tsx
import type { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import SectionRenderer from '@/src/components/SectionRenderer/SectionRenderer';
import Footer from '@/src/components/Footer/Footer';
import { DataFetcher } from '@/src/lib/data-fetcher';
import { SectionFactory } from '@/src/lib/section-registry';
import { generateHomepageStructuredData, safeJsonLd } from '@/src/lib/seo-utils';

// ISR: serve a cached homepage render and refresh it at most once per window
// (see CMS_REVALIDATE in src/lib/client.ts) instead of re-fetching WordPress on
// every visit. This is the main fix for the slow loading screen.
export const revalidate = 60;

// Self-canonical for the homepage; the root layout deliberately sets no global
// canonical (it would leak "/" onto pages that don't override alternates).
export const metadata: Metadata = {
  alternates: { canonical: '/' },
};

export default async function HomePage() {
  // No try/catch: a transient CMS failure must reject this render so ISR keeps
  // serving the last good homepage (DataFetcher rethrows those). The old catch
  // swapped in a hero-only page, which ISR then cached.
  const { homepage, projects, posts } = await DataFetcher.getHomepageBundle();
  const sections = SectionFactory.createHomepageSections(homepage.data, projects.data, posts.data);

  return (
    <>
      <Header />
      {/* Header/Footer are siblings of <main> (as on every other page), so the
          mobile menu can mark <main> inert while open without disabling itself. */}
      <main id="main-content" tabIndex={-1}>
        <SectionRenderer sections={sections} />
      </main>
      <Footer />

      {/* Structured data: Person + WebSite entity for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(generateHomepageStructuredData()),
        }}
      />
    </>
  );
}