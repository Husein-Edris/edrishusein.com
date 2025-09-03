// app/page.tsx
import { Suspense } from 'react';
import dynamic from 'next/dynamic';
import { DataFetcher } from '@/src/lib/data-fetcher';
import { SectionFactory } from '@/src/lib/section-registry';

const Header = dynamic(() => import('@/src/components/Header/Header'));

const SectionRenderer = dynamic(() => import('@/src/components/SectionRenderer/SectionRenderer'), {
  loading: () => <div className="loading-skeleton">Loading content...</div>
});

const Footer = dynamic(() => import('@/src/components/Footer/Footer'));

export const revalidate = 3600; // Revalidate every hour

export default async function HomePage() {
  // Fetch all data with enhanced error handling
  const { homepage, projects, posts } = await DataFetcher.getHomepageBundle();

  // Log data sources in development only
  if (process.env.NODE_ENV === 'development') {
    const { logDataSources } = await import('@/src/lib/data-fetcher');
    logDataSources({ homepage, projects, posts });
  }

  // Create dynamic sections configuration
  const sections = SectionFactory.createHomepageSections(
    homepage.data,
    projects.data,
    posts.data
  );

  return (
    <main>
      <Header />
      <Suspense fallback={<div className="loading-skeleton">Loading content...</div>}>
        <SectionRenderer sections={sections} />
      </Suspense>
      <Footer />
    </main>
  );
}