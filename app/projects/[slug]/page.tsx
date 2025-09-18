// Server Component for project pages with SSG
import { Suspense } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import MoreProjects from '@/src/components/MoreProjects/MoreProjects';
import '@/src/styles/pages/CaseStudy.scss';

// Generate static params for all projects
export async function generateStaticParams() {
  // Add known project slugs and try to fetch from API
  const knownSlugs = [
    { slug: 'beschutzerbox' },
    { slug: 'geschaftsbericht-fur-vorarlberger-landeskrankenhauser' }
  ];

  try {
    // Try to fetch more projects from API
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/project?per_page=20`);
    if (response.ok) {
      const projects = await response.json();
      const apiSlugs = projects.map((project: any) => ({ slug: project.slug }));
      return [...knownSlugs, ...apiSlugs];
    }
  } catch (error) {
    console.error('Error fetching projects for static generation:', error);
  }

  return knownSlugs;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    const project = await getProject(slug);
    
    return {
      title: `${project.title} | Projects - Edris Husein`,
      description: project.excerpt?.replace(/<[^>]*>/g, '').substring(0, 160) || `${project.title} - A project by Edris Husein`,
      openGraph: {
        title: project.title,
        description: project.excerpt?.replace(/<[^>]*>/g, '').substring(0, 160),
        images: project.featuredImage?.node?.sourceUrl ? [project.featuredImage.node.sourceUrl] : [],
        type: 'website',
      },
      twitter: {
        card: 'summary_large_image',
        title: project.title,
        description: project.excerpt?.replace(/<[^>]*>/g, '').substring(0, 160),
        images: project.featuredImage?.node?.sourceUrl ? [project.featuredImage.node.sourceUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Project | Projects - Edris Husein',
      description: 'View this project by Edris Husein',
    };
  }
}

// Fetch all projects for "More Projects" section
async function getAllProjectsForMoreProjects() {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/project?_embed&per_page=10`, {
      cache: 'no-store'
    });
    
    if (!response.ok) return null;
    
    const projects = await response.json();
    if (!Array.isArray(projects)) return null;
    
    // Transform to match GraphQL structure
    return {
      projects: {
        nodes: projects.map((project: any) => ({
          id: project.id.toString(),
          title: project.title?.rendered || project.title,
          excerpt: project.excerpt?.rendered || project.excerpt || '',
          slug: project.slug,
          featuredImage: (() => {
            const featuredMedia = project._embedded && project._embedded['wp:featuredmedia'] && project._embedded['wp:featuredmedia'][0];
            return featuredMedia ? {
              node: {
                sourceUrl: featuredMedia.source_url,
                altText: featuredMedia.alt_text || project.title?.rendered || '',
                mediaDetails: {
                  width: featuredMedia.media_details?.width || 800,
                  height: featuredMedia.media_details?.height || 600
                }
              }
            } : null;
          })(),
          caseStudy: {
            projectLinks: {
              liveSite: project.acf_fields?.project_links?.live_site || project.acf?.project_links?.live_site || project.acf_fields?.live_site || project.acf?.live_site || null,
              github: project.acf_fields?.project_links?.github || project.acf?.project_links?.github || null
            }
          }
        }))
      }
    };
  } catch (error) {
    console.error('Error fetching projects for MoreProjects:', error);
    return null;
  }
}

