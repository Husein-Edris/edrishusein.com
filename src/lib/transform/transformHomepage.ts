import type { HomepageSections } from '@/src/types/wordpress';
import { transformMedia, type RestMedia } from './transformMedia';
import type { Lang } from '../i18n/lang';

// The person's name, kept as `title` for existing consumers. The visible H1 is
// the separate `heading` (ACF `hero_title`), resolved in the Hero component.
const HERO_TITLE = 'Edris Husein';

// Section titles used only when a whole group is missing from the response.
const SECTION_TITLE_DEFAULTS = {
  en: { projects: 'Projects', about: 'About Me', bookshelf: 'BOOKSHELF', techstack: 'TECH STACK', notebook: 'NOTEBOOK' },
  de: { projects: 'Projekte', about: 'Über mich', bookshelf: 'BÜCHERREGAL', techstack: 'TECHNOLOGIEN', notebook: 'NOTIZBUCH' },
} as const;

interface HomeAcfFields {
  hero_section?: {
    hero_image?: RestMedia;
    hero_copy?: string;
    hero_eyebrow?: string;
    hero_title?: string;
    hero_primary_cta_label?: string;
    hero_primary_cta_url?: string;
    hero_secondary_cta_label?: string;
    hero_secondary_cta_url?: string;
  };
  projects_section?: {
    title?: string;
    view_all_label?: string;
    view_all_url?: string;
  };
  about_me_section?: { title?: string; about_me_text?: string; learn_more_label?: string; learn_more_url?: string };
  bookshelf_section?: { title?: string; description?: string; featured_image?: RestMedia };
  techstack_section?: { title?: string; description?: string; featured_image?: RestMedia };
  notebook_section?: { title?: string; view_all_label?: string; view_all_url?: string };
  contact_section?: { sub_title?: string; title?: string; email?: string };
}

/**
 * Transform the WordPress REST `home` page (theme `acf_fields` nested groups)
 * into the `HomepageSections` domain shape. Missing fields collapse to light
 * defaults; the section renderer/fallback layer handles total absence.
 */
export function transformHomepage(page: { acf_fields?: unknown }, lang: Lang = 'en'): HomepageSections {
  const titles = SECTION_TITLE_DEFAULTS[lang];
  const acf = (page?.acf_fields ?? {}) as HomeAcfFields;
  const hero = acf.hero_section ?? {};
  const about = acf.about_me_section ?? {};
  const bookshelf = acf.bookshelf_section ?? {};
  const techstack = acf.techstack_section ?? {};
  const notebook = acf.notebook_section ?? {};
  const contact = acf.contact_section ?? {};
  const projects = acf.projects_section ?? {};

  return {
    heroSection: {
      title: HERO_TITLE,
      // Edris's portrait, used on /about when its own image is empty. resolvePortrait()
      // (src/lib/portrait.ts) skips the old Preview.svg placeholder and falls
      // back to the static photo. Decision 2026-10-12, replaces 2026-06-22.
      heroImage: transformMedia(hero.hero_image) ?? undefined,
      heroCopy: hero.hero_copy ?? '',
      // Empty strings are kept as-is: the Hero component swaps in its own
      // default copy for any blank field (src/components/Hero/heroContent.ts).
      eyebrow: hero.hero_eyebrow ?? '',
      heading: hero.hero_title ?? '',
      primaryCtaLabel: hero.hero_primary_cta_label ?? '',
      primaryCtaUrl: hero.hero_primary_cta_url ?? '',
      secondaryCtaLabel: hero.hero_secondary_cta_label ?? '',
      secondaryCtaUrl: hero.hero_secondary_cta_url ?? '',
    },
    projectsSection: {
      title: projects.title ?? titles.projects,
      // Blank values fall back in SectionFactory (src/lib/section-registry.ts).
      viewAllLabel: projects.view_all_label ?? '',
      viewAllUrl: projects.view_all_url ?? '',
    },
    aboutSection: {
      title: about.title ?? titles.about,
      aboutMeText: about.about_me_text ?? '',
      // Blank values fall back in the About component (src/components/about/about.tsx).
      learnMoreLabel: about.learn_more_label ?? '',
      learnMoreUrl: about.learn_more_url ?? '',
    },
    bookshelfSection: {
      title: bookshelf.title ?? titles.bookshelf,
      description: bookshelf.description ?? '',
      featuredImage: transformMedia(bookshelf.featured_image) ?? undefined,
    },
    techstackSection: {
      title: techstack.title ?? titles.techstack,
      description: techstack.description ?? '',
      featuredImage: transformMedia(techstack.featured_image) ?? undefined,
    },
    notebookSection: {
      title: notebook.title ?? titles.notebook,
      // Blank values fall back in SectionFactory (src/lib/section-registry.ts).
      viewAllLabel: notebook.view_all_label ?? '',
      viewAllUrl: notebook.view_all_url ?? '',
    },
    contactSection: {
      subTitle: contact.sub_title ?? '',
      title: contact.title ?? '',
      email: contact.email ?? '',
    },
  };
}
