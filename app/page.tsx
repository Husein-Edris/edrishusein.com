// app/page.tsx
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import SectionRenderer from '@/src/components/SectionRenderer/SectionRenderer';
import { DataFetcher, logDataSources } from '@/src/lib/data-fetcher';
import { SectionFactory } from '@/src/lib/section-registry';

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Fetch all data with enhanced error handling
  const { homepage, projects, posts } = await DataFetcher.getHomepageBundle();

  // Log data sources in development
  logDataSources({ homepage, projects, posts });

  // Create dynamic sections configuration
  const sections = SectionFactory.createHomepageSections(
    homepage.data,
    projects.data,
    posts.data
  );

  return (
    <main>
      <Header />
      <SectionRenderer sections={sections} />
      <Footer />
    </main>
  );
}