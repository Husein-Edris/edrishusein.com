import type { WordPressImage, WordPressProject } from '@/src/types/wordpress';
import { HERO_FALLBACK_SLUGS } from './featured-projects';
import { linkText } from './case-study-facts';

// Projects shown in the homepage hero strip (design H9): projects flagged
// `highlighted` in the CMS (menu order, at most three). Until any project is
// flagged, the fixed trio in HERO_FALLBACK_SLUGS. The first one is the lead.
export const HERO_FRAME_COUNT = 3;

export interface HeroFrame {
  slug: string;
  title: string;
  href: string;
  /** Hostname of the live site for the browser bar; '' hides it. */
  domain: string;
  /** Project facts "Built at" (e.g. Freelance); '' hides it. */
  builtAt: string;
  image: WordPressImage['node'] | null;
  /** Project facts "Showcase video" URL; '' renders the image only. */
  video: string;
  /** The middle frame: largest, the only one on phones, the LCP image. */
  isLead: boolean;
}

function liveSiteUrl(project: WordPressProject): string {
  const url = project.caseStudy?.projectLinks?.liveSite?.trim() ?? '';
  return /^https?:\/\//i.test(url) ? url : '';
}

export function selectHeroProjects(projects: readonly WordPressProject[]): WordPressProject[] {
  const flagged = projects.filter((project) => project.highlighted === true);
  if (flagged.length > 0) return flagged.slice(0, HERO_FRAME_COUNT);
  return HERO_FALLBACK_SLUGS.map((slug) => projects.find((project) => project.slug === slug)).filter(
    (project): project is WordPressProject => project !== undefined,
  );
}

/** Lead item goes to the middle column: [lead, b, c] becomes [b, lead, c]. */
export function arrangeForStrip<T>(items: readonly T[]): T[] {
  if (items.length < 2) return [...items];
  const [lead, second, ...others] = items;
  return [second, lead, ...others];
}

function toHeroFrame(project: WordPressProject, isLead: boolean): HeroFrame {
  const live = liveSiteUrl(project);
  return {
    slug: project.slug,
    title: project.title,
    href: `/projects/${project.slug}`,
    domain: live ? linkText(live) : '',
    builtAt: project.builtAt?.trim() ?? '',
    image: project.featuredImage?.node ?? null,
    video: project.showcaseVideo ?? '',
    isLead,
  };
}

export function buildHeroFrames(projects: readonly WordPressProject[]): HeroFrame[] {
  const selected = selectHeroProjects(projects);
  const lead = selected[0];
  return arrangeForStrip(selected).map((project) => toHeroFrame(project, project === lead));
}

// Hero paragraph auto-links (used only while Home > Hero > Hero Copy has no
// links of its own): exact project names as written in the copy, each to that
// project's live site. A project without a live site is skipped.
export const HERO_COPY_LINK_PHRASES = [
  { phrase: 'illwerke vkw', slug: 'illwerke-vkw-website-relaunch' },
  { phrase: 'Vorarlberg state hospitals', slug: 'geschaftsbericht-fur-vorarlberger-landeskrankenhauser' },
  { phrase: 'FHE Gastro', slug: 'fhe-gastro-website-relaunch' },
] as const;

export interface HeroCopyLinkTarget {
  phrase: string;
  href: string;
}

export function buildHeroCopyLinks(projects: readonly WordPressProject[]): HeroCopyLinkTarget[] {
  return HERO_COPY_LINK_PHRASES.flatMap(({ phrase, slug }) => {
    const project = projects.find((candidate) => candidate.slug === slug);
    const href = project ? liveSiteUrl(project) : '';
    return href ? [{ phrase, href }] : [];
  });
}
