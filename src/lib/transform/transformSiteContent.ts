import { cmsText } from '../cms-text';

// Template and archive text from the CMS "Site Content" options page
// (theme inc/acf-fields/site-content.php, REST /wp-json/headless/v1/site-content).
// Each default below renders until its field is filled in WP admin, and matches
// the field's default_value there. Map: docs/acf-content-map.md.
export const SITE_CONTENT_DEFAULTS = {
  projectsArchive: {
    title: 'PROJECTS',
    subtitle: 'Web development case studies: Next.js, WordPress and more',
    countLabel: 'case studies',
    featuredLabel: 'Featured project',
    moreProjectsHeading: 'More projects',
  },
  projectCards: {
    readCaseStudyLabel: 'Read case study',
    visitLiveSiteLabel: 'Visit live site',
  },
  caseStudy: {
    challengeHeading: 'The Challenge',
    solutionHeading: 'The Solution',
    factsHeading: 'Project facts',
    factsClientLabel: 'Client',
    factsRoleLabel: 'Role',
    factsYearLabel: 'Year',
    factsBuiltAtLabel: 'Built at',
    factsStackLabel: 'Stack',
    factsLiveSiteLabel: 'Live site',
    factsGithubLabel: 'GitHub',
    keyFeaturesHeading: 'Key Features',
    galleryHeading: 'Project Gallery',
    moreProjectsHeading: 'More Projects',
    lightboxCloseLabel: 'Close',
    lightboxPreviousLabel: 'Previous image',
    lightboxNextLabel: 'Next image',
    lightboxCounterFormat: '{current} / {total}',
  },
  contactPage: {
    subtitle: 'Freelance WordPress and Next.js work',
    heading: 'Start a project',
    intro:
      'Open to freelance projects, collaborations, or just a chat about web development. I build WordPress sites, headless setups, and React or Next.js applications, mostly for agencies and small teams in Austria and Germany, though remote work anywhere is fine. If you are writing about a project, a rough scope and timeline helps me give you a useful answer instead of a vague one. I usually reply within a day.',
    email: 'kontakt@edrishusein.com',
  },
  notebookPage: {
    title: 'NOTEBOOK',
    subtitle: 'Articles and notes on Next.js, WordPress and the web',
    emptyMessage: 'No posts available at the moment. Please check back later.',
    // {minutes} is replaced by the reading time; also used in the article header.
    readingTimeFormat: '{minutes} min read',
    languageDeLabel: 'DE',
    languageEnLabel: 'EN',
  },
  bookshelfPage: {
    title: 'BOOKSHELF',
    lead: "Books and pieces of wisdom I've enjoyed reading",
    // Paragraphs are separated by a blank line (see toParagraphs).
    intro:
      'Most of what I know about building software came from the work itself, but these shaped how I think about it: how to structure a system, and how to write something a colleague can still read six months later.' +
      '\n\n' +
      'The list covers software and design, plus a few books with nothing to do with either. I add to it when something earns a place.',
    emptyMessage: 'Bookshelf is currently being updated. Please check back later.',
  },
  techStackPage: {
    title: 'TECH STACK',
    intro: 'The dev tools, apps, devices, and games I use and play with',
    emptyMessage: 'Tech stack information is currently being updated. Please check back later.',
    filterLabel: 'Filter tools by category',
    allLabel: 'All',
    otherLabel: 'Other',
    // {count} is replaced by the number of visible tools.
    statusFormat: '{count} tools shown',
    countNone: 'No case study yet',
    countOne: '1 case study',
    // {count} is replaced by the number of case studies.
    countMany: '{count} case studies',
  },
  articleTemplate: {
    authorHeading: 'About the Author',
    authorBioFallback: 'Full-stack developer passionate about modern web technologies.',
    tagsHeading: 'Tags',
    moreArticlesHeading: 'More Articles',
    tocHeading: 'On this page',
  },
  footer: {
    imprintLabel: 'Imprint',
    privacyPolicyLabel: 'Privacy Policy',
    cookieSettingsLabel: 'Cookie Settings',
  },
  notFound: {
    heading: 'Not Found',
    text: 'Could not find the requested resource',
    homeLinkLabel: 'Return Home',
  },
  cookieBanner: {
    text: 'Analytics cookies only with your consent.',
    privacyLinkLabel: 'Privacy policy',
    rejectLabel: 'Reject all',
    acceptLabel: 'Accept all',
    settingsLabel: 'Settings',
  },
} as const;

type Strings<T> = { readonly [K in keyof T]: string };

