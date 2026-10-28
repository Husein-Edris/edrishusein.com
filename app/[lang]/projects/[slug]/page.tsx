// Server Component for project pages with SSG
import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import MoreProjects from '@/src/components/MoreProjects/MoreProjects';
import CaseStudyFacts from '@/src/components/CaseStudyFacts/CaseStudyFacts';
import GalleryLightbox, { type GalleryImage } from '@/src/components/GalleryLightbox/GalleryLightbox';
import { buildFactRows } from '@/src/lib/case-study-facts';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { getSiteContent } from '@/src/lib/site-content';
import { galleryLightboxLabels, projectCardLabels } from '@/src/lib/transform/transformSiteContent';
import { decodeEntities } from '@/src/lib/transform/decodeEntities';
import { cmsRest, isTransientCmsError } from '@/src/lib/rest-client';
import { getServices, servicePath, servicesForProject } from '@/src/lib/services';
import { transformProject, extractTechIds } from '@/src/lib/transform/transformProject';
import { transformProjects } from '@/src/lib/transform/transformProjects';
import { transformMedia } from '@/src/lib/transform/transformMedia';
import { generateStructuredData, generateBreadcrumbStructuredData, safeJsonLd, metaDescriptionFrom } from '@/src/lib/seo-utils';
import type { WordPressImage } from '@/src/types/wordpress';
import { absoluteUrl, alternatesFor, localePath } from '@/src/lib/i18n/paths';
import { OG_LOCALE, otherLang, type Lang } from '@/src/lib/i18n/lang';
import { localizeRestItem } from '@/src/lib/i18n/localize';
import { dictionary } from '@/src/lib/i18n/dictionary';
import { langFromParams } from '@/src/lib/i18n/route';
import { fillLabel } from '@/src/lib/transform/transformSiteContent';
import '@/src/styles/pages/CaseStudy.scss';

type ProjectParams = { params: Promise<{ lang: string; slug: string }> };

// Generate static params for all projects (called once per language by the
// [lang] segment). If the CMS is unreachable at build time, nothing is
// prerendered and each page renders on its first request.
export async function generateStaticParams() {
  try {
    const projects = await cmsRest<Array<{ slug: string }>>('/project?per_page=100&_fields=slug');
    return projects.map((project) => ({ slug: project.slug }));
  } catch (error: unknown) {
    console.error('Error fetching projects for static generation:', error instanceof Error ? error.message : error);
  }

  return [];
}

// Generate metadata for SEO
export async function generateMetadata({ params }: ProjectParams) {
  const { slug } = await params;
  const lang = await langFromParams(params);
  const text = dictionary(lang);

  const project = await getProject(slug, lang);

  if (!project) {
    return {
      title: text.projectFallbackTitle,
      description: text.projectFallbackDescription,
    };
  }

  const path = `/projects/${slug}`;
  return {
    title: `${project.title} - Edris Husein`,
    description: metaDescriptionFrom(project.excerpt) || `${project.title} - Edris Husein`,
    alternates: alternatesFor(path, lang),
    openGraph: {
      title: project.title,
      description: metaDescriptionFrom(project.excerpt),
      url: localePath(path, lang),
      images: project.featuredImage?.node?.sourceUrl ? [project.featuredImage.node.sourceUrl] : [],
      type: 'website',
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[otherLang(lang)]],
    },
    twitter: {
      card: 'summary_large_image',
      title: project.title,
      description: metaDescriptionFrom(project.excerpt),
      images: project.featuredImage?.node?.sourceUrl ? [project.featuredImage.node.sourceUrl] : [],
    },
  };
}

interface RawGalleryImage {
  url?: string;
  alt?: string;
  caption?: string;
  width?: number;
  height?: number;
}

// ACF gallery items -> lightbox images. Items without a URL are dropped; the
// caption falls back to the editor's alt text, never to the generated one.
function galleryImages(gallery: readonly RawGalleryImage[], projectTitle: string, lang: Lang): GalleryImage[] {
  const altFormat = dictionary(lang).galleryImageAlt;
  return gallery
    .filter((image) => typeof image.url === 'string' && image.url.trim() !== '')
    .map((image, index) => {
      const alt = decodeEntities(image.alt?.trim() ?? '');
      return {
        url: image.url as string,
        alt: alt || fillLabel(altFormat, { title: projectTitle, index: index + 1 }),
        caption: decodeEntities(image.caption?.trim() ?? '') || alt,
        width: image.width || 400,
        height: image.height || 300,
      };
    });
}

// Fetch all projects for "More Projects" section
async function getAllProjectsForMoreProjects(lang: Lang) {
  try {
    const projects = await cmsRest<unknown[]>(
      // per_page=100, not 10: there are 11 projects, so the last one was never
      // fetched and could never appear as a related link anywhere on the site.
      '/project?_embed&per_page=100&orderby=menu_order&order=asc&acf_format=standard'
    );
    if (!Array.isArray(projects)) return null;
    return rewriteImageUrls(transformProjects(projects.map((project) => localizeRestItem(project, lang)) as never));
  } catch (error) {
    if (isTransientCmsError(error)) throw error;
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
    // A CMS fault must not be cached as a page without badges: rethrow so ISR
    // keeps serving the last good render. Anything else degrades to no icons.
    if (isTransientCmsError(error)) throw error;
    console.error('Error resolving tech images:', error);
  }
  return map;
}

