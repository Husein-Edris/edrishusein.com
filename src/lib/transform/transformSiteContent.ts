import { cmsText } from '../cms-text';
import type { Lang } from '../i18n/lang';

// Template and archive text from the CMS "Site Content" options page
// (theme inc/acf-fields/site-content.php, REST /wp-json/headless/v1/site-content).
// Each default below renders until its field is filled in WP admin, and matches
// the field's default_value there. Map: docs/acf-content-map.md.
//
// Every key has a German sibling `<key>_de` (rendered on /de, see
// localizeSiteContent). SITE_CONTENT_DEFAULTS_DE holds the German code defaults.
// docs/i18n/site-content-en.json and site-content-de-defaults.json are flat
// exports of both (siteContentFlatDefaults), written into the CMS database.
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
  // Page names in the header and footer navigation. The header shows them in
  // capitals through CSS (Header.scss .navText), the footer as written.
  nav: {
    projects: 'Projects',
    about: 'About',
    bookshelf: 'Bookshelf',
    notebook: 'Notebook',
    techStack: 'Tech Stack',
    contact: 'Contact',
  },
  chrome: {
    breadcrumbHome: 'Home',
    skipToContent: 'Skip to main content',
  },
  // <title> and meta description per page.
  meta: {
    homeTitle: 'Edris Husein - Web Developer & WordPress, Vorarlberg',
    homeDescription:
      'Web developer in Dornbirn, Vorarlberg. I build, fix and maintain WordPress sites and web apps for businesses and agencies in Austria, Switzerland and Germany.',
    aboutTitle: 'About Edris Husein - Web Developer in Vorarlberg, Austria',
    aboutDescription:
      'About Edris Husein, a web developer from Dornbirn, Vorarlberg, building and maintaining WordPress sites and web apps for businesses and agencies.',
    projectsTitle: 'Web Development Projects & Case Studies - Edris Husein',
    projectsDescription:
      'Web development projects and case studies by Edris Husein: client websites and web apps built with Next.js, React and WordPress in Austria and Germany.',
    notebookTitle: 'Notebook: Web Development Articles - Edris Husein',
    notebookDescription:
      'Web development articles and notes by Edris Husein: Next.js, React, WordPress and SEO, written from real client projects in Austria and Germany.',
    bookshelfTitle: 'Bookshelf: Books That Shaped How I Build - Edris Husein',
    bookshelfDescription:
      'The bookshelf of Edris Husein: books on software craft, design and thinking that shaped how he structures systems and writes readable code.',
    techStackTitle: 'Tech Stack: Next.js, React & WordPress - Edris Husein',
    techStackDescription:
      'The tech stack Edris Husein builds with: Next.js, React, TypeScript and WordPress, plus the tools, apps and devices behind his web development work.',
    contactTitle: 'Contact Edris Husein - Web Developer in Vorarlberg',
    contactDescription:
      'Contact Edris Husein, a freelance web developer in Vorarlberg, Austria, for WordPress sites, maintenance, fixes and Next.js projects. Replies within a day.',
    cookieSettingsTitle: 'Cookie Settings - Edris Husein',
    cookieSettingsDescription: 'Manage your cookie preferences and privacy settings.',
  },
} as const;

type Strings<T> = { readonly [K in keyof T]: string };
type Sections = typeof SITE_CONTENT_DEFAULTS;
type SiteContentShape = { readonly [S in keyof Sections]: Strings<Sections[S]> };

