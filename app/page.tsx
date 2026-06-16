// app/page.tsx
import { Suspense } from 'react';
import Header from '@/src/components/Header/Header';
import SectionRenderer from '@/src/components/SectionRenderer/SectionRenderer';
import Footer from '@/src/components/Footer/Footer';

// ISR: serve a cached homepage render and refresh it at most once per window
// (see CMS_REVALIDATE in src/lib/client.ts) instead of re-fetching WordPress on
// every visit. This is the main fix for the slow loading screen.
export const revalidate = 60;

// Simple fallback sections to avoid build issues
const getFallbackSections = () => [
  {
    id: 'hero',
    component: 'hero' as const,
    props: {
      title: 'Edris Husein',
      heroCopy: 'Full-stack developer crafting digital experiences with modern technologies.',
      heroImage: {
        node: {
          sourceUrl: '/images/Edris-Husein-Hero.png',
          altText: 'Edris Husein Profile'
        }
      }
    },
    order: 1,
    enabled: true
  }
];

export default async function HomePage() {
  let sections;
  
  try {
    // Try to load real data
    const { DataFetcher } = await import('@/src/lib/data-fetcher');
    const { SectionFactory } = await import('@/src/lib/section-registry');
    
    const { homepage, projects, posts } = await DataFetcher.getHomepageBundle();
    sections = SectionFactory.createHomepageSections(
      homepage.data,
      projects.data,
      posts.data
    );
  } catch (error) {
    console.error('Using fallback sections due to:', error);
    sections = getFallbackSections();
  }

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