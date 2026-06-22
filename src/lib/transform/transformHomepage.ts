import type { HomepageSections } from '@/src/types/wordpress';
import { transformMedia, type RestMedia } from './transformMedia';

// No CMS field exists for the hero title — `hero_section` only carries an image
// and copy, and the homepage query never fetched a hero title. It has always
// been this constant (see research C6).
const HERO_TITLE = 'Edris Husein';

interface HomeAcfFields {
  hero_section?: { hero_image?: RestMedia; hero_copy?: string };
  projects_section?: { title?: string };
  about_me_section?: { title?: string; about_me_text?: string };
  bookshelf_section?: { title?: string; description?: string; featured_image?: RestMedia };
  techstack_section?: { title?: string; description?: string; featured_image?: RestMedia };
  notebook_section?: { title?: string };
  contact_section?: { sub_title?: string; title?: string; email?: string };
}

/**
 * Transform the WordPress REST `home` page (theme `acf_fields` nested groups)
 * into the `HomepageSections` domain shape. Missing fields collapse to light
 * defaults; the section renderer/fallback layer handles total absence.
 */
export function transformHomepage(page: { acf_fields?: unknown }): HomepageSections {
  const acf = (page?.acf_fields ?? {}) as HomeAcfFields;
  const hero = acf.hero_section ?? {};
  const about = acf.about_me_section ?? {};
  const bookshelf = acf.bookshelf_section ?? {};
  const techstack = acf.techstack_section ?? {};
  const notebook = acf.notebook_section ?? {};
  const contact = acf.contact_section ?? {};
  const projects = acf.projects_section ?? {};

  return {
    // Hero image is intentionally NOT sourced from the CMS: the `hero_image`
    // field holds a dormant placeholder (Preview.svg) that prod never used, and
    // the design expects the static profile photo. Leaving `heroImage` undefined
    // makes the Hero component use its built-in default. Only the copy is
    // CMS-driven. (See research C6 / hero-image decision 2026-06-22.)
    heroSection: {
      title: HERO_TITLE,
      heroCopy: hero.hero_copy ?? '',
    },
    projectsSection: { title: projects.title ?? 'Projects' },
    aboutSection: {
      title: about.title ?? 'About Me',
      aboutMeText: about.about_me_text ?? '',
    },
    bookshelfSection: {
      title: bookshelf.title ?? 'BOOKSHELF',
      description: bookshelf.description ?? '',
      featuredImage: transformMedia(bookshelf.featured_image) ?? undefined,
    },
    techstackSection: {
      title: techstack.title ?? 'TECH STACK',
      description: techstack.description ?? '',
      featuredImage: transformMedia(techstack.featured_image) ?? undefined,
    },
    notebookSection: { title: notebook.title ?? 'NOTEBOOK' },
    contactSection: {
      subTitle: contact.sub_title ?? '',
      title: contact.title ?? '',
      email: contact.email ?? '',
    },
  };
}