// Server-side data fetching.
//
// Returns null only when the CMS answers "no such project". A CmsRequestError is
// deliberately left to propagate: it means the CMS could not answer at all, and
// treating that as a 404 is what let a transient database error get baked into
// the static build as a permanently empty page.
async function getProject(slug: string, lang: Lang) {
  const projects = await cmsRest<unknown[]>(
    `/project?slug=${encodeURIComponent(slug)}&_embed&acf_format=standard`
  );
  if (!Array.isArray(projects) || projects.length === 0) return null;

  const project = localizeRestItem(projects[0], lang) as never;
  const techImages = await resolveTechImages(extractTechIds(project));

  return rewriteImageUrls(transformProject(project, techImages));
}

// Server Component
export default async function ProjectPage({ params }: ProjectParams) {
  const { slug } = await params;
  const lang = await langFromParams(params);

  // Fetch both current project and all projects for "More Projects" section
  // Template headings and labels: CMS "Site Content" options page.
  // Services feed the reverse link (services whose related_projects list this
  // case study); a transient CMS failure rethrows like the other fetches.
  const [project, allProjectsData, siteContent, services] = await Promise.all([
    getProject(slug, lang),
    getAllProjectsForMoreProjects(lang),
    getSiteContent(lang),
    getServices(lang),
  ]);
  const copy = siteContent.caseStudy;

  const allProjects = allProjectsData?.projects?.nodes || [];

  if (!project) {
    notFound();
  }

  const factRows = buildFactRows(project, copy);
  const projectServices = servicesForProject(services, Number(project.id));

  // Structured data: mark the case study as a CreativeWork and expose a
  // Home > Projects > Title breadcrumb trail (project pages previously had none).
  const canonical = absoluteUrl(`/projects/${slug}`, lang);
  const structuredData = generateStructuredData('CreativeWork', {
    title: project.title,
    description: metaDescriptionFrom(project.excerpt),
    canonical,
    date: project.date,
    featuredImage: project.featuredImage,
    inLanguage: lang,
  });
  const breadcrumbData = generateBreadcrumbStructuredData([
    { text: siteContent.chrome.breadcrumbHome, url: absoluteUrl('/', lang) },
    { text: siteContent.nav.projects, url: absoluteUrl('/projects', lang) },
    { text: project.title, url: canonical },
  ]);

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="case-study">
        {/* Hero Section */}
        <div className="hero-section hero-section--left">
          <div className="container">
            <h1 className="title">{project.title}</h1>
            {projectServices.length > 0 && (
              <p className="case-study__service">
                {copy.serviceLabel}:{' '}
                {projectServices.map((service, index) => (
                  <span key={service.id}>
                    {index > 0 && ', '}
                    <Link href={servicePath(service, lang)}>{service.title}</Link>
                  </span>
                ))}
              </p>
            )}
            {project.excerpt && (
              <div
                className="overview"
                dangerouslySetInnerHTML={{ __html: project.excerpt }}
              />
            )}
          </div>
        </div>

        {/* Two-column body: main content left, sticky facts column right.
            The facts come first in the DOM so phones show them above the content. */}
        <div className={`container case-study__body${factRows.length > 0 ? ' case-study__body--with-facts' : ''}`}>
          <CaseStudyFacts rows={factRows} heading={copy.factsHeading} />

          <div className="case-study__main">
            {/* Featured image, first in the main column */}
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

            {/* The Challenge */}
            {project.caseStudy?.projectContent?.challenge && (
              <section className="challenge">
                <h2>{copy.challengeHeading}</h2>
                <div
                  className="content"
                  dangerouslySetInnerHTML={{ __html: project.caseStudy.projectContent.challenge }}
                />
              </section>
            )}

            {/* The Solution */}
            {project.caseStudy?.projectContent?.solution && (
              <section className="solution">
                <h2>{copy.solutionHeading}</h2>
                <div
                  className="content"
                  dangerouslySetInnerHTML={{ __html: project.caseStudy.projectContent.solution }}
                />
              </section>
            )}

            {/* Key Features */}
            {project.caseStudy?.projectContent?.keyFeatures && project.caseStudy.projectContent.keyFeatures.length > 0 && (
              <section className="key-features">
                <h2>{copy.keyFeaturesHeading}</h2>
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
                <h2>{copy.galleryHeading}</h2>
                <GalleryLightbox
                  images={galleryImages(project.caseStudy.projectGallery, project.title, lang)}
                  labels={galleryLightboxLabels(siteContent)}
                />
              </section>
            )}
          </div>
        </div>

        {/* More Projects Section */}
        <MoreProjects
          currentProjectSlug={slug}
          allProjects={allProjects}
          title={copy.moreProjectsHeading}
          labels={projectCardLabels(siteContent)}
          lang={lang}
        />
      </main>
      <Footer lang={lang} />

      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(structuredData) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbData) }}
      />
    </>
  );
}

// Enable ISR (Incremental Static Regeneration): cached render refreshed at most
// once per 60s instead of fetching WordPress on every request. Next requires this
// segment export to be a static literal (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;