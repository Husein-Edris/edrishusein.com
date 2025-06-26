// app/projects/[slug]/page.tsx
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import MoreProjects from '@/src/components/MoreProjects/MoreProjects';
import '@/src/styles/pages/CaseStudy.scss';

// Default technologies for fallback
const DEFAULT_TECHNOLOGIES = [
  { id: '1', title: 'JavaScript', featuredImage: { node: { sourceUrl: '/icons/javascript.svg', altText: 'JavaScript' } } },
  { id: '2', title: 'React', featuredImage: { node: { sourceUrl: '/icons/react.svg', altText: 'React' } } },
  { id: '3', title: 'Next.js', featuredImage: { node: { sourceUrl: '/icons/nextjs.svg', altText: 'Next.js' } } },
  { id: '4', title: 'WordPress', featuredImage: { node: { sourceUrl: '/icons/wordpress.svg', altText: 'WordPress' } } },
  { id: '5', title: 'GraphQL', featuredImage: { node: { sourceUrl: '/icons/graphql.svg', altText: 'GraphQL' } } },
  { id: '6', title: 'SCSS', featuredImage: { node: { sourceUrl: '/icons/sass.svg', altText: 'SCSS' } } }
];

export default function ProjectPage() {
  const params = useParams();
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [errorDetails, setErrorDetails] = useState(null);

  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  useEffect(() => {
    async function fetchData() {
      try {
        console.log('🔍 Fetching project data for slug:', slug);

        const response = await fetch(`/api/project?slug=${slug}`);
        const data = await response.json();

        console.log('📡 API response status:', response.status);
        console.log('📄 API response data:', data);

        if (!response.ok) {
          throw new Error(data.message || data.error || `HTTP error! Status: ${response.status}`);
        }

        if (!data.project) {
          throw new Error('Project data is missing from response');
        }

        console.log('✅ Successfully received project data:', data.project.title);
        setProject(data.project);
      } catch (err) {
        console.error('❌ Error fetching project:', err);
        setError(err instanceof Error ? err.message : 'Unknown error occurred');
        setErrorDetails(err.details || null);
      } finally {
        setLoading(false);
      }
    }

    if (slug) {
      fetchData();
    } else {
      setError('No project slug provided');
      setLoading(false);
    }
  }, [slug]);

  if (loading) {
    return (
      <>
        <Header />
        <main className="case-study">
          <div className="container">
            <h1 className="title">Loading project...</h1>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  if (error || !project) {
    return (
      <>
        <Header />
        <main className="case-study">
          <div className="container">
            <h1 className="title">Project Not Found</h1>
            <p>Sorry, we couldn&apos;t find the project you&apos;re looking for.</p>
            <p>Requested slug: <code>{slug}</code></p>
            {error && (
              <div className="error-details">
                <p><strong>Error:</strong> {error}</p>
                {errorDetails && <p><strong>Details:</strong> {errorDetails}</p>}
              </div>
            )}
            <div className="available-projects">
              <h3>Available Projects:</h3>
              <ul>
                <li><Link href="/projects/beschutzerbox">Beschützerbox</Link></li>
                <li><Link href="/projects/geschaftsbericht-fur-vorarlberger-landeskrankenhauser">Geschäftsbericht für Vorarlberger Landeskrankenhäuser</Link></li>
              </ul>
            </div>
            <Link href="/projects" className="link-button">
              Back to Projects
            </Link>
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
            <h1 className="title">{project.title}</h1>
            {project.excerpt && (
              <div
                className="overview"
                dangerouslySetInnerHTML={{ __html: project.excerpt }}
              />
            )}
            
            {/* Project Links */}
            {project.caseStudy?.projectLinks && (
              <div className="project-links">
                {project.caseStudy.projectLinks.liveSite && (
                  <a
                    href={project.caseStudy.projectLinks.liveSite}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-button primary"
                  >
                    View Live Site
                  </a>
                )}
                {project.caseStudy.projectLinks.github && (
                  <a
                    href={project.caseStudy.projectLinks.github}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-button secondary"
                  >
                    View Code
                  </a>
                )}
              </div>
            )}
          </div>
        </div>

        <div className="container">
          {/* Featured Image */}
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


          {/* Technologies */}
          <section className="tech-stack">
            <h2>Technologies Used</h2>
            <div className="tech-grid">
              {(project.caseStudy?.projectOverview?.technologies?.length > 0 
                ? project.caseStudy.projectOverview.technologies 
                : DEFAULT_TECHNOLOGIES.slice(0, 4) // Show first 4 default technologies
              ).map((tech) => (
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
            {(!project.caseStudy?.projectOverview?.technologies || project.caseStudy.projectOverview.technologies.length === 0) && (
              <p className="tech-note" style={{ fontSize: '14px', opacity: 0.7, marginTop: '16px' }}>
                Sample technologies shown. Configure in WordPress admin to customize.
              </p>
            )}
          </section>

          {/* Main Content (if available) */}
          {project.content && (
            <section className="project-content">
              <h2>Project Overview</h2>
              <div
                className="content"
                dangerouslySetInnerHTML={{ __html: project.content }}
              />
            </section>
          )}

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
                {project.caseStudy.projectContent.keyFeatures.map((feature, index) => (
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
                {project.caseStudy.projectGallery.map((image, index) => (
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