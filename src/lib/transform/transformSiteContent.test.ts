import { describe, it, expect } from 'vitest';
import {
  PROJECT_CARD_LABEL_DEFAULTS,
  fillLabel,
  SITE_CONTENT_DEFAULTS,
  SITE_CONTENT_DEFAULTS_DE,
  galleryLightboxLabels,
  siteContentFlatDefaults,
  projectCardLabels,
  toParagraphs,
  transformSiteContent,
} from './transformSiteContent';

describe('transformSiteContent', () => {
  it('renders every code default when the options page was never saved', () => {
    expect(transformSiteContent({})).toEqual(SITE_CONTENT_DEFAULTS);
  });

  it('treats a non-object response as empty', () => {
    expect(transformSiteContent(null)).toEqual(SITE_CONTENT_DEFAULTS);
    expect(transformSiteContent([])).toEqual(SITE_CONTENT_DEFAULTS);
    expect(transformSiteContent('oops')).toEqual(SITE_CONTENT_DEFAULTS);
  });

  it('maps each filled option to its area', () => {
    const result = transformSiteContent({
      projects_archive_title: 'WORK',
      projects_archive_subtitle: 'Sub',
      projects_archive_count_label: 'projects',
      projects_archive_featured_label: 'Client project',
      projects_archive_more_heading: 'Other work',
      project_card_read_case_study_label: 'Read it',
      project_card_visit_live_site_label: 'Open site',
      case_study_challenge_heading: 'Problem',
      case_study_solution_heading: 'Answer',
      case_study_facts_heading: 'Facts',
      case_study_facts_client_label: 'Customer',
      case_study_facts_role_label: 'Job',
      case_study_facts_year_label: 'When',
      case_study_facts_built_at_label: 'Where',
      case_study_facts_stack_label: 'Tools',
      case_study_facts_live_site_label: 'Live',
      case_study_facts_github_label: 'Code',
      case_study_features_heading: 'Features',
      case_study_gallery_heading: 'Gallery',
      case_study_more_projects_heading: 'Related',
      contact_page_subtitle: 'Hi',
      contact_page_heading: 'Write me',
      contact_page_intro: 'Intro',
      contact_page_email: 'a@b.c',
      case_study_service_label: 'Offer',
      services_page_title: 'OFFERS',
      service_faq_heading: 'Questions',
    });

    expect(result).toEqual({
      projectsArchive: {
        title: 'WORK',
        subtitle: 'Sub',
        countLabel: 'projects',
        featuredLabel: 'Client project',
        moreProjectsHeading: 'Other work',
      },
      projectCards: { readCaseStudyLabel: 'Read it', visitLiveSiteLabel: 'Open site' },
      caseStudy: {
        challengeHeading: 'Problem',
        solutionHeading: 'Answer',
        factsHeading: 'Facts',
        factsClientLabel: 'Customer',
        factsRoleLabel: 'Job',
        factsYearLabel: 'When',
        factsBuiltAtLabel: 'Where',
        factsStackLabel: 'Tools',
        factsLiveSiteLabel: 'Live',
        factsGithubLabel: 'Code',
        keyFeaturesHeading: 'Features',
        galleryHeading: 'Gallery',
        moreProjectsHeading: 'Related',
        lightboxCloseLabel: 'Close',
        lightboxPreviousLabel: 'Previous image',
        lightboxNextLabel: 'Next image',
        lightboxCounterFormat: '{current} / {total}',
        serviceLabel: 'Offer',
      },
      servicesPage: { ...SITE_CONTENT_DEFAULTS.servicesPage, title: 'OFFERS' },
      serviceTemplate: { ...SITE_CONTENT_DEFAULTS.serviceTemplate, faqHeading: 'Questions' },
      contactPage: { subtitle: 'Hi', heading: 'Write me', intro: 'Intro', email: 'a@b.c' },
      notebookPage: SITE_CONTENT_DEFAULTS.notebookPage,
      bookshelfPage: SITE_CONTENT_DEFAULTS.bookshelfPage,
      techStackPage: SITE_CONTENT_DEFAULTS.techStackPage,
      articleTemplate: SITE_CONTENT_DEFAULTS.articleTemplate,
      footer: SITE_CONTENT_DEFAULTS.footer,
      notFound: SITE_CONTENT_DEFAULTS.notFound,
      cookieBanner: SITE_CONTENT_DEFAULTS.cookieBanner,
      nav: SITE_CONTENT_DEFAULTS.nav,
      chrome: SITE_CONTENT_DEFAULTS.chrome,
      meta: SITE_CONTENT_DEFAULTS.meta,
    });
  });

  it('falls back per field for blank, null and non-string values', () => {
    const result = transformSiteContent({
      projects_archive_title: '   ',
      projects_archive_subtitle: null,
      case_study_facts_stack_label: false,
      contact_page_heading: 'Let us talk',
    });
    expect(result.projectsArchive.title).toBe('PROJECTS');
    expect(result.projectsArchive.subtitle).toBe(SITE_CONTENT_DEFAULTS.projectsArchive.subtitle);
    expect(result.caseStudy.factsStackLabel).toBe('Stack');
    expect(result.contactPage.heading).toBe('Let us talk');
    expect(result.contactPage.email).toBe('kontakt@edrishusein.com');
  });
});

