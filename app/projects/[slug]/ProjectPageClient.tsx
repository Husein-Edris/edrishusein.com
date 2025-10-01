'use client';
// Client Component for project pages
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/CaseStudy.scss';

export default function ProjectPageClient() {
  const params = useParams();
  const slug = params?.slug as string;
  const [project, setProject] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProject() {
      if (!slug) return;
      
      try {
        console.log(`🔍 Fetching project: ${slug}`);
        const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/project?slug=${slug}&_embed`);
        
        if (response.ok) {
          const projectData = await response.json();
          
          if (projectData.length > 0) {
            const projectItem = projectData[0];
            const transformedProject = {
              id: projectItem.id,
              title: projectItem.title?.rendered || projectItem.title,
              content: projectItem.content?.rendered || projectItem.content || '',
              excerpt: projectItem.excerpt?.rendered || projectItem.excerpt || '',
              featuredImage: projectItem._embedded?.['wp:featuredmedia']?.[0] ? {
                node: {
                  sourceUrl: projectItem._embedded['wp:featuredmedia'][0].source_url,
                  altText: projectItem._embedded['wp:featuredmedia'][0].alt_text || projectItem.title?.rendered || '',
                  mediaDetails: {
                    width: projectItem._embedded['wp:featuredmedia'][0].media_details?.width || 800,
                    height: projectItem._embedded['wp:featuredmedia'][0].media_details?.height || 600
                  }
                }
              } : null,
              acf: projectItem.acf || {}
            };
            
            setProject(transformedProject);
            console.log(`✅ Loaded project: ${transformedProject.title}`);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching project:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchProject();
  }, [slug]);

  if (!project && !loading) {
    return (
      <>
        <Header />
        <main className="case-study">
          <div className="container">
            <h1>Project Not Found</h1>
            <p>The project you're looking for doesn't exist or has been removed.</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="case-study">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="container">
            <h1 className="title">{project?.title || 'Loading...'}</h1>
            {project?.excerpt && (
              <div className="overview">
                <div dangerouslySetInnerHTML={{ __html: project.excerpt }} />
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {project?.featuredImage?.node && (
          <div className="featured-image-section">
            <div className="container">
              <Image
                src={project.featuredImage.node.sourceUrl}
                alt={project.featuredImage.node.altText || project.title}
                width={project.featuredImage.node.mediaDetails?.width || 800}
                height={project.featuredImage.node.mediaDetails?.height || 600}
                className="featured-image"
                priority
              />
            </div>
          </div>
        )}

        {/* Content Section */}
        {project?.content && (
          <div className="content-section">
            <div className="container">
              <div 
                className="project-content"
                dangerouslySetInnerHTML={{ __html: project.content }} 
              />
            </div>
          </div>
        )}

        {/* Project Links */}
        {project?.acf?.project_links && (
          <div className="project-links-section">
            <div className="container">
              <h2>Project Links</h2>
              <div className="project-links">
                {project.acf.project_links.live_site && (
                  <a href={project.acf.project_links.live_site} target="_blank" rel="noopener noreferrer" className="btn btn-primary">
                    View Live Site
                  </a>
                )}
                {project.acf.project_links.github && (
                  <a href={project.acf.project_links.github} target="_blank" rel="noopener noreferrer" className="btn btn-secondary">
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