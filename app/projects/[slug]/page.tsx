// Server Component for project pages with SSG
import { Suspense } from 'react';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import MoreProjects from '@/src/components/MoreProjects/MoreProjects';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest } from '@/src/lib/rest-client';
import { transformProject, extractTechIds } from '@/src/lib/transform/transformProject';
import { transformProjects } from '@/src/lib/transform/transformProjects';
import { transformMedia } from '@/src/lib/transform/transformMedia';
import type { WordPressImage } from '@/src/types/wordpress';
import '@/src/styles/pages/CaseStudy.scss';

// Generate static params for all projects
export async function generateStaticParams() {
  // Add known project slugs and try to fetch from API
  const knownSlugs = [
    { slug: 'beschutzerbox' },
    { slug: 'geschaftsbericht-fur-vorarlberger-landeskrankenhauser' }
  ];

  try {
    const projects = await cmsRest<Array<{ slug: string }>>('/project?per_page=20&_fields=slug');
    const apiSlugs = projects.map((project) => ({ slug: project.slug }));
    return [...knownSlugs, ...apiSlugs];
  } catch (error: unknown) {
    // Don't fail the build if the CMS is unreachable - use known slugs
    console.error('Error fetching projects for static generation:', error instanceof Error ? error.message : error);
  }

  return knownSlugs;
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  try {
    const project = await getProject(slug);
    if (!project) {
      return {
        title: 'Project | Projects - Edris Husein',
        description: 'View this project by Edris Husein',
      };
    }

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
    const projects = await cmsRest<unknown[]>(
      '/project?_embed&per_page=10&orderby=menu_order&order=asc&acf_format=standard'
    );
    if (!Array.isArray(projects)) return null;
    return rewriteImageUrls(transformProjects(projects as never));
  } catch (error) {
    console.error('Error fetching projects for MoreProjects:', error);
    return null;
  }
}

// Resolve tech-badge images for a project (FR-8): the tech_stack relation objects
// don't carry image URLs, so fetch the Tech CPT featured images by ID.
async function resolveTechImages(ids: number[]): Promise<Map<number, WordPressImage | null>> {
  const map = new Map<number, WordPressImage | null>();
  if (ids.length === 0) return map;
  try {
    const techs = await cmsRest<Array<{ id: number; _embedded?: { 'wp:featuredmedia'?: unknown[] } }>>(
      `/tech?include=${ids.join(',')}&_embed&per_page=100`
    );
    for (const tech of techs) {
      map.set(Number(tech.id), transformMedia(tech._embedded?.['wp:featuredmedia']?.[0] as never));
    }
  } catch (error) {
    console.error('Error resolving tech images:', error);
  }
  return map;
}

// Server-side data fetching
async function getProject(slug: string) {
  try {
    const projects = await cmsRest<unknown[]>(
      `/project?slug=${slug}&_embed&acf_format=standard`
    );
    if (!Array.isArray(projects) || projects.length === 0) return null;

    const project = projects[0] as never;
    const techImages = await resolveTechImages(extractTechIds(project));

    return rewriteImageUrls(transformProject(project, techImages));
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

          {/* Technologies */}
          {(() => {
            const technologies = project.caseStudy?.projectOverview?.technologies || [];

            return technologies.length > 0 ? (
              <section className="tech-stack">
                <h2>Technologies Used</h2>
                <div className="tech-grid">
                  {technologies.map((tech) => (
                    <div key={tech.id} className="tech-item">
                      {tech.featuredImage?.node && (
                        <Image
                          src={tech.featuredImage.node.sourceUrl}
                          alt={tech.featuredImage.node.altText || tech.title}
                          width={40}
                          height={40}
                          className="tech-icon"
                          unoptimized
                        />
                      )}
                      <span>{tech.title}</span>
                    </div>
                  ))}
                </div>
              </section>
            ) : null;
          })()}

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

// Enable ISR (Incremental Static Regeneration) — cached render refreshed at most
// once per 60s instead of fetching WordPress on every request. Next requires this
// segment export to be a static literal (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;