describe('transformSiteContent tech stack grid labels', () => {
  it('maps the logo grid labels and falls back per field', () => {
    const result = transformSiteContent({
      tech_stack_page_all_label: 'Alle',
      tech_stack_page_other_label: 'Sonstiges',
      tech_stack_page_count_many: '{count} Fallstudien',
      tech_stack_page_count_none: '',
    });
    expect(result.techStackPage).toEqual({
      ...SITE_CONTENT_DEFAULTS.techStackPage,
      allLabel: 'Alle',
      otherLabel: 'Sonstiges',
      countMany: '{count} Fallstudien',
    });
  });
});

describe('transformSiteContent notebook and article labels', () => {
  it('maps reading time, language badges and the contents heading', () => {
    const result = transformSiteContent({
      notebook_page_reading_time_format: '{minutes} Min.',
      notebook_page_language_de_label: 'Deutsch',
      article_toc_heading: 'Inhalt',
    });
    expect(result.notebookPage.readingTimeFormat).toBe('{minutes} Min.');
    expect(result.notebookPage.languageDeLabel).toBe('Deutsch');
    expect(result.notebookPage.languageEnLabel).toBe('EN');
    expect(result.articleTemplate.tocHeading).toBe('Inhalt');
  });
});

describe('fillLabel', () => {
  it('replaces known placeholders and keeps unknown ones', () => {
    expect(fillLabel('{count} tools shown', { count: 4 })).toBe('4 tools shown');
    expect(fillLabel('{minutes} min read', { minutes: 6 })).toBe('6 min read');
    expect(fillLabel('{a} and {b}', { a: 'x' })).toBe('x and {b}');
  });
});

describe('projectCardLabels', () => {
  it('combines the archive featured label with the card link labels', () => {
    const labels = projectCardLabels(
      transformSiteContent({ projects_archive_featured_label: 'Client project', project_card_visit_live_site_label: 'Open' }),
    );
    expect(labels).toEqual({
      featuredLabel: 'Client project',
      readCaseStudyLabel: 'Read case study',
      visitLiveSiteLabel: 'Open',
    });
  });

  it('exposes the defaults InfoCards renders without CMS labels', () => {
    expect(PROJECT_CARD_LABEL_DEFAULTS).toEqual({
      featuredLabel: 'Featured project',
      readCaseStudyLabel: 'Read case study',
      visitLiveSiteLabel: 'Visit live site',
    });
  });
});

describe('galleryLightboxLabels', () => {
  it('maps the filled lightbox options and falls back per field', () => {
    const labels = galleryLightboxLabels(
      transformSiteContent({
        case_study_lightbox_close_label: 'Schliessen',
        case_study_lightbox_previous_label: '   ',
        case_study_lightbox_next_label: null,
        case_study_lightbox_counter_format: 'Bild {current} von {total}',
      }),
    );
    expect(labels).toEqual({
      close: 'Schliessen',
      previous: 'Previous image',
      next: 'Next image',
      counterFormat: 'Bild {current} von {total}',
    });
  });

  it('renders the code defaults when the options page was never saved', () => {
    expect(galleryLightboxLabels(transformSiteContent({}))).toEqual({
      close: 'Close',
      previous: 'Previous image',
      next: 'Next image',
      counterFormat: '{current} / {total}',
    });
  });
});

