// app/[lang]/page.tsx: the homepage, / in English and /de in German
import type { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import SectionRenderer from '@/src/components/SectionRenderer/SectionRenderer';
import Footer from '@/src/components/Footer/Footer';
import { DataFetcher } from '@/src/lib/data-fetcher';
import { SectionFactory } from '@/src/lib/section-registry';
import { getServices } from '@/src/lib/services';
import { generateHomepageStructuredData, safeJsonLd } from '@/src/lib/seo-utils';
import { alternatesFor } from '@/src/lib/i18n/paths';
import { langFromParams, type LangParams } from '@/src/lib/i18n/route';

// ISR: serve a cached homepage render and refresh it at most once per window
// (see CMS_REVALIDATE in src/lib/client.ts) instead of re-fetching WordPress on
// every visit. This is the main fix for the slow loading screen.
export const revalidate = 60;

// Self-canonical plus the hreflang pair (/ and /de). Title and description come
// from the root layout (Site Content > meta_home_title / meta_home_description).
export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langFromParams(params);
  return { alternates: alternatesFor('/', lang) };
}

export default async function HomePage({ params }: LangParams) {
  const lang = await langFromParams(params);
  // No try/catch: a transient CMS failure must reject this render so ISR keeps
  // serving the last good homepage (DataFetcher rethrows those). The old catch
  // swapped in a hero-only page, which ISR then cached.
  // getServices rethrows the same way; no services renders no services section.
  const [{ homepage, projects, posts }, services] = await Promise.all([
    DataFetcher.getHomepageBundle(lang),
    getServices(lang),
  ]);
  const sections = SectionFactory.createHomepageSections(homepage.data, projects.data, posts.data, lang, services);

  return (
    <>
      <Header />
      {/* Header/Footer are siblings of <main> (as on every other page), so the
          mobile menu can mark <main> inert while open without disabling itself. */}
      <main id="main-content" tabIndex={-1}>
        <SectionRenderer sections={sections} />
      </main>
      <Footer lang={lang} />

      {/* Structured data: Person, ProfessionalService and WebSite entities for search engines */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(generateHomepageStructuredData(lang)),
        }}
      />
    </>
  );
}
