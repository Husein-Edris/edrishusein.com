// app/projects/page.tsx
import type { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import { DataFetcher } from '@/src/lib/data-fetcher';
import { generateCollectionPageStructuredData, pageOpenGraph, safeJsonLd } from '@/src/lib/seo-utils';
import '@/src/styles/pages/Projects.scss';

export const dynamic = 'force-dynamic'; // Always fetch fresh project data

export const metadata: Metadata = {
  title: 'Web Development Projects & Case Studies - Edris Husein',
  description: 'Web development projects and case studies by Edris Husein: client websites and web apps built with Next.js, React and WordPress in Austria and Germany.',
  alternates: { canonical: '/projects' },
  openGraph: pageOpenGraph({
    title: 'Web Development Projects & Case Studies - Edris Husein',
    description: 'Web development projects and case studies by Edris Husein: client websites and web apps built with Next.js, React and WordPress in Austria and Germany.',
    path: '/projects',
  }),
};

async function getAllProjects() {
  try {
    console.log('🔍 Fetching all projects for projects page');
    const result = await DataFetcher.getProjectsData(20); // Get more projects for the full list
    console.log('📊 Projects result:', result);
    
    if (result.data) {
      return result.data;
    }
    
    console.warn('⚠️ No project data available');
    return null;
  } catch (error) {
    console.error('❌ Error fetching projects:', error);
    return null;
  }
}

export default async function ProjectsPage() {
  const projectsData = await getAllProjects();
  
  console.log('📋 Projects data for page:', projectsData);

  const transformedProjects = projectsData?.projects?.nodes?.map(project => ({
    title: project.title,
    description: project.excerpt || '',
    image: project.featuredImage?.node?.sourceUrl || '/images/Blog-sample-img.png',
    variant: 'dark' as 'dark' | 'light',
    visitLink: project.caseStudy?.projectLinks?.liveSite || '#',
    caseStudyLink: `/projects/${project.slug}`
  })) || [];

  const collectionJsonLd = generateCollectionPageStructuredData({
    name: 'Projects',
    description: 'Web development projects and case studies by Edris Husein: client websites and web apps built with Next.js, React and WordPress in Austria and Germany.',
    path: '/projects',
    items: transformedProjects.map((project) => ({
      title: project.title,
      path: project.caseStudyLink,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        // safeJsonLd escapes <, >, &, U+2028/9 so CMS-sourced project titles
        // can never break out of the script tag (XSS guard).
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }}
      />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <div className="projects-hero">
          <h1 className="title">
            PROJECTS
            <span className="subtitle">
              Web development case studies: Next.js, WordPress and more
            </span>
          </h1>
        </div>
        <InfoCards
          skin="projects"
          variant="dark"
          sectionTitle="All Projects"
          columns={3}
          cards={transformedProjects}
        />
      </main>
      <Footer />
    </>
  );
}