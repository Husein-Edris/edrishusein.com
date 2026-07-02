import type { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import Contact from '@/src/components/Contact/Contact';

export const metadata: Metadata = {
  title: 'Contact - Edris Husein',
  description: 'Get in touch with Edris Husein, full-stack developer. Reach out about projects, collaborations, or opportunities.',
  alternates: { canonical: '/contact' },
};

export default function ContactPage() {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <h1 className="sr-only">Contact</h1>
        <Contact intro="Open to freelance projects, collaborations, or just a chat about web development. I usually reply within a day." />
      </main>
      <Footer />
    </>
  );
}