// German code defaults (register: Sie). Same keys as the English ones.
export const SITE_CONTENT_DEFAULTS_DE: SiteContentShape = {
  projectsArchive: {
    title: 'PROJEKTE',
    subtitle: 'Fallstudien aus der Webentwicklung: Next.js, WordPress und mehr',
    countLabel: 'Fallstudien',
    featuredLabel: 'Ausgewähltes Projekt',
    moreProjectsHeading: 'Weitere Projekte',
  },
  projectCards: {
    readCaseStudyLabel: 'Fallstudie lesen',
    visitLiveSiteLabel: 'Website ansehen',
  },
  caseStudy: {
    challengeHeading: 'Die Herausforderung',
    solutionHeading: 'Die Lösung',
    factsHeading: 'Projektdaten',
    factsClientLabel: 'Kunde',
    factsRoleLabel: 'Rolle',
    factsYearLabel: 'Jahr',
    factsBuiltAtLabel: 'Umgesetzt bei',
    factsStackLabel: 'Technologien',
    factsLiveSiteLabel: 'Website',
    factsGithubLabel: 'GitHub',
    keyFeaturesHeading: 'Wichtigste Funktionen',
    galleryHeading: 'Projektgalerie',
    moreProjectsHeading: 'Weitere Projekte',
    lightboxCloseLabel: 'Schließen',
    lightboxPreviousLabel: 'Vorheriges Bild',
    lightboxNextLabel: 'Nächstes Bild',
    lightboxCounterFormat: '{current} / {total}',
  },
  contactPage: {
    subtitle: 'Freelance-Arbeit mit WordPress und Next.js',
    heading: 'Projekt starten',
    intro:
      'Ich bin offen für Freelance-Projekte, Zusammenarbeit oder einfach ein Gespräch über Webentwicklung. Ich baue WordPress-Websites, Headless-Setups und Anwendungen mit React oder Next.js, meist für Agenturen und kleine Teams in Österreich und Deutschland, arbeite aber auch gerne remote. Wenn Sie mir zu einem Projekt schreiben, helfen mir ein grober Umfang und ein Zeitrahmen, Ihnen eine brauchbare Antwort statt einer vagen zu geben. Ich antworte in der Regel innerhalb eines Tages.',
    email: 'kontakt@edrishusein.com',
  },
  notebookPage: {
    title: 'NOTIZBUCH',
    subtitle: 'Artikel und Notizen zu Next.js, WordPress und dem Web',
    emptyMessage: 'Im Moment sind keine Beiträge verfügbar. Bitte schauen Sie später wieder vorbei.',
    readingTimeFormat: '{minutes} Min. Lesezeit',
    languageDeLabel: 'DE',
    languageEnLabel: 'EN',
  },
  bookshelfPage: {
    title: 'BÜCHERREGAL',
    lead: 'Bücher und Gedanken, die ich gerne gelesen habe',
    intro:
      'Das meiste, was ich über Softwareentwicklung weiß, habe ich bei der Arbeit selbst gelernt. Diese Bücher haben aber geprägt, wie ich darüber denke: wie man ein System strukturiert und wie man etwas schreibt, das eine Kollegin oder ein Kollege auch sechs Monate später noch lesen kann.' +
      '\n\n' +
      'Die Liste umfasst Software und Design, dazu ein paar Bücher, die mit beidem nichts zu tun haben. Ich ergänze sie, wenn sich ein Buch seinen Platz verdient.',
    emptyMessage: 'Das Bücherregal wird gerade aktualisiert. Bitte schauen Sie später wieder vorbei.',
  },
  techStackPage: {
    title: 'TECHNOLOGIEN',
    intro: 'Die Entwicklungswerkzeuge, Apps, Geräte und Spiele, die ich nutze',
    emptyMessage: 'Die Übersicht wird gerade aktualisiert. Bitte schauen Sie später wieder vorbei.',
    filterLabel: 'Werkzeuge nach Kategorie filtern',
    allLabel: 'Alle',
    otherLabel: 'Sonstige',
    statusFormat: '{count} Werkzeuge angezeigt',
    countNone: 'Noch keine Fallstudie',
    countOne: '1 Fallstudie',
    countMany: '{count} Fallstudien',
  },
  articleTemplate: {
    authorHeading: 'Über den Autor',
    authorBioFallback: 'Full-Stack-Entwickler mit Leidenschaft für moderne Webtechnologien.',
    tagsHeading: 'Schlagwörter',
    moreArticlesHeading: 'Weitere Artikel',
    tocHeading: 'Auf dieser Seite',
  },
  footer: {
    imprintLabel: 'Impressum',
    privacyPolicyLabel: 'Datenschutzerklärung',
    cookieSettingsLabel: 'Cookie-Einstellungen',
  },
  notFound: {
    heading: 'Seite nicht gefunden',
    text: 'Die angeforderte Seite gibt es nicht.',
    homeLinkLabel: 'Zur Startseite',
  },
  cookieBanner: {
    text: 'Analyse-Cookies nur mit Ihrer Zustimmung.',
    privacyLinkLabel: 'Datenschutzerklärung',
    rejectLabel: 'Alle ablehnen',
    acceptLabel: 'Alle akzeptieren',
    settingsLabel: 'Einstellungen',
  },
  nav: {
    projects: 'Projekte',
    about: 'Über mich',
    bookshelf: 'Bücherregal',
    notebook: 'Notizbuch',
    techStack: 'Technologien',
    contact: 'Kontakt',
  },
  chrome: {
    breadcrumbHome: 'Startseite',
    skipToContent: 'Zum Hauptinhalt springen',
  },
  meta: {
    homeTitle: 'WordPress-Entwickler in Vorarlberg | Edris Husein, Dornbirn',
    homeDescription:
      'Webentwickler in Dornbirn: Ich erstelle WordPress-Websites in Vorarlberg, übernehme Wartung und Updates in ganz Österreich und repariere bestehende Seiten.',
    aboutTitle: 'Über Edris Husein - Webentwickler in Vorarlberg, Österreich',
    aboutDescription:
      'Über Edris Husein, Webentwickler aus Dornbirn in Vorarlberg: WordPress-Websites und Webanwendungen für Unternehmen und Agenturen, gebaut und betreut.',
    projectsTitle: 'Projekte und Fallstudien zur Webentwicklung - Edris Husein',
    projectsDescription:
      'Projekte und Fallstudien von Edris Husein: Kundenwebsites und Webanwendungen mit Next.js, React und WordPress in Österreich und Deutschland.',
    notebookTitle: 'Notizbuch: Artikel zur Webentwicklung - Edris Husein',
    notebookDescription:
      'Artikel und Notizen zur Webentwicklung von Edris Husein: Next.js, React, WordPress und SEO, geschrieben aus echten Kundenprojekten in Österreich und Deutschland.',
    bookshelfTitle: 'Bücherregal: Bücher, die meine Arbeit geprägt haben - Edris Husein',
    bookshelfDescription:
      'Das Bücherregal von Edris Husein: Bücher über Softwarehandwerk, Design und Denken, die geprägt haben, wie er Systeme strukturiert und lesbaren Code schreibt.',
    techStackTitle: 'Technologien: Next.js, React und WordPress - Edris Husein',
    techStackDescription:
      'Die Technologien, mit denen Edris Husein arbeitet: Next.js, React, TypeScript und WordPress, dazu die Werkzeuge, Apps und Geräte hinter seiner Arbeit.',
    contactTitle: 'Kontakt - Edris Husein, Webentwickler in Vorarlberg',
    contactDescription:
      'Kontaktieren Sie Edris Husein, freiberuflicher Webentwickler in Vorarlberg, für WordPress-Websites, Wartung, Fehlerbehebung und Next.js-Projekte. Antwort innerhalb eines Tages.',
    cookieSettingsTitle: 'Cookie-Einstellungen - Edris Husein',
    cookieSettingsDescription: 'Verwalten Sie Ihre Cookie-Einstellungen und Datenschutzoptionen.',
  },
};