describe('transformSiteContent archive, template and chrome tabs', () => {
  it('maps each filled option of the newer tabs', () => {
    const result = transformSiteContent({
      notebook_page_title: 'NOTES',
      notebook_page_subtitle: 'Sub',
      notebook_page_empty_message: 'Nothing yet',
      bookshelf_page_title: 'BOOKS',
      bookshelf_page_lead: 'Lead',
      bookshelf_page_intro: 'One\n\nTwo',
      bookshelf_page_empty_message: 'No books',
      tech_stack_page_title: 'TOOLS',
      tech_stack_page_intro: 'Intro',
      tech_stack_page_empty_message: 'No tools',
      article_author_heading: 'Author',
      article_author_bio_fallback: 'Bio',
      article_tags_heading: 'Topics',
      article_more_articles_heading: 'Read next',
      footer_imprint_label: 'Impressum',
      footer_privacy_policy_label: 'Datenschutz',
      footer_cookie_settings_label: 'Cookies',
      not_found_heading: 'Missing',
      not_found_text: 'Gone',
      not_found_home_link_label: 'Home',
      cookie_banner_text: 'Text',
      cookie_banner_privacy_link_label: 'Privacy',
      cookie_banner_reject_label: 'No',
      cookie_banner_accept_label: 'Yes',
      cookie_banner_settings_label: 'Choose',
    });

    expect(result.notebookPage).toEqual({ ...SITE_CONTENT_DEFAULTS.notebookPage, title: 'NOTES', subtitle: 'Sub', emptyMessage: 'Nothing yet' });
    expect(result.bookshelfPage).toEqual({ title: 'BOOKS', lead: 'Lead', intro: 'One\n\nTwo', emptyMessage: 'No books' });
    expect(result.techStackPage).toMatchObject({ title: 'TOOLS', intro: 'Intro', emptyMessage: 'No tools' });
    expect(result.articleTemplate).toEqual({
      ...SITE_CONTENT_DEFAULTS.articleTemplate,
      authorHeading: 'Author',
      authorBioFallback: 'Bio',
      tagsHeading: 'Topics',
      moreArticlesHeading: 'Read next',
    });
    expect(result.footer).toEqual({ imprintLabel: 'Impressum', privacyPolicyLabel: 'Datenschutz', cookieSettingsLabel: 'Cookies' });
    expect(result.notFound).toEqual({ heading: 'Missing', text: 'Gone', homeLinkLabel: 'Home' });
    expect(result.cookieBanner).toEqual({
      text: 'Text',
      privacyLinkLabel: 'Privacy',
      rejectLabel: 'No',
      acceptLabel: 'Yes',
      settingsLabel: 'Choose',
    });
  });

  it('keeps the defaults equal to the text the pages rendered before', () => {
    const d = transformSiteContent({});
    expect(d.notebookPage.title).toBe('NOTEBOOK');
    expect(d.bookshelfPage.lead).toBe("Books and pieces of wisdom I've enjoyed reading");
    expect(toParagraphs(d.bookshelfPage.intro)).toHaveLength(2);
    expect(d.techStackPage.intro).toBe('The dev tools, apps, devices, and games I use and play with');
    expect(d.articleTemplate.moreArticlesHeading).toBe('More Articles');
    expect(d.footer.cookieSettingsLabel).toBe('Cookie Settings');
    expect(d.notFound.homeLinkLabel).toBe('Return Home');
    expect(d.cookieBanner.acceptLabel).toBe('Accept all');
  });
});

describe('toParagraphs', () => {
  it('splits at blank lines and keeps single line breaks inside a paragraph', () => {
    expect(toParagraphs('One\nstill one\n\n  Two  \r\n\r\nThree')).toEqual(['One\nstill one', 'Two', 'Three']);
  });

  it('drops empty paragraphs', () => {
    expect(toParagraphs('\n\nOnly\n\n\n\n')).toEqual(['Only']);
    expect(toParagraphs('')).toEqual([]);
  });
});

