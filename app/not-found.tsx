import Link from 'next/link';
import { Metadata } from 'next';
import { getSiteContentOrDefaults } from '@/src/lib/site-content';

export const metadata: Metadata = {
  title: 'Page Not Found - Edris Husein',
  description: 'The page you are looking for could not be found.',
  robots: 'noindex, nofollow',
};

// Text from Site Content > Global. Never throws: a CMS error must not turn the
// 404 page itself into an error page (see getSiteContentOrDefaults).
export default async function NotFound() {
  const copy = (await getSiteContentOrDefaults()).notFound;
  return (
    <div className="not-found-page">
      <div className="container">
        <h2>{copy.heading}</h2>
        <p>{copy.text}</p>
        <Link href="/">{copy.homeLinkLabel}</Link>
      </div>
    </div>
  );
}