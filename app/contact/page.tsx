import type { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import Contact from '@/src/components/Contact/Contact';
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

export default function ContactPage() {
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
        <Contact intro="Open to freelance projects, collaborations, or just a chat about web development. I build WordPress sites, headless setups, and React or Next.js applications, mostly for agencies and small teams in Austria and Germany, though remote work anywhere is fine. If you are writing about a project, a rough scope and timeline helps me give you a useful answer instead of a vague one. I usually reply within a day." />
      </main>
      <Footer />
    </>
  );
}