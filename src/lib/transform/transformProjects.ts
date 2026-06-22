import type { ProjectsResponse, WordPressProject } from '@/src/types/wordpress';
import { transformMedia } from './transformMedia';
import { decodeEntities } from './decodeEntities';

type Rendered = { rendered?: string } | string | undefined;

export interface RestProjectListItem {
  id: number | string;
  slug: string;
  title?: Rendered;
  excerpt?: Rendered;
  _embedded?: { 'wp:featuredmedia'?: unknown[] };
  acf_fields?: { project_links?: { live_site?: string; github?: string } };
  acf?: { project_links?: { live_site?: string; github?: string } };
}

export const rendered = (v: Rendered): string =>
  typeof v === 'string' ? v : v?.rendered ?? '';

/** Map one REST project to the domain `WordPressProject` (grid/list shape). */
export function transformProjectListItem(project: RestProjectListItem): WordPressProject {
  const acf = project.acf_fields ?? project.acf ?? {};
  const featured = project._embedded?.['wp:featuredmedia']?.[0];

  return {
    id: String(project.id),
    title: decodeEntities(rendered(project.title)),
    excerpt: rendered(project.excerpt),
    slug: project.slug,
    featuredImage: transformMedia(featured as never) ?? undefined,
    caseStudy: {
      projectLinks: {
        liveSite: acf.project_links?.live_site || '',
        github: acf.project_links?.github || '',
      },
    },
  };
}

/** REST `/project` array → `ProjectsResponse` (preserves incoming order, e.g. MENU_ORDER). */
export function transformProjects(projects: RestProjectListItem[]): ProjectsResponse {
  return { projects: { nodes: (projects ?? []).map(transformProjectListItem) } };
}
