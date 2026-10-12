import type { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import TechGrid from '@/src/components/TechGrid/TechGrid';
import { cmsRest, isTransientCmsError } from '@/src/lib/rest-client';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { buildTechGrid } from '@/src/lib/tech-usage';
import { getSiteContent } from '@/src/lib/site-content';
import { generateStructuredData, pageOpenGraph, safeJsonLd } from '@/src/lib/seo-utils';
import '@/src/styles/pages/CaseStudy.scss';

// ISR: the grid has a stable order (most used first), so the page is cached and
// refreshed at most once per 60s. Static literal, keep in sync with CMS_REVALIDATE.
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Tech Stack: Next.js, React & WordPress - Edris Husein',
  description: 'The tech stack Edris Husein builds with: Next.js, React, TypeScript and WordPress, plus the tools, apps and devices behind his web development work.',
  alternates: { canonical: '/tech-stack' },
  openGraph: pageOpenGraph({
    title: 'Tech Stack: Next.js, React & WordPress - Edris Husein',
    description: 'The tech stack Edris Husein builds with: Next.js, React, TypeScript and WordPress, plus the tools, apps and devices behind his web development work.',
    path: '/tech-stack',
  }),
};

// Tech posts with their logo (featured image), categories and the optional usage_note.
const TECHS_PATH =
  '/tech?per_page=100&_embed=wp:featuredmedia&_fields=id,title,tech_category,acf_fields,_links,_embedded';
// Category names for the filter buttons; tools without one go under "Other".
const CATEGORIES_PATH = '/tech_category?per_page=100&_fields=id,name';
// Projects; only the tech_stack relation is needed to count usage.
const PROJECTS_PATH = '/project?per_page=100&acf_format=standard&_fields=id,acf_fields.project_overview';

interface TechGridSources {
  techs: unknown[];
  projects: unknown[];
  categories: unknown[];
}

const asList = (value: unknown): unknown[] => (Array.isArray(value) ? value : []);

/**
 * The three lists for the grid. A transient CMS failure rethrows so ISR keeps
 * the last good render instead of caching a grid where every count is zero.
 */
async function getTechGridSources(): Promise<TechGridSources> {
  try {
    const [techs, projects, categories] = await Promise.all([
      cmsRest<unknown>(TECHS_PATH),
      cmsRest<unknown>(PROJECTS_PATH),
      cmsRest<unknown>(CATEGORIES_PATH),
    ]);
    return { techs: asList(techs), projects: asList(projects), categories: asList(categories) };
  } catch (error: unknown) {
    if (isTransientCmsError(error)) throw error;
    console.error('Error fetching tech stack:', error instanceof Error ? error.message : error);
    return { techs: [], projects: [], categories: [] };
  }
}

export default async function TechStackPage() {
  const [{ techs, projects, categories }, siteContent] = await Promise.all([getTechGridSources(), getSiteContent()]);
  const copy = siteContent.techStackPage;
  const grid = rewriteImageUrls(buildTechGrid(techs, projects, categories, copy));

  const webPageJsonLd = generateStructuredData('WebPage', {
    title: 'Tech Stack: Next.js, React & WordPress - Edris Husein',
    description: 'The tech stack Edris Husein builds with: Next.js, React, TypeScript and WordPress.',
    canonical: 'https://edrishusein.com/tech-stack',
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(webPageJsonLd) }}
      />
      <Header />
      <main id="main-content" tabIndex={-1} className="case-study">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="container">
            <h1 className="title">{copy.title}</h1>
            <div className="overview">
              <p>{copy.intro}</p>
            </div>
          </div>
        </div>

        <div className="container">
          <section className="tech-section">
            {grid.items.length > 0 ? (
              <TechGrid items={grid.items} tabs={grid.tabs} labels={copy} />
            ) : (
              <p className="no-tech-message">{copy.emptyMessage}</p>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}