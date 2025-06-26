// app/page.tsx
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import SectionRenderer from '@/src/components/SectionRenderer/SectionRenderer';
import { DataFetcher, logDataSources } from '@/src/lib/data-fetcher';
import { SectionFactory } from '@/src/lib/section-registry';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  // Fetch all data with enhanced error handling
  const { homepage, projects } = await DataFetcher.getHomepageBundle();

  // Log data sources in development
  logDataSources({ homepage, projects });

  // Create dynamic sections configuration
  const sections = SectionFactory.createHomepageSections(
    homepage.data,
    projects.data
  );

  return (
    <main>
      <Header />
      <SectionRenderer sections={sections} />
      <Footer />
    </main>
  );
}