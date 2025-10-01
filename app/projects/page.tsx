'use client';
// app/projects/page.tsx
import { useState, useEffect } from 'react';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProjects() {
      try {
        console.log('🔍 Fetching projects via REST API');
        const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/project?_embed&per_page=20`);
        
        if (response.ok) {
          const projectsData = await response.json();
          
          const transformedProjects = projectsData.map((project: any) => ({
            title: project.title?.rendered || project.title,
            description: project.excerpt?.rendered || project.excerpt || '',
            image: project._embedded?.['wp:featuredmedia']?.[0]?.source_url || '/images/Blog-sample-img.png',
            variant: 'dark' as 'dark' | 'light',
            visitLink: project.acf?.project_links?.live_site || '#',
            caseStudyLink: `/projects/${project.slug}`
          }));
          
          setProjects(transformedProjects);
          console.log(`✅ Loaded ${transformedProjects.length} projects`);
        }
      } catch (error) {
        console.error('❌ Error fetching projects:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProjects();
  }, []);

  return (
    <>
      <Header />
      <main>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
            <p>Loading projects...</p>
          </div>
        ) : (
          <InfoCards
            skin="projects"
            variant="dark"
            sectionTitle="All Projects"
            columns={3}
            cards={projects}
          />
        )}
      </main>
      <Footer />
    </>
  );
}