import type { WordPressImage } from '@/src/types/wordpress';
import { transformMedia } from './transformMedia';
import { rendered } from './transformProjects';

interface TechStackItem { ID?: number; id?: number; post_title?: string; title?: string }

interface ProjectAcf {
  project_overview?: { tech_stack?: TechStackItem[] };
  project_content?: { challenge?: string; solution?: string };
  key_features?: Array<{ title?: string; description?: string }>;
  project_links?: { live_site?: string; github?: string };
  project_gallery?: Array<{ url?: string; alt?: string; width?: number; height?: number }>;
}

interface RestProjectDetail {
  id: number | string;
  slug: string;
  title?: { rendered?: string } | string;
  content?: { rendered?: string } | string;
  excerpt?: { rendered?: string } | string;
  _embedded?: { 'wp:featuredmedia'?: unknown[] };
  acf_fields?: ProjectAcf;
  acf?: ProjectAcf;
}

export interface CaseStudyProject {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  featuredImage: WordPressImage | null;
  caseStudy: {
    projectOverview: { technologies: Array<{ id: number; title: string; featuredImage: WordPressImage | null }> };
    projectContent: { challenge: string; solution: string; keyFeatures: Array<{ title: string; description: string }> };
    projectLinks: { liveSite: string; github: string };
    projectGallery: Array<{ url?: string; alt?: string; width?: number; height?: number }>;
  };
}

/** Tech-relation post IDs for a project (FR-8: used to resolve tech badge images separately). */
export function extractTechIds(project: RestProjectDetail): number[] {
  const acf = project.acf_fields ?? project.acf ?? {};
  return (acf.project_overview?.tech_stack ?? [])
    .map((t) => Number(t.ID ?? t.id))
    .filter((n) => Number.isFinite(n));
}

/**
 * Transform a REST project into the full case-study domain shape.
 * Tech badge images aren't present on the `tech_stack` relation objects, so the
 * caller resolves them (via `/tech?include=<ids>`) and passes a `techImages`
 * map keyed by tech post ID (FR-8).
 */
export function transformProject(
  project: RestProjectDetail,
  techImages: Map<number, WordPressImage | null> = new Map(),
): CaseStudyProject {
  const acf = project.acf_fields ?? project.acf ?? {};
  const featured = project._embedded?.['wp:featuredmedia']?.[0];

  return {
    id: String(project.id),
    title: rendered(project.title),
    slug: project.slug,
    content: rendered(project.content),
    excerpt: rendered(project.excerpt),
    featuredImage: transformMedia(featured as never),
    caseStudy: {
      projectOverview: {
        technologies: (acf.project_overview?.tech_stack ?? []).map((t) => {
          const id = Number(t.ID ?? t.id);
          return {
            id,
            title: t.post_title ?? t.title ?? '',
            featuredImage: techImages.get(id) ?? null,
          };
        }),
      },
      projectContent: {
        challenge: acf.project_content?.challenge ?? '',
        solution: acf.project_content?.solution ?? '',
        // key_features lives at the TOP of acf_fields (not under project_content)
        // and is text-only {title, description} (research C5).
        keyFeatures: (acf.key_features ?? []).map((f) => ({
          title: f.title ?? '',
          description: f.description ?? '',
        })),
      },
      projectLinks: {
        liveSite: acf.project_links?.live_site ?? '',
        github: acf.project_links?.github ?? '',
      },
      projectGallery: acf.project_gallery ?? [],
    },
  };
}
