import type { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import Contact from '@/src/components/Contact/Contact';
import { getSiteContent } from '@/src/lib/site-content';
import { generateContactPageStructuredData, pageOpenGraph, safeJsonLd } from '@/src/lib/seo-utils';
import { alternatesFor } from '@/src/lib/i18n/paths';
import { dictionary } from '@/src/lib/i18n/dictionary';
import { langFromParams, type LangParams } from '@/src/lib/i18n/route';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langFromParams(params);
  const { meta } = await getSiteContent(lang);
  return {
    title: meta.contactTitle,
    description: meta.contactDescription,
    alternates: alternatesFor('/contact', lang),
    openGraph: pageOpenGraph({ title: meta.contactTitle, description: meta.contactDescription, path: '/contact', lang }),
  };
}

// ISR: cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

export default async function ContactPage({ params }: LangParams) {
  const lang = await langFromParams(params);
  // Visible copy: CMS "Site Content" options page, Contact page tab.
  const { contactPage, meta } = await getSiteContent(lang);
  const text = dictionary(lang);
  const contactJsonLd = generateContactPageStructuredData(meta.contactDescription, { lang, name: text.contactHeading });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(contactJsonLd) }}
      />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <h1 className="sr-only">{text.contactHeading}</h1>
        <Contact
          data={{ subTitle: contactPage.subtitle, title: contactPage.heading, email: contactPage.email }}
          intro={contactPage.intro}
          lang={lang}
        />
      </main>
      <Footer lang={lang} />
    </>
  );
}