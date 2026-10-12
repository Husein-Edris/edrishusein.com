import { Metadata } from 'next';
import LegalPage, { getLegalPageData, generateLegalMetadata } from '@/src/components/LegalPage/LegalPage';

// ISR: cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

// Generate metadata for the imprint page
export async function generateMetadata(): Promise<Metadata> {
  const data = await getLegalPageData('imprint', 'imprint');
  return generateLegalMetadata(data, '/imprint');
}

// Imprint page component
export default async function ImprintPage() {
  const data = await getLegalPageData('imprint', 'imprint');
  const page = data.page;

  return (
    <LegalPage
      title={page.title}
      content={page.content}
      lastUpdated={page.modified}
      breadcrumb="Imprint"
      showCookieSettings={false}
    />
  );
}