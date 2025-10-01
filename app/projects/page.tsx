'use client';
// app/projects/page.tsx
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import '@/src/styles/pages/CaseStudy.scss';

export default function ProjectsPage() {
  const [projects, setProjects] = useState([]);
  const [currentProject, setCurrentProject] = useState(null);
  const searchParams = useSearchParams();
  const slug = searchParams.get('slug');

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
            caseStudyLink: `/projects?slug=${project.slug || `project-${index}`}`,
            slug: project.slug,
            content: project.content?.rendered || '',
            excerpt: project.excerpt?.rendered || '',
            featuredImage: project._embedded?.['wp:featuredmedia']?.[0] ? {
              node: {
                sourceUrl: project._embedded['wp:featuredmedia'][0].source_url,
                altText: project._embedded['wp:featuredmedia'][0].alt_text || project.title?.rendered || '',
                mediaDetails: {
                  width: project._embedded['wp:featuredmedia'][0].media_details?.width || 800,
                  height: project._embedded['wp:featuredmedia'][0].media_details?.height || 600
                }
              }
            } : null,
            acf: project.acf || {}
          }));
          
          setProjects(transformedProjects);
          console.log(`✅ Loaded ${transformedProjects.length} projects`);
          
          // If slug is provided, find and set the current project
          if (slug) {
            const project = transformedProjects.find(p => p.slug === slug);
            if (project) {
              setCurrentProject(project);
            }
          }
        }
      } catch (error) {
        console.error('❌ Error fetching projects:', error);
      }
    }

    fetchProjects();
  }, [slug]);

  // If slug is provided and project is found, show individual project
  if (slug && currentProject) {
    return (
      <>
        <Header />
        <main className="case-study">
          {/* Hero Section */}
          <div className="hero-section">
            <div className="container">
              <Link href="/projects" className="back-link">
                ← Back to Projects
              </Link>
              <h1 className="title">{currentProject.title}</h1>
              {currentProject.excerpt && (
                <div className="overview">
                  <div dangerouslySetInnerHTML={{ __html: currentProject.excerpt }} />
                </div>
              )}
            </div>
          </div>

          {/* Featured Image */}
          {currentProject.featuredImage?.node && (
            <div className="featured-image-section">
              <div className="container">
                <Image
                  src={currentProject.featuredImage.node.sourceUrl}
                  alt={currentProject.featuredImage.node.altText || currentProject.title}
                  width={currentProject.featuredImage.node.mediaDetails?.width || 800}
                  height={currentProject.featuredImage.node.mediaDetails?.height || 600}
                  className="featured-image"
                  priority
                />
              </div>
            </div>
          )}

          {/* Content Section */}
          {currentProject.content && (
            <div className="content-section">
              <div className="container">
                <div 
                  className="project-content"
                  dangerouslySetInnerHTML={{ __html: currentProject.content }} 
                />
              </div>
            </div>
          )}

          {/* Project Links */}
          {currentProject.acf?.project_links && (
            <div className="project-links-section">
              <div className="container">
                <h2>Project Links</h2>
                <div className="project-links">
                  {currentProject.acf.project_links.live_site && (
                    <a href={currentProject.acf.project_links.live_site} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                      View Live Site
                    </a>
                  )}
                  {currentProject.acf.project_links.github && (
                    <a href={currentProject.acf.project_links.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
                      View on GitHub
                    </a>
                  )}
                </div>
              </div>
            </div>
          )}
        </main>
        <Footer />
      </>
    );
  }

  // If slug is provided but project not found
  if (slug && !currentProject) {
    return (
      <>
        <Header />
        <main className="case-study">
          <div className="container">
            <Link href="/projects" className="back-link">
              ← Back to Projects
            </Link>
            <h1>Project Not Found</h1>
            <p>The project you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Default: show all projects
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