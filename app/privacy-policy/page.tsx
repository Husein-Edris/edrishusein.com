import { Metadata } from 'next';
import LegalPage, { getLegalPageData, generateLegalMetadata } from '@/src/components/LegalPage/LegalPage';

// ISR: cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

// Generate metadata for the privacy policy page
export async function generateMetadata(): Promise<Metadata> {
  const data = await getLegalPageData('privacy-policy', 'privacy');
  return generateLegalMetadata(data, '/privacy-policy');
}

// Privacy Policy page component
export default async function PrivacyPolicyPage() {
  const data = await getLegalPageData('privacy-policy', 'privacy');
  const page = data.page;

  return (
    <LegalPage
      title={page.title}
      content={page.content}
      lastUpdated={page.modified}
      breadcrumb="Privacy Policy"
    />
  );
}