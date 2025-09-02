// app/projects/[slug]/page.tsx

import Image from 'next/image';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import MoreProjects from '@/src/components/MoreProjects/MoreProjects';
import '@/src/styles/pages/CaseStudy.scss';

async function getProject(slug: string) {
  try {
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/project?slug=${slug}&_embed&acf_format=standard`, {
      next: { revalidate: 3600 }
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
          liveSite: (project.acf_fields || project.acf)?.project_links?.live_site || '',
          github: (project.acf_fields || project.acf)?.project_links?.github || ''
        },
        projectGallery: (project.acf_fields || project.acf)?.project_gallery || []
      } : null
    };
  } catch (error) {
    return null;
  }
}

export async function generateStaticParams() {
  return [
    { slug: 'beschutzerbox' },
    { slug: 'geschaftsbericht-fur-vorarlberger-landeskrankenhauser' }
  ];
}

export default async function ProjectPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const project = await getProject(slug);

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
                {project.caseStudy.projectGallery.map((image: any, index: number) => (
                  <div key={index} className="gallery-item">
                    <Image
                      src={image.sourceUrl}
                      alt={image.altText || `${project.title} gallery image ${index + 1}`}
                      width={image.mediaDetails?.width || 400}
                      height={image.mediaDetails?.height || 300}
                      className="gallery-image"
                    />
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* More Projects Section */}
        <MoreProjects currentProjectSlug={slug} />
      </main>
      <Footer />
    </>
  );
}