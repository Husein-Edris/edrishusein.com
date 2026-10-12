// app/projects/page.tsx
import type { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import { DataFetcher } from '@/src/lib/data-fetcher';
import { selectFeaturedProjects } from '@/src/lib/featured-projects';
import { getSiteContent } from '@/src/lib/site-content';
import { projectCardLabels } from '@/src/lib/transform/transformSiteContent';
import { generateCollectionPageStructuredData, pageOpenGraph, safeJsonLd } from '@/src/lib/seo-utils';
import '@/src/styles/pages/Projects.scss';

// ISR: cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Web Development Projects & Case Studies - Edris Husein',
  description: 'Web development projects and case studies by Edris Husein: client websites and web apps built with Next.js, React and WordPress in Austria and Germany.',
  alternates: { canonical: '/projects' },
  openGraph: pageOpenGraph({
    title: 'Web Development Projects & Case Studies - Edris Husein',
    description: 'Web development projects and case studies by Edris Husein: client websites and web apps built with Next.js, React and WordPress in Austria and Germany.',
    path: '/projects',
  }),
};

export default async function ProjectsPage() {
  // A transient CMS failure throws out of DataFetcher, so ISR keeps serving the
  // last good list instead of caching an empty or placeholder one.
  // Page text lives on the CMS "Site Content" options page, Projects page tab
  // (the CMS has no page for /projects). See docs/acf-content-map.md.
  const [{ data: projectsData }, siteContent] = await Promise.all([
    DataFetcher.getProjectsData(20), // Get more projects for the full list
    getSiteContent(),
  ]);
  const archive = siteContent.projectsArchive;

  const projectNodes = projectsData?.projects?.nodes ?? [];
  const toCard = (project: (typeof projectNodes)[number]) => ({
    title: project.title,
    description: project.excerpt || '',
    image: project.featuredImage?.node?.sourceUrl || '/images/Blog-sample-img.png',
    variant: 'dark' as 'dark' | 'light',
    visitLink: project.caseStudy?.projectLinks?.liveSite || '#',
    caseStudyLink: `/projects/${project.slug}`
  });
  const transformedProjects = projectNodes.map(toCard);

  // CMS-flagged (`highlighted`) projects lead as large features; the rest keep
  // their menu order in the grid below. See src/lib/featured-projects.ts.
  const { featured, rest } = selectFeaturedProjects(projectNodes);
  const featuredCards = featured.map(toCard);
  const orderedProjects = [...featuredCards, ...rest.map(toCard)];

  const collectionJsonLd = generateCollectionPageStructuredData({
    name: 'Projects',
    description: 'Web development projects and case studies by Edris Husein: client websites and web apps built with Next.js, React and WordPress in Austria and Germany.',
    path: '/projects',
    items: transformedProjects.map((project) => ({
      title: project.title,
      path: project.caseStudyLink,
    })),
  });

  return (
    <>
      <script
        type="application/ld+json"
        // safeJsonLd escapes <, >, &, U+2028/9 so CMS-sourced project titles
        // can never break out of the script tag (XSS guard).
        dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }}
      />
      <Header />
      <main id="main-content" tabIndex={-1}>
        <div className="projects-hero">
          <div className="projects-hero__inner">
            <h1 className="title">
              {archive.title}
              <span className="subtitle">{archive.subtitle}</span>
            </h1>
            <p className="projects-hero__count">{transformedProjects.length} {archive.countLabel}</p>
          </div>
        </div>
        <InfoCards
          skin="projects"
          variant="dark"
          className="projects-archive-grid"
          columns={3}
          featuredCount={featuredCards.length}
          restTitle={archive.moreProjectsHeading}
          labels={projectCardLabels(siteContent)}
          cards={orderedProjects}
        />
      </main>
      <Footer />
    </>
  );
}