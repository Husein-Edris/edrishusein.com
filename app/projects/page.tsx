'use client';
// app/projects/page.tsx
import { useState, useEffect } from 'react';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);

  useEffect(() => {
    async function fetchProjects() {
      try {
        console.log('🔍 Fetching projects via REST API');
        const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/project?_embed&per_page=20`);
        
        if (response.ok) {
          const projectsData = await response.json();
          
          const transformedProjects = projectsData.map((project: any, index: number) => ({
            id: project.id || `project-${index}`,
            title: project.title?.rendered || project.title || 'Untitled Project',
            description: project.excerpt?.rendered || project.excerpt || '',
            image: project._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/Blog-sample-img.png',
            variant: 'dark' as const,
            visitLink: project.acf?.project_links?.live_site || '#',
            caseStudyLink: `/projects/${project.slug || `project-${index}`}`
          }));
          
          setProjects(transformedProjects);
          console.log(`✅ Loaded ${transformedProjects.length} projects`);
        }
      } catch (error) {
        console.error('❌ Error fetching projects:', error);
      }
    }

    fetchProjects();
  }, []);

  return (
    <>
      <Header />
      <main>
        <InfoCards
          skin="projects"
          variant="dark"
          sectionTitle="All Projects"
          columns={3}
          cards={Array.isArray(projects) ? projects : []}
        />
      </main>
      <Footer />
    </>
  );
}