// The REST option name of every field (flat ACF names on the options page).
export const SITE_CONTENT_FIELDS: { readonly [S in keyof Sections]: Strings<Sections[S]> } = {
  projectsArchive: {
    title: 'projects_archive_title',
    subtitle: 'projects_archive_subtitle',
    countLabel: 'projects_archive_count_label',
    featuredLabel: 'projects_archive_featured_label',
    moreProjectsHeading: 'projects_archive_more_heading',
  },
  projectCards: {
    readCaseStudyLabel: 'project_card_read_case_study_label',
    visitLiveSiteLabel: 'project_card_visit_live_site_label',
  },
  caseStudy: {
    challengeHeading: 'case_study_challenge_heading',
    solutionHeading: 'case_study_solution_heading',
    factsHeading: 'case_study_facts_heading',
    factsClientLabel: 'case_study_facts_client_label',
    factsRoleLabel: 'case_study_facts_role_label',
    factsYearLabel: 'case_study_facts_year_label',
    factsBuiltAtLabel: 'case_study_facts_built_at_label',
    factsStackLabel: 'case_study_facts_stack_label',
    factsLiveSiteLabel: 'case_study_facts_live_site_label',
    factsGithubLabel: 'case_study_facts_github_label',
    keyFeaturesHeading: 'case_study_features_heading',
    galleryHeading: 'case_study_gallery_heading',
    moreProjectsHeading: 'case_study_more_projects_heading',
    lightboxCloseLabel: 'case_study_lightbox_close_label',
    lightboxPreviousLabel: 'case_study_lightbox_previous_label',
    lightboxNextLabel: 'case_study_lightbox_next_label',
    lightboxCounterFormat: 'case_study_lightbox_counter_format',
  },
  contactPage: {
    subtitle: 'contact_page_subtitle',
    heading: 'contact_page_heading',
    intro: 'contact_page_intro',
    email: 'contact_page_email',
  },
  notebookPage: {
    title: 'notebook_page_title',
    subtitle: 'notebook_page_subtitle',
    emptyMessage: 'notebook_page_empty_message',
    readingTimeFormat: 'notebook_page_reading_time_format',
    languageDeLabel: 'notebook_page_language_de_label',
    languageEnLabel: 'notebook_page_language_en_label',
  },
  bookshelfPage: {
    title: 'bookshelf_page_title',
    lead: 'bookshelf_page_lead',
    intro: 'bookshelf_page_intro',
    emptyMessage: 'bookshelf_page_empty_message',
  },
  techStackPage: {
    title: 'tech_stack_page_title',
    intro: 'tech_stack_page_intro',
    emptyMessage: 'tech_stack_page_empty_message',
    filterLabel: 'tech_stack_page_filter_label',
    allLabel: 'tech_stack_page_all_label',
    otherLabel: 'tech_stack_page_other_label',
    statusFormat: 'tech_stack_page_status_format',
    countNone: 'tech_stack_page_count_none',
    countOne: 'tech_stack_page_count_one',
    countMany: 'tech_stack_page_count_many',
  },
  articleTemplate: {
    authorHeading: 'article_author_heading',
    authorBioFallback: 'article_author_bio_fallback',
    tagsHeading: 'article_tags_heading',
    moreArticlesHeading: 'article_more_articles_heading',
    tocHeading: 'article_toc_heading',
  },
  footer: {
    imprintLabel: 'footer_imprint_label',
    privacyPolicyLabel: 'footer_privacy_policy_label',
    cookieSettingsLabel: 'footer_cookie_settings_label',
  },
  notFound: {
    heading: 'not_found_heading',
    text: 'not_found_text',
    homeLinkLabel: 'not_found_home_link_label',
  },
  cookieBanner: {
    text: 'cookie_banner_text',
    privacyLinkLabel: 'cookie_banner_privacy_link_label',
    rejectLabel: 'cookie_banner_reject_label',
    acceptLabel: 'cookie_banner_accept_label',
    settingsLabel: 'cookie_banner_settings_label',
  },
  nav: {
    projects: 'nav_projects',
    about: 'nav_about',
    bookshelf: 'nav_bookshelf',
    notebook: 'nav_notebook',
    techStack: 'nav_tech_stack',
    contact: 'nav_contact',
  },
  chrome: {
    breadcrumbHome: 'breadcrumb_home',
    skipToContent: 'skip_to_content',
  },
  meta: {
    homeTitle: 'meta_home_title',
    homeDescription: 'meta_home_description',
    aboutTitle: 'meta_about_title',
    aboutDescription: 'meta_about_description',
    projectsTitle: 'meta_projects_title',
    projectsDescription: 'meta_projects_description',
    notebookTitle: 'meta_notebook_title',
    notebookDescription: 'meta_notebook_description',
    bookshelfTitle: 'meta_bookshelf_title',
    bookshelfDescription: 'meta_bookshelf_description',
    techStackTitle: 'meta_tech_stack_title',
    techStackDescription: 'meta_tech_stack_description',
    contactTitle: 'meta_contact_title',
    contactDescription: 'meta_contact_description',
    cookieSettingsTitle: 'meta_cookie_settings_title',
    cookieSettingsDescription: 'meta_cookie_settings_description',
  },
};