export interface SiteContent {
  projectsArchive: Strings<typeof SITE_CONTENT_DEFAULTS.projectsArchive>;
  projectCards: Strings<typeof SITE_CONTENT_DEFAULTS.projectCards>;
  caseStudy: Strings<typeof SITE_CONTENT_DEFAULTS.caseStudy>;
  contactPage: Strings<typeof SITE_CONTENT_DEFAULTS.contactPage>;
  notebookPage: Strings<typeof SITE_CONTENT_DEFAULTS.notebookPage>;
  bookshelfPage: Strings<typeof SITE_CONTENT_DEFAULTS.bookshelfPage>;
  techStackPage: Strings<typeof SITE_CONTENT_DEFAULTS.techStackPage>;
  articleTemplate: Strings<typeof SITE_CONTENT_DEFAULTS.articleTemplate>;
  footer: Strings<typeof SITE_CONTENT_DEFAULTS.footer>;
  notFound: Strings<typeof SITE_CONTENT_DEFAULTS.notFound>;
  cookieBanner: Strings<typeof SITE_CONTENT_DEFAULTS.cookieBanner>;
}

export type FooterContent = SiteContent['footer'];
export type CookieBannerContent = SiteContent['cookieBanner'];

/** Raw REST shape: flat ACF option names. Any key may be missing, '' or null. */
export type RestSiteContent = Partial<Record<string, unknown>>;

function text(raw: RestSiteContent, name: string, fallback: string): string {
  const value = raw[name];
  return cmsText(typeof value === 'string' ? value : undefined, fallback);
}

export function transformSiteContent(input: unknown): SiteContent {
  const raw: RestSiteContent =
    input && typeof input === 'object' && !Array.isArray(input) ? (input as RestSiteContent) : {};
  const d = SITE_CONTENT_DEFAULTS;

  return {
    projectsArchive: {
      title: text(raw, 'projects_archive_title', d.projectsArchive.title),
      subtitle: text(raw, 'projects_archive_subtitle', d.projectsArchive.subtitle),
      countLabel: text(raw, 'projects_archive_count_label', d.projectsArchive.countLabel),
      featuredLabel: text(raw, 'projects_archive_featured_label', d.projectsArchive.featuredLabel),
      moreProjectsHeading: text(raw, 'projects_archive_more_heading', d.projectsArchive.moreProjectsHeading),
    },
    projectCards: {
      readCaseStudyLabel: text(raw, 'project_card_read_case_study_label', d.projectCards.readCaseStudyLabel),
      visitLiveSiteLabel: text(raw, 'project_card_visit_live_site_label', d.projectCards.visitLiveSiteLabel),
    },
    caseStudy: {
      challengeHeading: text(raw, 'case_study_challenge_heading', d.caseStudy.challengeHeading),
      solutionHeading: text(raw, 'case_study_solution_heading', d.caseStudy.solutionHeading),
      factsHeading: text(raw, 'case_study_facts_heading', d.caseStudy.factsHeading),
      factsClientLabel: text(raw, 'case_study_facts_client_label', d.caseStudy.factsClientLabel),
      factsRoleLabel: text(raw, 'case_study_facts_role_label', d.caseStudy.factsRoleLabel),
      factsYearLabel: text(raw, 'case_study_facts_year_label', d.caseStudy.factsYearLabel),
      factsBuiltAtLabel: text(raw, 'case_study_facts_built_at_label', d.caseStudy.factsBuiltAtLabel),
      factsStackLabel: text(raw, 'case_study_facts_stack_label', d.caseStudy.factsStackLabel),
      factsLiveSiteLabel: text(raw, 'case_study_facts_live_site_label', d.caseStudy.factsLiveSiteLabel),
      factsGithubLabel: text(raw, 'case_study_facts_github_label', d.caseStudy.factsGithubLabel),
      keyFeaturesHeading: text(raw, 'case_study_features_heading', d.caseStudy.keyFeaturesHeading),
      galleryHeading: text(raw, 'case_study_gallery_heading', d.caseStudy.galleryHeading),
      moreProjectsHeading: text(raw, 'case_study_more_projects_heading', d.caseStudy.moreProjectsHeading),
      lightboxCloseLabel: text(raw, 'case_study_lightbox_close_label', d.caseStudy.lightboxCloseLabel),
      lightboxPreviousLabel: text(raw, 'case_study_lightbox_previous_label', d.caseStudy.lightboxPreviousLabel),
      lightboxNextLabel: text(raw, 'case_study_lightbox_next_label', d.caseStudy.lightboxNextLabel),
      lightboxCounterFormat: text(raw, 'case_study_lightbox_counter_format', d.caseStudy.lightboxCounterFormat),
    },
    contactPage: {
      subtitle: text(raw, 'contact_page_subtitle', d.contactPage.subtitle),
      heading: text(raw, 'contact_page_heading', d.contactPage.heading),
      intro: text(raw, 'contact_page_intro', d.contactPage.intro),
      email: text(raw, 'contact_page_email', d.contactPage.email),
    },
    notebookPage: {
      title: text(raw, 'notebook_page_title', d.notebookPage.title),
      subtitle: text(raw, 'notebook_page_subtitle', d.notebookPage.subtitle),
      emptyMessage: text(raw, 'notebook_page_empty_message', d.notebookPage.emptyMessage),
      readingTimeFormat: text(raw, 'notebook_page_reading_time_format', d.notebookPage.readingTimeFormat),
      languageDeLabel: text(raw, 'notebook_page_language_de_label', d.notebookPage.languageDeLabel),
      languageEnLabel: text(raw, 'notebook_page_language_en_label', d.notebookPage.languageEnLabel),
    },
    bookshelfPage: {
      title: text(raw, 'bookshelf_page_title', d.bookshelfPage.title),
      lead: text(raw, 'bookshelf_page_lead', d.bookshelfPage.lead),
      intro: text(raw, 'bookshelf_page_intro', d.bookshelfPage.intro),
      emptyMessage: text(raw, 'bookshelf_page_empty_message', d.bookshelfPage.emptyMessage),
    },
    techStackPage: {
      title: text(raw, 'tech_stack_page_title', d.techStackPage.title),
      intro: text(raw, 'tech_stack_page_intro', d.techStackPage.intro),
      emptyMessage: text(raw, 'tech_stack_page_empty_message', d.techStackPage.emptyMessage),
      filterLabel: text(raw, 'tech_stack_page_filter_label', d.techStackPage.filterLabel),
      allLabel: text(raw, 'tech_stack_page_all_label', d.techStackPage.allLabel),
      otherLabel: text(raw, 'tech_stack_page_other_label', d.techStackPage.otherLabel),
      statusFormat: text(raw, 'tech_stack_page_status_format', d.techStackPage.statusFormat),
      countNone: text(raw, 'tech_stack_page_count_none', d.techStackPage.countNone),
      countOne: text(raw, 'tech_stack_page_count_one', d.techStackPage.countOne),
      countMany: text(raw, 'tech_stack_page_count_many', d.techStackPage.countMany),
    },
    articleTemplate: {
      authorHeading: text(raw, 'article_author_heading', d.articleTemplate.authorHeading),
      authorBioFallback: text(raw, 'article_author_bio_fallback', d.articleTemplate.authorBioFallback),
      tagsHeading: text(raw, 'article_tags_heading', d.articleTemplate.tagsHeading),
      moreArticlesHeading: text(raw, 'article_more_articles_heading', d.articleTemplate.moreArticlesHeading),
      tocHeading: text(raw, 'article_toc_heading', d.articleTemplate.tocHeading),
    },
    footer: {
      imprintLabel: text(raw, 'footer_imprint_label', d.footer.imprintLabel),
      privacyPolicyLabel: text(raw, 'footer_privacy_policy_label', d.footer.privacyPolicyLabel),
      cookieSettingsLabel: text(raw, 'footer_cookie_settings_label', d.footer.cookieSettingsLabel),
    },
    notFound: {
      heading: text(raw, 'not_found_heading', d.notFound.heading),
      text: text(raw, 'not_found_text', d.notFound.text),
      homeLinkLabel: text(raw, 'not_found_home_link_label', d.notFound.homeLinkLabel),
    },
    cookieBanner: {
      text: text(raw, 'cookie_banner_text', d.cookieBanner.text),
      privacyLinkLabel: text(raw, 'cookie_banner_privacy_link_label', d.cookieBanner.privacyLinkLabel),
      rejectLabel: text(raw, 'cookie_banner_reject_label', d.cookieBanner.rejectLabel),
      acceptLabel: text(raw, 'cookie_banner_accept_label', d.cookieBanner.acceptLabel),
      settingsLabel: text(raw, 'cookie_banner_settings_label', d.cookieBanner.settingsLabel),
    },
  };
}

