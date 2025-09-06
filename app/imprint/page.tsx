import { Metadata } from 'next';
import LegalPage, { getLegalPageData, generateLegalMetadata } from '@/src/components/LegalPage/LegalPage';

// Force dynamic rendering for fresh content
export const dynamic = 'force-dynamic';

// Generate metadata for the imprint page
export async function generateMetadata(): Promise<Metadata> {
  const data = await getLegalPageData('imprint', 'imprint');
  return generateLegalMetadata(data);
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
    />
  );
}