export type SiteContent = SiteContentShape;

export type FooterContent = SiteContent['footer'];
export type CookieBannerContent = SiteContent['cookieBanner'];
export type NavContent = SiteContent['nav'];

/** Raw REST shape: flat ACF option names. Any key may be missing, '' or null. */
export type RestSiteContent = Partial<Record<string, unknown>>;

const SECTION_KEYS = Object.keys(SITE_CONTENT_FIELDS) as Array<keyof Sections>;

function defaultsFor(lang: Lang): SiteContentShape {
  return lang === 'de' ? SITE_CONTENT_DEFAULTS_DE : SITE_CONTENT_DEFAULTS;
}

function text(raw: RestSiteContent, name: string, fallback: string): string {
  const value = raw[name];
  return cmsText(typeof value === 'string' ? value : undefined, fallback);
}

/**
 * Map the flat REST options to the nested view model. Blank fields take the
 * code default of `lang`. For German pass the response through
 * localizeSiteContent first, so `<key>_de` values replace the English ones.
 */
export function transformSiteContent(input: unknown, lang: Lang = 'en'): SiteContent {
  const raw: RestSiteContent =
    input && typeof input === 'object' && !Array.isArray(input) ? (input as RestSiteContent) : {};
  const defaults = defaultsFor(lang);

  const sections = SECTION_KEYS.map((section) => {
    const fields = SITE_CONTENT_FIELDS[section] as Record<string, string>;
    const sectionDefaults = defaults[section] as Record<string, string>;
    const values = Object.fromEntries(
      Object.entries(fields).map(([key, name]) => [key, text(raw, name, sectionDefaults[key])]),
    );
    return [section, values];
  });

  return Object.fromEntries(sections) as SiteContent;
}

/** Every REST option name with its code default in `lang`, flat (CMS seed files). */
export function siteContentFlatDefaults(lang: Lang = 'en'): Record<string, string> {
  const defaults = defaultsFor(lang);
  return Object.fromEntries(
    SECTION_KEYS.flatMap((section) =>
      Object.entries(SITE_CONTENT_FIELDS[section] as Record<string, string>).map(([key, name]) => [
        name,
        (defaults[section] as Record<string, string>)[key],
      ]),
    ),
  );
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
