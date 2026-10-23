import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import DocumentLang from '@/src/components/DocumentLang/DocumentLang';
import { cmsRest, isTransientCmsError } from '@/src/lib/rest-client';
import { pageOpenGraph, safeJsonLd } from '@/src/lib/seo-utils';
import {
  GERMAN_LANDING_PATH,
  GERMAN_LANDING_SLUG,
  LANGUAGE_ALTERNATES,
  germanLandingStructuredData,
  toGermanLanding,
  type RestPage,
} from '@/src/lib/german-landing';
import '@/src/components/LegalPage/LegalPage.scss';
import './GermanLanding.scss';

// ISR: cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

const META_TITLE = 'WordPress-Entwickler in Vorarlberg | Edris Husein, Dornbirn';
const META_DESCRIPTION =
  'Webentwickler in Dornbirn: Ich erstelle WordPress-Websites in Vorarlberg, übernehme Wartung und Updates in ganz Österreich und repariere bestehende Seiten.';

export const metadata: Metadata = {
  title: META_TITLE,
  description: META_DESCRIPTION,
  alternates: { canonical: GERMAN_LANDING_PATH, languages: { ...LANGUAGE_ALTERNATES } },
  openGraph: {
    ...pageOpenGraph({ title: META_TITLE, description: META_DESCRIPTION, path: GERMAN_LANDING_PATH }),
    locale: 'de_AT',
    alternateLocale: ['en_US'],
  },
};

// Same failure contract as the legal pages: a transient CMS error throws so ISR
// keeps the last good page; a missing or empty CMS page is a real 404.
async function getGermanLanding() {
  let pages: RestPage[];
  try {
    pages = await cmsRest<RestPage[]>(`/pages?slug=${GERMAN_LANDING_SLUG}`);
  } catch (error: unknown) {
    if (isTransientCmsError(error)) throw error;
    notFound();
  }
  const page = Array.isArray(pages) && pages.length > 0 ? toGermanLanding(pages[0]) : null;
  if (!page) notFound();
  return page;
}

export default async function GermanLandingPage() {
  const page = await getGermanLanding();

  return (
    <>
      <DocumentLang lang="de" />
      <Header />
      <main id="main-content" tabIndex={-1} className="legal-page de-landing" lang="de">
        <section className="legal-hero de-landing__hero">
          <div className="container">
            <div className="legal-hero-content">
              <p className="de-landing__eyebrow">Edris Husein, Dornbirn</p>
              <h1 className="legal-title de-landing__title">{page.title}</h1>
              <div className="de-landing__actions">
                <a href="mailto:kontakt@edrishusein.com" className="de-landing__cta de-landing__cta--primary">
                  E-Mail schreiben
                </a>
                <Link href="/projects" className="de-landing__cta de-landing__cta--secondary">
                  Projekte ansehen
                </Link>
              </div>
            </div>
          </div>
        </section>

        <section className="legal-content">
          <div className="container">
            <div className="content-wrapper">
              <article className="legal-article" dangerouslySetInnerHTML={{ __html: page.content }} />
            </div>
          </div>
        </section>
      </main>
      <Footer />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(germanLandingStructuredData({ title: page.title, description: META_DESCRIPTION })),
        }}
      />
    </>
  );
}
