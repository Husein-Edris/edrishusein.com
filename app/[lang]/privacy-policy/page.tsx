import { Metadata } from 'next';
import LegalPage, { getLegalPageData, generateLegalMetadata } from '@/src/components/LegalPage/LegalPage';
import { getSiteContentOrDefaults } from '@/src/lib/site-content';
import { langFromParams, type LangParams } from '@/src/lib/i18n/route';

// ISR: cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

// Generate metadata for the privacy policy page
export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langFromParams(params);
  const data = await getLegalPageData('privacy-policy', 'privacy', lang);
  return generateLegalMetadata(data, '/privacy-policy', lang);
}

// Privacy Policy page component
export default async function PrivacyPolicyPage({ params }: LangParams) {
  const lang = await langFromParams(params);
  const [data, { footer }] = await Promise.all([getLegalPageData('privacy-policy', 'privacy', lang), getSiteContentOrDefaults(lang)]);
  const page = data.page;

  return (
    <LegalPage
      title={page.title}
      content={page.content}
      lastUpdated={page.modified}
      lang={lang}
      breadcrumb={footer.privacyPolicyLabel}
    />
  );
}