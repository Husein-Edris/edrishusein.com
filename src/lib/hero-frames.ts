import type { WordPressImage, WordPressProject } from '@/src/types/wordpress';
import { HERO_FALLBACK_SLUGS } from './featured-projects';
import { linkText } from './case-study-facts';
import { localePath } from './i18n/paths';
import { DEFAULT_LANG, type Lang } from './i18n/lang';

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

function toHeroFrame(project: WordPressProject, isLead: boolean, lang: Lang): HeroFrame {
  const live = liveSiteUrl(project);
  return {
    slug: project.slug,
    title: project.title,
    href: localePath(`/projects/${project.slug}`, lang),
    domain: live ? linkText(live) : '',
    builtAt: project.builtAt?.trim() ?? '',
    image: project.featuredImage?.node ?? null,
    video: project.showcaseVideo ?? '',
    isLead,
  };
}

export function buildHeroFrames(projects: readonly WordPressProject[], lang: Lang = DEFAULT_LANG): HeroFrame[] {
  const selected = selectHeroProjects(projects);
  // DOM order is lead first, so keyboard and phone swipe order match; the
  // desktop grid moves the lead to the middle column in CSS (Hero.scss).
  return selected.map((project, index) => toHeroFrame(project, index === 0, lang));
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
