// app/projects/page.tsx
import type { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import { DataFetcher } from '@/src/lib/data-fetcher';

export const dynamic = 'force-dynamic'; // Always fetch fresh project data

export const metadata: Metadata = {
  title: 'Projects - Edris Husein',
  description: 'A selection of case studies and projects by Edris Husein, full-stack developer working with React, Next.js, and WordPress.',
  alternates: { canonical: '/projects' },
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

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1}>
        <h1 className="sr-only">Projects</h1>
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