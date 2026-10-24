import { Metadata } from 'next';
import NotFoundView from '@/src/components/NotFound/NotFoundView';
import { getSiteContentOrDefaults } from '@/src/lib/site-content';
import { DICTIONARY } from '@/src/lib/i18n/dictionary';

export const metadata: Metadata = {
  title: DICTIONARY.en.notFoundMeta.title,
  description: DICTIONARY.en.notFoundMeta.description,
  robots: 'noindex, nofollow',
};

// Text from Site Content > Global, in both languages (see NotFoundView). Never
// throws: a CMS error must not turn the 404 page itself into an error page
// (see getSiteContentOrDefaults).
export default async function NotFound() {
  const [en, de] = await Promise.all([getSiteContentOrDefaults('en'), getSiteContentOrDefaults('de')]);
  return <NotFoundView copy={{ en: en.notFound, de: de.notFound }} />;
}