/**
 * Split a plain-text textarea value into paragraphs at blank lines. Single line
 * breaks stay inside a paragraph (the field stores new_lines '' in ACF).
 */
export function toParagraphs(value: string): string[] {
  return value
    .split(/\r?\n\s*\r?\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** Labels the projects skin of InfoCards needs on each card. */
export interface ProjectCardLabels {
  readonly featuredLabel: string;
  readonly readCaseStudyLabel: string;
  readonly visitLiveSiteLabel: string;
}

export function projectCardLabels(content: SiteContent): ProjectCardLabels {
  return {
    featuredLabel: content.projectsArchive.featuredLabel,
    readCaseStudyLabel: content.projectCards.readCaseStudyLabel,
    visitLiveSiteLabel: content.projectCards.visitLiveSiteLabel,
  };
}

/** Control labels of the case study gallery lightbox. */
export interface GalleryLightboxLabels {
  readonly close: string;
  readonly previous: string;
  readonly next: string;
  /** Contains {current} and {total}, e.g. "{current} / {total}". */
  readonly counterFormat: string;
}

export function galleryLightboxLabels(content: SiteContent): GalleryLightboxLabels {
  return {
    close: content.caseStudy.lightboxCloseLabel,
    previous: content.caseStudy.lightboxPreviousLabel,
    next: content.caseStudy.lightboxNextLabel,
    counterFormat: content.caseStudy.lightboxCounterFormat,
  };
}

/** Replace each {name} placeholder in a CMS label with its value. */
export function fillLabel(format: string, values: Readonly<Record<string, string | number>>): string {
  return format.replace(/\{(\w+)\}/g, (match, name: string) =>
    Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : match,
  );
}

export const PROJECT_CARD_LABEL_DEFAULTS: ProjectCardLabels = projectCardLabels(transformSiteContent({}));
