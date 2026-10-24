import type { WordPressImage } from '@/src/types/wordpress';
import { transformMedia, type RestMedia } from './transformMedia';
import { rendered } from './transformProjects';
import { decodeEntities } from './decodeEntities';
import { asArray } from './asArray';
import { cmsText } from '../cms-text';
import type { Lang } from '../i18n/lang';

// Code fallbacks for About page fields (theme inc/acf-fields/about-page.php,
// same strings as the fields' default_value). Map: docs/acf-content-map.md.
export const ABOUT_TEXT_DEFAULTS = {
  technologiesLabel: 'Technologies:',
  hobbiesTitle: 'Interests & Hobbies',
} as const;

// Code defaults per language for the section titles and labels.
const ABOUT_DEFAULTS = {
  en: {
    ...ABOUT_TEXT_DEFAULTS,
    title: 'About',
    experienceTitle: 'Experience',
    skillsTitle: 'Skills & Technologies',
    personalTitle: 'Personal',
  },
  de: {
    technologiesLabel: 'Technologien:',
    hobbiesTitle: 'Interessen und Hobbys',
    title: 'Über mich',
    experienceTitle: 'Berufserfahrung',
    skillsTitle: 'Fähigkeiten und Technologien',
    personalTitle: 'Persönliches',
  },
} as const;

interface RelationPost {
  ID?: number;
  id?: number;
  post_title?: string;
  post_excerpt?: string;
  post_content?: string;
}

// `technologies` is an ACF relationship to the Tech CPT. Over REST it arrives as
// tech post IDs (or `false` when empty); older content stored a plain string.
type TechReference = number | string | { ID?: number; id?: number; post_title?: string };

interface RestExperienceItem {
  company_name?: string;
  position?: string;
  duration?: string;
  description?: string;
  technologies?: string | TechReference[] | false;
}

interface ExperienceItem {
  company_name: string;
  position: string;
  duration: string;
  description: string;
  /** Comma-separated tech names; '' when none resolve (the row is hidden). */
  technologies: string;
}

interface AboutAcf {
  about_hero_title?: string;
  about_hero_subtitle?: string;
  about_hero_image?: RestMedia;
  experience_section_title?: string;
  experience_technologies_label?: string;
  experience_items?: RestExperienceItem[];
  skills_section_title?: string;
  selected_skills?: RelationPost[];
  personal_section_title?: string;
  personal_content?: string;
  personal_image?: RestMedia;
  hobbies_section_title?: string;
  selected_hobbies?: RelationPost[];
}

export interface RestAboutPage {
  id?: number | string;
  title?: { rendered?: string } | string;
  content?: { rendered?: string } | string;
  _embedded?: { 'wp:featuredmedia'?: unknown[] };
  acf?: AboutAcf;
  acf_fields?: AboutAcf;
}

interface RelationItem { ID: number; post_title: string; post_excerpt: string; post_content: string }

export interface AboutPageData {
  page: {
    id: string;
    title: string;
    content: string;
    featuredImage: WordPressImage | null;
    aboutPageFields: {
      aboutHeroTitle: string;
      aboutHeroSubtitle: string;
      aboutHeroImage: WordPressImage | null;
      experienceSection: { sectionTitle: string; technologiesLabel: string; experienceItems: ExperienceItem[] };
      skillsSection: { sectionTitle: string; selectedSkills: RelationItem[] };
      personalSection: {
        sectionTitle: string;
        personalContent: string;
        personalImage: WordPressImage | null;
        hobbiesTitle: string;
        selectedHobbies: RelationItem[];
      };
    };
  };
}

function mapRelation(items: RelationPost[] | undefined): RelationItem[] {
  return asArray<RelationPost>(items).map((p) => ({
    ID: Number(p.ID ?? p.id ?? 0),
    post_title: decodeEntities(p.post_title ?? ''),
    post_excerpt: p.post_excerpt ?? '',
    post_content: p.post_content ?? '',
  }));
}

function techId(ref: TechReference): number {
  if (typeof ref === 'number') return ref;
  if (typeof ref === 'string') return Number(ref);
  return Number(ref.ID ?? ref.id);
}

function experienceTechRefs(items: RestExperienceItem[] | undefined): TechReference[] {
  return asArray<RestExperienceItem>(items).flatMap((item) =>
    Array.isArray(item.technologies) ? item.technologies : []
  );
}

/** Unique Tech CPT IDs referenced by experience items, for a `/tech?include=` lookup. */
export function extractExperienceTechIds(page: RestAboutPage): number[] {
  const acf = page.acf_fields ?? page.acf ?? {};
  const ids = experienceTechRefs(acf.experience_items)
    .map(techId)
    .filter((n) => Number.isFinite(n) && n > 0);
  return [...new Set(ids)];
}

function techNamesFor(
  technologies: RestExperienceItem['technologies'],
  techNames: Map<number, string>
): string {
  if (typeof technologies === 'string') return technologies;
  if (!Array.isArray(technologies)) return '';
  return technologies
    .map((ref) =>
      typeof ref === 'object' && ref.post_title
        ? decodeEntities(ref.post_title)
        : techNames.get(techId(ref))
    )
    .filter((name): name is string => Boolean(name))
    .join(', ');
}

/**
 * Transform the WordPress REST `about-me` page into the `AboutPageData` shape the
 * About page consumes. Relation fields (`selected_skills`, `selected_hobbies`)
 * already resolve to full post objects. Experience `technologies` arrive as tech
 * IDs, so the caller resolves names (via `/tech?include=`) and passes them in.
 * SEO is handled separately (RankMath, feature 009).
 */
export function transformAbout(
  page: RestAboutPage,
  techNames: Map<number, string> = new Map(),
  lang: Lang = 'en'
): AboutPageData {
  const defaults = ABOUT_DEFAULTS[lang];
  const acf = page.acf_fields ?? page.acf ?? {};
  const featured = page._embedded?.['wp:featuredmedia']?.[0];

  return {
    page: {
      id: String(page.id ?? 'about'),
      title: decodeEntities(rendered(page.title)) || defaults.title,
      content: rendered(page.content),
      featuredImage: transformMedia(featured as never),
      aboutPageFields: {
        aboutHeroTitle: acf.about_hero_title ?? '',
        aboutHeroSubtitle: acf.about_hero_subtitle ?? '',
        aboutHeroImage: transformMedia(acf.about_hero_image),
        experienceSection: {
          sectionTitle: acf.experience_section_title || defaults.experienceTitle,
          technologiesLabel: cmsText(acf.experience_technologies_label, defaults.technologiesLabel),
          experienceItems: asArray<RestExperienceItem>(acf.experience_items).map((item) => ({
            company_name: item.company_name ?? '',
            position: item.position ?? '',
            duration: item.duration ?? '',
            description: item.description ?? '',
            technologies: techNamesFor(item.technologies, techNames),
          })),
        },
        skillsSection: {
          sectionTitle: acf.skills_section_title || defaults.skillsTitle,
          selectedSkills: mapRelation(acf.selected_skills),
        },
        personalSection: {
          sectionTitle: acf.personal_section_title || defaults.personalTitle,
          personalContent: acf.personal_content ?? '',
          personalImage: transformMedia(acf.personal_image),
          hobbiesTitle: cmsText(acf.hobbies_section_title, defaults.hobbiesTitle),
          selectedHobbies: mapRelation(acf.selected_hobbies),
        },
      },
    },
  };
}
