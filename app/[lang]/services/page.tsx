// app/[lang]/services/page.tsx: /services and /de/services, the hub of the service pages
import type { CSSProperties } from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import Image from 'next/image';
import Link from 'next/link';
import HeroScene from '@/src/components/HeroScene/HeroScene';
import ServiceIcon from '@/src/components/Service/ServiceIcon';
import ScrollStory from '@/src/components/Service/ScrollStory';
import { getSiteContent } from '@/src/lib/site-content';
import { loadServicesIndex } from '@/src/lib/service-page';
import { getServiceRelations, hasScreenshot, servicePath } from '@/src/lib/services';
import {
  generateBreadcrumbStructuredData,
  generateCollectionPageStructuredData,
  pageOpenGraph,
  safeJsonLd,
} from '@/src/lib/seo-utils';
import { absoluteUrl, alternatesFor, localePath } from '@/src/lib/i18n/paths';
import { langFromParams, type LangParams } from '@/src/lib/i18n/route';
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
  // Each row shows the first related case study that has a screenshot. Posts
  // are left out, so this is one project request per service.
  const leadProjects = await Promise.all(
    services.map(async (service) => {
      const { projects } = await getServiceRelations({ ...service, relatedPostIds: [] }, lang);
      return projects.find(hasScreenshot) ?? null;
    }),
  );
  const cards = services.map((service, index) => ({
    title: service.title,
    description: service.excerpt,
    link: servicePath(service, lang),
    icon: service.icon,
    project: leadProjects[index],
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
      <main id="main-content" tabIndex={-1} className="service-index-page">
        <section className="service-hero service-hero--index">
          <HeroScene />
          <div className="service-wrap">
            <h1 className="service-index__title">{page.title}</h1>
            <p className="service-index__subtitle">{page.subtitle}</p>
          </div>
        </section>
        <section className="service-block service-index">
          <ul className="service-wrap service-index__list">
            {cards.map((card, index) => (
              <li key={card.link} className="service-row" data-reveal="draw" style={{ '--i': index } as CSSProperties}>
                <Link href={card.link} className="service-row__link">
                  <ServiceIcon name={card.icon} className="service-row__icon" />
                  <div className="service-row__body">
                    <h2 className="service-row__title">{card.title}</h2>
                    {card.description && (
                      <div className="service-row__excerpt" dangerouslySetInnerHTML={{ __html: card.description }} />
                    )}
                  </div>
                  {card.project?.image ? (
                    <span className="service-row__proof">
                      <span className="service-row__shot" aria-hidden="true">
                        <Image src={card.project.image.url} alt="" fill sizes="(max-width: 768px) 100vw, 320px" />
                      </span>
                      <span className="service-row__project">{card.project.title}</span>
                    </span>
                  ) : (
                    <span className="service-row__proof" aria-hidden="true" />
                  )}
                  <svg className="service-row__arrow" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                    <path d="M4 12h15M13 6l6 6-6 6" />
                  </svg>
                </Link>
              </li>
            ))}
          </ul>
        </section>
        <ScrollStory root=".service-index-page" />
      </main>
      <Footer lang={lang} />
    </>
  );
}
