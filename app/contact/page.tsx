import type { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import Contact from '@/src/components/Contact/Contact';
import { getSiteContent } from '@/src/lib/site-content';
import { generateContactPageStructuredData, pageOpenGraph, safeJsonLd } from '@/src/lib/seo-utils';

export const metadata: Metadata = {
  title: 'Contact Edris Husein - Hire a Full-Stack Web Developer',
  description: 'Contact Edris Husein to hire a freelance full-stack web developer in Austria for WordPress, headless CMS and Next.js projects. Replies within a day.',
  alternates: { canonical: '/contact' },
  openGraph: pageOpenGraph({
    title: 'Contact Edris Husein - Hire a Full-Stack Web Developer',
    description: 'Contact Edris Husein to hire a freelance full-stack web developer in Austria for WordPress, headless CMS and Next.js projects. Replies within a day.',
    path: '/contact',
  }),
};

// ISR: cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

export default async function ContactPage() {
  // Visible copy: CMS "Site Content" options page, Contact page tab.
  const { contactPage } = await getSiteContent();
  const contactJsonLd = generateContactPageStructuredData(
    'Contact Edris Husein to hire a freelance full-stack web developer in Austria for WordPress, headless CMS and Next.js projects.'
  );

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(contactJsonLd) }}
      />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <h1 className="sr-only">Contact Edris Husein</h1>
        <Contact
          data={{ subTitle: contactPage.subtitle, title: contactPage.heading, email: contactPage.email }}
          intro={contactPage.intro}
        />
      </main>
      <Footer />
    </>
  );
}