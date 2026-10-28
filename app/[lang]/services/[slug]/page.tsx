// app/[lang]/services/[slug]/page.tsx: /services/<slug> and /de/services/<slug_de>
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { getSiteContent } from '@/src/lib/site-content';
import { loadServicePage, serviceMetadata, serviceStaticParams } from '@/src/lib/service-page';
import { getServiceRelations, type ServiceLink } from '@/src/lib/services';
import { generateServicePageStructuredData, safeJsonLd } from '@/src/lib/seo-utils';
import { localePath } from '@/src/lib/i18n/paths';
import { isLang } from '@/src/lib/i18n/lang';
import { langFromParams } from '@/src/lib/i18n/route';
import '@/src/styles/pages/CaseStudy.scss';
import '@/src/styles/pages/Services.scss';

type ServiceParams = { params: Promise<{ lang: string; slug: string }> };

// Called once per language by the [lang] segment: each service under the slug
// of that language. Unlike /projects/[slug], a CMS outage is not swallowed here:
// it fails the build (safe, deploy.sh builds before it stops the server) instead
// of shipping a build that silently has no service pages. No service post type
// or no entries yet: nothing is prerendered.
export async function generateStaticParams({ params }: { params: { lang: string } }) {
  return isLang(params.lang) ? serviceStaticParams(params.lang) : [];
}

export async function generateMetadata({ params }: ServiceParams): Promise<Metadata> {
  const { slug } = await params;
  const lang = await langFromParams(params);
  const result = await loadServicePage(lang, slug);
  // A 404 renders no page of its own, so it gets no canonical.
  return result.kind === 'page' ? serviceMetadata(result.service, lang) : {};
}

function RelatedLinks({ heading, links }: { heading: string; links: ServiceLink[] }) {
  if (links.length === 0) return null;
  return (
    <section className="service-section">
      <h2>{heading}</h2>
      <ul className="service-links">
        {links.map((link) => (
          <li key={link.id}>
            <Link href={link.path}>{link.title}</Link>
            {link.excerpt && <p>{link.excerpt}</p>}
          </li>
        ))}
      </ul>
    </section>
  );
}

export default async function ServicePage({ params }: ServiceParams) {
  const { slug } = await params;
  const lang = await langFromParams(params);

  // Transient CMS errors propagate out of every fetch below, so a build fails and
  // ISR keeps the last good render. A slug that is not this language's is a 404;
  // the proxy 308s the other language's slug before it gets here, so this ISR
  // route never caches a redirect.
  const [result, siteContent] = await Promise.all([loadServicePage(lang, slug), getSiteContent(lang)]);
  if (result.kind === 'not-found') notFound();

  const { service } = result;
  const relations = await getServiceRelations(service, lang);
  const template = siteContent.serviceTemplate;

  const structuredData = generateServicePageStructuredData(service, lang, {
    home: siteContent.chrome.breadcrumbHome,
    services: siteContent.nav.services,
  });

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="case-study service-page">
        <div className="hero-section hero-section--left">
          <div className="container">
            {service.eyebrow && <p className="service-page__eyebrow">{service.eyebrow}</p>}
            <h1 className="title">{service.headline}</h1>
            {service.introHtml && (
              <div className="overview" dangerouslySetInnerHTML={{ __html: service.introHtml }} />
            )}
          </div>
        </div>

        <div className="container service-page__body">
          {service.sections.map((section, index) => (
            <section key={`${section.heading}-${index}`} className="service-section">
              {section.heading && <h2>{section.heading}</h2>}
              {section.bodyHtml && (
                <div className="content" dangerouslySetInnerHTML={{ __html: section.bodyHtml }} />
              )}
            </section>
          ))}

          <RelatedLinks heading={template.projectsHeading} links={relations.projects} />

          {/* Rendered open, never collapsed: the FAQPage JSON-LD describes it. */}
          {service.faq.length > 0 && (
            <section className="service-section service-faq">
              <h2>{template.faqHeading}</h2>
              {service.faq.map((entry, index) => (
                <div key={`${entry.question}-${index}`}>
                  <h3>{entry.question}</h3>
                  <div className="content" dangerouslySetInnerHTML={{ __html: entry.answerHtml }} />
                </div>
              ))}
            </section>
          )}

          <RelatedLinks heading={template.postsHeading} links={relations.posts} />

          <section className="service-section service-cta">
            {service.cta.heading && <h2>{service.cta.heading}</h2>}
            {service.cta.text && <p>{service.cta.text}</p>}
            <Link href={localePath('/contact', lang)} className="service-cta__button">
              {service.cta.label || siteContent.contactPage.heading}
            </Link>
          </section>
        </div>
      </main>
      <Footer lang={lang} />

      {/* One @graph: Service, FAQPage (when the FAQ renders) and BreadcrumbList. */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }} />
    </>
  );
}

// ISR: cached render refreshed at most once per 60s. Next requires this segment
// export to be a static literal (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;
