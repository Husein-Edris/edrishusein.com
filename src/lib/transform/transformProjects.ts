import type { ProjectsResponse, WordPressProject } from '@/src/types/wordpress';
import { transformMedia } from './transformMedia';
import { decodeEntities } from './decodeEntities';
import { asBoolean } from './asBoolean';

type Rendered = { rendered?: string } | string | undefined;

export interface RestProjectListItem {
  id: number | string;
  slug: string;
  title?: Rendered;
  excerpt?: Rendered;
  _embedded?: { 'wp:featuredmedia'?: unknown[] };
  acf_fields?: ProjectListAcf;
  acf?: ProjectListAcf;
}

interface ProjectListAcf {
  project_links?: { live_site?: string; github?: string };
  highlighted?: unknown;
  // "Project facts" sidebar group (theme inc/acf-fields/project-facts.php).
  built_at?: unknown;
  showcase_video?: unknown;
}

const trimmedText = (value: unknown): string => (typeof value === 'string' ? decodeEntities(value.trim()) : '');

// ACF file field (return format URL): a URL string when set, '' / false / null when empty.
const httpUrl = (value: unknown): string =>
  typeof value === 'string' && /^https?:\/\//i.test(value.trim()) ? value.trim() : '';

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
    highlighted: asBoolean(acf.highlighted),
    builtAt: trimmedText(acf.built_at),
    showcaseVideo: httpUrl(acf.showcase_video),
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
