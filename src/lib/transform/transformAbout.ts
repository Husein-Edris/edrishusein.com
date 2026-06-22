import type { WordPressImage } from '@/src/types/wordpress';
import { transformMedia, type RestMedia } from './transformMedia';
import { rendered } from './transformProjects';
import { asArray } from './asArray';

interface RelationPost {
  ID?: number;
  id?: number;
  post_title?: string;
  post_excerpt?: string;
  post_content?: string;
}

interface ExperienceItem {
  company_name?: string;
  position?: string;
  duration?: string;
  description?: string;
  technologies?: string;
}

interface AboutAcf {
  about_hero_title?: string;
  about_hero_subtitle?: string;
  about_hero_image?: RestMedia;
  experience_section_title?: string;
  experience_items?: ExperienceItem[];
  skills_section_title?: string;
  selected_skills?: RelationPost[];
  personal_section_title?: string;
  personal_content?: string;
  personal_image?: RestMedia;
  selected_hobbies?: RelationPost[];
}

interface RestAboutPage {
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
      experienceSection: { sectionTitle: string; experienceItems: Required<ExperienceItem>[] };
      skillsSection: { sectionTitle: string; selectedSkills: RelationItem[] };
      personalSection: {
        sectionTitle: string;
        personalContent: string;
        personalImage: WordPressImage | null;
        selectedHobbies: RelationItem[];
      };
    };
  };
}

function mapRelation(items: RelationPost[] | undefined): RelationItem[] {
  return asArray<RelationPost>(items).map((p) => ({
    ID: Number(p.ID ?? p.id ?? 0),
    post_title: p.post_title ?? '',
    post_excerpt: p.post_excerpt ?? '',
    post_content: p.post_content ?? '',
  }));
}

/**
 * Transform the WordPress REST `about-me` page into the `AboutPageData` shape the
 * About page consumes. Relation fields (`selected_skills`, `selected_hobbies`)
 * already resolve to full post objects, so no extra CPT fetches are needed.
 * SEO is handled separately (RankMath, feature 009).
 */
export function transformAbout(page: RestAboutPage): AboutPageData {
  const acf = page.acf_fields ?? page.acf ?? {};
  const featured = page._embedded?.['wp:featuredmedia']?.[0];

  return {
    page: {
      id: String(page.id ?? 'about'),
      title: rendered(page.title) || 'About',
      content: rendered(page.content),
      featuredImage: transformMedia(featured as never),
      aboutPageFields: {
        aboutHeroTitle: acf.about_hero_title ?? '',
        aboutHeroSubtitle: acf.about_hero_subtitle ?? '',
        aboutHeroImage: transformMedia(acf.about_hero_image),
        experienceSection: {
          sectionTitle: acf.experience_section_title || 'Experience',
          experienceItems: asArray<ExperienceItem>(acf.experience_items).map((item) => ({
            company_name: item.company_name ?? '',
            position: item.position ?? '',
            duration: item.duration ?? '',
            description: item.description ?? '',
            technologies: item.technologies ?? '',
          })),
        },
        skillsSection: {
          sectionTitle: acf.skills_section_title || 'Skills & Technologies',
          selectedSkills: mapRelation(acf.selected_skills),
        },
        personalSection: {
          sectionTitle: acf.personal_section_title || 'Personal',
          personalContent: acf.personal_content ?? '',
          personalImage: transformMedia(acf.personal_image),
          selectedHobbies: mapRelation(acf.selected_hobbies),
        },
      },
    },
  };
}