// Server-side data fetching
async function getProject(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/project?slug=${slug}&_embed&acf_format=standard`, {
      cache: 'no-store' // Always fetch fresh data
    });
    
    if (!response.ok) return null;
    
    const projects = await response.json();
    if (!Array.isArray(projects) || projects.length === 0) return null;
    
    const project = projects[0];
    
    return {
      id: project.id.toString(),
      title: project.title?.rendered || project.title,
      slug: project.slug,
      content: project.content?.rendered || project.content || '',
      excerpt: project.excerpt?.rendered || project.excerpt || '',
      featuredImage: project._embedded?.['wp:featuredmedia']?.[0] ? {
        node: {
          sourceUrl: project._embedded['wp:featuredmedia'][0].source_url,
          altText: project._embedded['wp:featuredmedia'][0].alt_text,
          mediaDetails: {
            width: project._embedded['wp:featuredmedia'][0].media_details?.width,
            height: project._embedded['wp:featuredmedia'][0].media_details?.height
          }
        }
      } : null,
      caseStudy: project.acf_fields || project.acf ? {
        projectOverview: {
          technologies: ((project.acf_fields || project.acf)?.project_overview?.tech_stack || []).map((tech: any) => ({
            id: tech.ID || tech.id,
            title: tech.post_title,
            featuredImage: tech.featured_image ? {
              node: {
                sourceUrl: tech.featured_image.source_url || tech.featured_image,
                altText: tech.post_title
              }
            } : null
          }))
        },
        projectContent: {
          challenge: (project.acf_fields || project.acf)?.project_content?.challenge || '',
          solution: (project.acf_fields || project.acf)?.project_content?.solution || '',
          keyFeatures: (project.acf_fields || project.acf)?.project_content?.key_features || []
        },
        projectLinks: {
          liveSite: (project.acf_fields || project.acf)?.project_links?.live_site || (project.acf_fields || project.acf)?.live_site || '',
          github: (project.acf_fields || project.acf)?.project_links?.github || ''
        },
        projectGallery: (project.acf_fields || project.acf)?.project_gallery || []
      } : null
    };
  } catch (error) {
    console.error('Error fetching project:', error);
    return null;
  }
}

// Server Component
export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Fetch both current project and all projects for "More Projects" section
  const [project, allProjectsData] = await Promise.all([
    getProject(slug),
    getAllProjectsForMoreProjects()
  ]);
  
  const allProjects = allProjectsData?.projects?.nodes || [];

  if (!project) {
    notFound();
  }

  return (
    <>
      <Header />
      <main className="case-study">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="container">
            <h1 className="title">{project.title}</h1>
            {project.excerpt && (
              <div
                className="overview"
                dangerouslySetInnerHTML={{ __html: project.excerpt }}
              />
            )}
            
            {/* Featured Image in Hero */}
            {project.featuredImage?.node && (
              <div className="featured-image">
                <Image
                  src={project.featuredImage.node.sourceUrl}
                  alt={project.featuredImage.node.altText || project.title}
                  width={project.featuredImage.node.mediaDetails?.width || 1200}
                  height={project.featuredImage.node.mediaDetails?.height || 600}
                  className="project-featured-image"
                  priority
                  placeholder="blur"
                  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                />
              </div>
            )}
          </div>
        </div>

        <div className="container">

          {/* Technologies */}
          {(() => {
            // Handle both GraphQL structure (technologies.nodes) and fallback structure (technologies array)
            const technologies = project.caseStudy?.projectOverview?.technologies?.nodes || 
                                project.caseStudy?.projectOverview?.technologies || [];
            
            return technologies.length > 0 ? (
              <section className="tech-stack">
                <h2>Technologies Used</h2>
                <div className="tech-grid">
                  {technologies.map((tech: any) => (
                    <div key={tech.id} className="tech-item">
                      {tech.featuredImage?.node && (
                        <Image
                          src={tech.featuredImage.node.sourceUrl}
                          alt={tech.featuredImage.node.altText || tech.title}
                          width={40}
                          height={40}
                          className="tech-icon"
                          onError={(e) => {
                            // Fallback to a default icon if the image fails to load
                            e.currentTarget.src = '/icons/code.svg';
                          }}
                        />
                      )}
                      <span>{tech.title}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null;
          })()}

          {/* The Challenge */}
          {project.caseStudy?.projectContent?.challenge && (
            <section className="challenge">
              <h2>The Challenge</h2>
              <div
                className="content"
                dangerouslySetInnerHTML={{ __html: project.caseStudy.projectContent.challenge }}
              />
            </section>
          )}

          {/* The Solution */}
          {project.caseStudy?.projectContent?.solution && (
            <section className="solution">
              <h2>The Solution</h2>
              <div
                className="content"
                dangerouslySetInnerHTML={{ __html: project.caseStudy.projectContent.solution }}
              />
            </section>
          )}

          {/* Project Links Section */}
          {project.caseStudy?.projectLinks && (
            <section className="project-action-links">
              <h2>View Project</h2>
              <div className="action-links">
                {project.caseStudy.projectLinks.liveSite && (
                  <a
                    href={project.caseStudy.projectLinks.liveSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-link primary"
                  >
                    Visit Live Site
                  </a>
                )}
                {project.caseStudy.projectLinks.github && (
                  <a
                    href={project.caseStudy.projectLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="action-link secondary"
                  >
                    View Source Code
                  </a>
                )}
              </div>
            </section>
          )}

          {/* Key Features */}
          {project.caseStudy?.projectContent?.keyFeatures && project.caseStudy.projectContent.keyFeatures.length > 0 && (
            <section className="key-features">
              <h2>Key Features</h2>
              <div className="features-grid">
                {project.caseStudy.projectContent.keyFeatures.map((feature: any, index: number) => (
                  <div key={index} className="feature-item">
                    {feature.image && (
                      <div className="feature-image">
                        <Image
                          src={feature.image.sourceUrl}
                          alt={feature.image.altText || feature.title}
                          width={feature.image.mediaDetails?.width || 400}
                          height={feature.image.mediaDetails?.height || 300}
                          className="feature-img"
                        />
                      </div>
                    )}
                    <div className="feature-content">
                      <h3>{feature.title}</h3>
                      <p>{feature.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Project Gallery */}
          {project.caseStudy?.projectGallery && project.caseStudy.projectGallery.length > 0 && (
            <section className="project-gallery">
              <h2>Project Gallery</h2>
              <div className="gallery-grid">
                {project.caseStudy.projectGallery
                  .filter((image: any) => image.url && image.url.trim() !== '')
                  .map((image: any, index: number) => (
                  <div key={index} className="gallery-item">
                    <Image
                      src={image.url}
                      alt={image.alt || `${project.title} gallery image ${index + 1}`}
                      width={image.width || 400}
                      height={image.height || 300}
                      className="gallery-image"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* More Projects Section */}
        <MoreProjects currentProjectSlug={slug} allProjects={allProjects} />
      </main>
      <Footer />
    </>
  );
}

// Enable ISR (Incremental Static Regeneration)
export const dynamic = 'force-dynamic'; // Always fetch fresh project data