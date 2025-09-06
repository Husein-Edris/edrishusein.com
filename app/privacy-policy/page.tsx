import { Metadata } from 'next';
import LegalPage, { getLegalPageData, generateLegalMetadata } from '@/src/components/LegalPage/LegalPage';

// Force dynamic rendering for fresh content
export const dynamic = 'force-dynamic';

// Generate metadata for the privacy policy page
export async function generateMetadata(): Promise<Metadata> {
  const data = await getLegalPageData('privacy-policy', 'privacy');
  return generateLegalMetadata(data);
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