describe('transformSiteContent languages and new keys', () => {
  it('maps the navigation, chrome and meta keys', () => {
    const result = transformSiteContent({
      nav_projects: 'Work',
      nav_tech_stack: 'Tools',
      breadcrumb_home: 'Start',
      skip_to_content: 'Skip',
      meta_home_title: 'Home title',
      meta_cookie_settings_description: 'Cookies',
    });
    expect(result.nav).toEqual({ ...SITE_CONTENT_DEFAULTS.nav, projects: 'Work', techStack: 'Tools' });
    expect(result.chrome).toEqual({ breadcrumbHome: 'Start', skipToContent: 'Skip' });
    expect(result.meta.homeTitle).toBe('Home title');
    expect(result.meta.cookieSettingsDescription).toBe('Cookies');
    expect(result.meta.aboutTitle).toBe(SITE_CONTENT_DEFAULTS.meta.aboutTitle);
  });

  it('keeps the English defaults equal to the text the pages rendered before', () => {
    const d = transformSiteContent({});
    expect(d.meta.homeTitle).toBe('Edris Husein - Web Developer & WordPress, Vorarlberg');
    expect(d.chrome.skipToContent).toBe('Skip to main content');
    expect(d.nav.techStack).toBe('Tech Stack');
  });

  it('renders the German defaults for blank fields on German pages', () => {
    expect(transformSiteContent({}, 'de')).toEqual(SITE_CONTENT_DEFAULTS_DE);
    const result = transformSiteContent({ nav_about: 'Über uns' }, 'de');
    expect(result.nav.about).toBe('Über uns');
    expect(result.nav.projects).toBe('Projekte');
    expect(result.meta.homeTitle).toBe('WordPress-Entwickler in Vorarlberg | Edris Husein, Dornbirn');
  });

  it('has a German default for every English key, and no em dash in either', () => {
    const en = siteContentFlatDefaults('en');
    const de = siteContentFlatDefaults('de');
    expect(Object.keys(de).sort()).toEqual(Object.keys(en).sort());
    for (const value of [...Object.values(en), ...Object.values(de)]) {
      expect(value.trim()).not.toBe('');
      expect(value).not.toContain('—');
    }
  });
});

describe('siteContentFlatDefaults', () => {
  it('lists every REST option name once with its English default', () => {
    const flat = siteContentFlatDefaults();
    // 64 options existed before the German site; 24 were added with it and 9
    // with the service pages.
    expect(Object.keys(flat)).toHaveLength(97);
    expect(flat.projects_archive_title).toBe('PROJECTS');
    expect(flat.case_study_lightbox_counter_format).toBe('{current} / {total}');
    expect(flat.nav_tech_stack).toBe('Tech Stack');
    expect(flat.meta_cookie_settings_title).toBe('Cookie Settings - Edris Husein');
  });

  it('lists the service page options', () => {
    const flat = siteContentFlatDefaults();
    expect(flat).toMatchObject({
      nav_services: 'Services',
      meta_services_title: 'Web Development Services | Edris Husein',
      services_page_title: 'SERVICES',
      service_faq_heading: 'FAQ',
      case_study_service_label: 'Service',
    });
    expect(Object.keys(flat)).toEqual(
      expect.arrayContaining([
        'meta_services_description',
        'services_page_subtitle',
        'service_projects_heading',
        'service_posts_heading',
      ]),
    );
    expect(siteContentFlatDefaults('de')).toMatchObject({
      nav_services: 'Leistungen',
      meta_services_title: 'Leistungen: Websites, Relaunch, WordPress | Edris Husein',
      service_faq_heading: 'Häufige Fragen',
    });
  });

  it('round-trips: the flat defaults transform back into the code defaults', () => {
    expect(transformSiteContent(siteContentFlatDefaults('en'))).toEqual(SITE_CONTENT_DEFAULTS);
    expect(transformSiteContent(siteContentFlatDefaults('de'), 'de')).toEqual(SITE_CONTENT_DEFAULTS_DE);
  });
});
