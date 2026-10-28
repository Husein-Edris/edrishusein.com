// app/[lang]/services/page.tsx: /services and /de/services, the hub of the service pages
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import { getSiteContent } from '@/src/lib/site-content';
import { loadServicesIndex } from '@/src/lib/service-page';
import { servicePath } from '@/src/lib/services';
import {
  generateBreadcrumbStructuredData,
  generateCollectionPageStructuredData,
  pageOpenGraph,
  safeJsonLd,
} from '@/src/lib/seo-utils';
import { absoluteUrl, alternatesFor, localePath } from '@/src/lib/i18n/paths';
import { langFromParams, type LangParams } from '@/src/lib/i18n/route';
import '@/src/styles/pages/Projects.scss';
import '@/src/styles/pages/Services.scss';

// ISR: cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langFromParams(params);
  // No canonical or hreflang for an index the page is about to 404.
  if (!(await loadServicesIndex(lang))) return {};

  const { meta } = await getSiteContent(lang);
  return {
    title: meta.servicesTitle,
    description: meta.servicesDescription,
    alternates: alternatesFor('/services', lang),
    openGraph: pageOpenGraph({ title: meta.servicesTitle, description: meta.servicesDescription, path: '/services', lang }),
  };
}

export default async function ServicesPage({ params }: LangParams) {
  const lang = await langFromParams(params);
  // A transient CMS failure throws out of the loader, so ISR keeps the last good
  // render. Zero services (true until the service CPT has entries) is a 404,
  // never an empty listing that could be indexed.
  const [services, siteContent] = await Promise.all([loadServicesIndex(lang), getSiteContent(lang)]);
  if (!services) notFound();

  const page = siteContent.servicesPage;
  const cards = services.map((service) => ({
    title: service.title,
    description: service.excerpt,
    link: servicePath(service, lang),
  }));

  const collectionJsonLd = generateCollectionPageStructuredData({
    name: siteContent.nav.services,
    description: siteContent.meta.servicesDescription,
    path: localePath('/services', lang),
    lang,
    items: cards.map((card) => ({ title: card.title, path: card.link })),
  });
  const breadcrumbJsonLd = generateBreadcrumbStructuredData([
    { text: siteContent.chrome.breadcrumbHome, url: absoluteUrl('/', lang) },
    { text: siteContent.nav.services, url: absoluteUrl('/services', lang) },
  ]);

  return (
    <>
      {/* safeJsonLd escapes <, >, &, U+2028/9 so CMS-sourced titles can never
          break out of the script tag (XSS guard). */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }} />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <div className="projects-hero">
          <div className="projects-hero__inner">
            <div>
              <h1 className="title">{page.title}</h1>
              <p className="services-hero__subtitle">{page.subtitle}</p>
            </div>
          </div>
        </div>
        <InfoCards
          skin="default"
          variant="dark"
          className="projects-archive-grid"
          columns={3}
          cards={cards}
          lang={lang}
        />
      </main>
      <Footer lang={lang} />
    </>
  );
}
