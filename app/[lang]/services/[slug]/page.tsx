// app/[lang]/services/[slug]/page.tsx: /services/<slug> and /de/services/<slug_de>
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { getSiteContent } from '@/src/lib/site-content';
import { loadServicePage, serviceMetadata, serviceStaticParams } from '@/src/lib/service-page';
import { getServiceRelations, getServiceTestimonial, type ServiceLink } from '@/src/lib/services';
import { generateServicePageStructuredData, safeJsonLd } from '@/src/lib/seo-utils';
import { localePath } from '@/src/lib/i18n/paths';
import { isLang } from '@/src/lib/i18n/lang';
import { langFromParams } from '@/src/lib/i18n/route';
import type { Lang } from '@/src/lib/i18n/lang';
import ServiceHero from '@/src/components/Service/ServiceHero';
import ServiceDeliverables from '@/src/components/Service/ServiceDeliverables';
import ServiceWork from '@/src/components/Service/ServiceWork';
import ServiceProcess from '@/src/components/Service/ServiceProcess';
import ServiceTestimonial from '@/src/components/Service/ServiceTestimonial';
import ServiceFaq from '@/src/components/Service/ServiceFaq';
import ScrollStory from '@/src/components/Service/ScrollStory';
import ServiceContact from '@/src/components/Service/ServiceContact';
import { directContactLinks } from '@/src/lib/contact-links';
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

interface FurtherReadingProps {
  heading: string;
  links: ServiceLink[];
  lang: Lang;
  /** Notebook labels for an article in the other language, e.g. DE. */
  languageLabels: { de: string; en: string };
}

function FurtherReading({ heading, links, lang, languageLabels }: FurtherReadingProps) {
  if (links.length === 0) return null;
  return (
    <section className="service-block service-reading" aria-labelledby="service-reading-heading">
      <div className="service-wrap service-split">
        <h2 id="service-reading-heading" className="service-heading service-heading--small">
          {heading}
        </h2>
        <ul className="service-reading__list">
          {links.map((link) => {
            const other = link.language !== lang;
            return (
              <li key={link.id}>
                <Link href={link.path} className="service-reading__link">
                  <span className="service-reading__title" lang={other ? link.language : undefined}>
                    {link.title}
                    {other && <span className="service-reading__lang">{languageLabels[link.language]}</span>}
                  </span>
                  {link.excerpt && (
                    <span className="service-reading__excerpt" lang={other ? link.language : undefined}>
                      {link.excerpt}
                    </span>
                  )}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
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
  const [relations, testimonial] = await Promise.all([
    getServiceRelations(service, lang),
    getServiceTestimonial(service),
  ]);
  const template = siteContent.serviceTemplate;
  const contact = (
    <ServiceContact
      links={directContactLinks({
        email: siteContent.contactPage.email,
        whatsapp: siteContent.contactPage.whatsapp,
        subject: service.title,
        message: service.contactMessage,
      })}
      emailLabel={template.emailLabel}
      whatsappLabel={template.whatsappLabel}
      fallbackHref={localePath('/contact', lang)}
      fallbackLabel={service.cta.label || siteContent.contactPage.heading}
    />
  );

  const structuredData = generateServicePageStructuredData(service, lang, {
    home: siteContent.chrome.breadcrumbHome,
    services: siteContent.nav.services,
  });

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="service-page">
        <ServiceHero
          headline={service.headline}
          introHtml={service.introHtml}
          contact={contact}
          note={service.heroNote}
          portraitCaption={template.portraitCaption}
        />
        <ServiceDeliverables heading={template.deliverablesHeading} items={service.deliverables} />
        <ServiceWork heading={template.projectsHeading} projects={relations.projects} />
        <ServiceProcess heading={template.processHeading} steps={service.process} />
        <ServiceTestimonial testimonial={testimonial} />

        {service.sections.length > 0 && (
          <section className="service-block service-notes">
            <div className={`service-wrap service-notes__grid service-notes__grid--${Math.min(service.sections.length, 2)}`}>
              {service.sections.map((section, index) => (
                <div key={`${section.heading}-${index}`} className="service-notes__item">
                  {section.heading && <h2 className="service-heading service-heading--small">{section.heading}</h2>}
                  {section.bodyHtml && (
                    <div className="service-prose" dangerouslySetInnerHTML={{ __html: section.bodyHtml }} />
                  )}
                </div>
              ))}
            </div>
          </section>
        )}

        <ServiceFaq heading={template.faqHeading} entries={service.faq} />
        <FurtherReading
          heading={template.postsHeading}
          links={relations.posts}
          lang={lang}
          languageLabels={{ de: siteContent.notebookPage.languageDeLabel, en: siteContent.notebookPage.languageEnLabel }}
        />

        <section className="service-block service-cta">
          <div className="service-wrap service-cta__inner">
            {service.cta.heading && <h2 className="service-cta__heading">{service.cta.heading}</h2>}
            {service.cta.text && <p className="service-cta__text">{service.cta.text}</p>}
            {contact}
          </div>
        </section>
        <ScrollStory root=".service-page" />
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
