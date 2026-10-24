import type { Lang } from './lang';

// Interface text that is not editorial and so not on the CMS "Site Content"
// page: screen-reader text, ARIA labels, cookie-technical text, the error page
// and metadata fallbacks. Page names, page meta and other visible copy live in
// Site Content (src/lib/transform/transformSiteContent.ts) and are editable there.

const en = {
  logoAlt: 'Edris Husein Logo',
  primaryNavLabel: 'Primary',
  footerNavLabel: 'Footer',
  openMenu: 'Open menu',
  closeMenu: 'Close menu',
  breadcrumbLabel: 'Breadcrumb',
  /** Appended (in brackets, screen readers only) to links that open a new tab. */
  opensInNewTab: 'opens in a new tab',
  /** {host} is the linked site's domain. */
  opensHostInNewTab: 'opens {host} in a new tab',
  technologiesLabel: 'Technologies',
  viewMore: 'VIEW MORE',
  selectedProjects: 'Selected projects',
  backToTopLabel: 'Back to top',
  backToTopText: '↑ Back to Top',
  lastUpdated: 'Last updated:',
  /** {title} is the project title, {index} the image number. */
  galleryImageAlt: '{title} gallery image {index}',
  contactHeading: 'Contact Edris Husein',
  ogImageAlt: 'Edris Husein - Web Developer',
  homeOgDescription:
    'Web developer in Dornbirn, Vorarlberg. WordPress sites, maintenance, fixes and web apps for businesses and agencies.',
  keywords:
    'Edris Husein, web developer Vorarlberg, WordPress developer Austria, WordPress Entwickler Vorarlberg, Webentwickler Dornbirn, WordPress maintenance, Next.js',
  untitled: 'Untitled',
  projectFallbackTitle: 'Project | Projects - Edris Husein',
  projectFallbackDescription: 'View this project by Edris Husein',
  articleFallbackTitle: 'Article | Notebook - Edris Husein',
  articleFallbackDescription: "Read more on Edris Husein's notebook",
  /** {title} is the page title. Meta description of a legal page without its own. */
  legalFallbackDescription: '{title} - Edris Husein',
  legalCookieNotice: 'You can manage your cookie preferences at any time by clicking',
  cookieConsentRegion: 'Cookie consent',
  cookieSettingsIntro:
    'Manage your cookie preferences to control how we collect and use data on this website. You can change these settings at any time.',
  cookiePreferences: {
    loading: 'Loading preferences...',
    title: 'Cookie Preferences',
    description:
      'Choose which cookies you want to accept. You can change these settings at any time. Essential cookies are required for the website to function and cannot be disabled.',
    required: 'Required',
    enabled: 'Enabled',
    disabled: 'Disabled',
    acceptAll: 'Accept All Cookies',
    rejectAll: 'Reject All Optional',
    save: 'Save My Preferences',
    cancel: 'Cancel',
    savedAlert: 'Your cookie preferences have been saved.',
    errorAlert: 'There was an issue saving your preferences, but they have been applied for this session.',
  },
  cookieCategories: {
    essential: {
      title: 'Essential Cookies',
      description:
        'These cookies are necessary for the website to function and cannot be switched off. They are usually only set in response to actions made by you which amount to a request for services, such as setting your privacy preferences.',
    },
    analytics: {
      title: 'Analytics Cookies',
      description:
        'These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. We only use analytics if you consent to it.',
    },
    functional: {
      title: 'Functional Cookies',
      description:
        'These cookies enable enhanced functionality and personalization, such as remembering your preferences and settings.',
    },
    marketing: {
      title: 'Marketing Cookies',
      description:
        'These cookies are used for advertising and marketing purposes. We do not currently use any marketing or advertising cookies.',
    },
  },
  testimonials: {
    /** Screen-reader suffix of the Prev/Next buttons ("Prev quote"). */
    quote: 'quote',
    /** Screen-reader counter: "Quote 2 of 7". */
    counterPrefix: 'Quote',
    counterOf: 'of',
  },
  error: {
    heading: 'Something went wrong!',
    text: 'We encountered an error while loading the page.',
    retry: 'Try again',
  },
  notFoundMeta: {
    title: 'Page Not Found - Edris Husein',
    description: 'The page you are looking for could not be found.',
  },
};

type Widen<T> = { readonly [K in keyof T]: T[K] extends string ? string : Widen<T[K]> };

export type Dictionary = Widen<typeof en>;

const de: Dictionary = {
  logoAlt: 'Logo von Edris Husein',
  primaryNavLabel: 'Hauptnavigation',
  footerNavLabel: 'Fußzeile',
  openMenu: 'Menü öffnen',
  closeMenu: 'Menü schließen',
  breadcrumbLabel: 'Brotkrümelnavigation',
  opensInNewTab: 'öffnet in einem neuen Tab',
  opensHostInNewTab: 'öffnet {host} in einem neuen Tab',
  technologiesLabel: 'Technologien',
  viewMore: 'MEHR ANSEHEN',
  selectedProjects: 'Ausgewählte Projekte',
  backToTopLabel: 'Zurück nach oben',
  backToTopText: '↑ Nach oben',
  lastUpdated: 'Zuletzt aktualisiert:',
  galleryImageAlt: '{title}, Galeriebild {index}',
  contactHeading: 'Kontakt zu Edris Husein',
  ogImageAlt: 'Edris Husein, Webentwickler',
  homeOgDescription:
    'Webentwickler in Dornbirn, Vorarlberg: WordPress-Websites, Wartung, Fehlerbehebung und Webanwendungen für Unternehmen und Agenturen.',
  keywords:
    'Edris Husein, WordPress Entwickler Vorarlberg, Webentwickler Dornbirn, WordPress Wartung Österreich, Website erstellen Vorarlberg, Next.js',
  untitled: 'Ohne Titel',
  projectFallbackTitle: 'Projekt | Projekte - Edris Husein',
  projectFallbackDescription: 'Ein Projekt von Edris Husein',
  articleFallbackTitle: 'Artikel | Notizbuch - Edris Husein',
  articleFallbackDescription: 'Mehr im Notizbuch von Edris Husein',
  legalFallbackDescription: '{title} - Edris Husein',
  legalCookieNotice: 'Sie können Ihre Cookie-Einstellungen jederzeit ändern unter',
  cookieConsentRegion: 'Cookie-Zustimmung',
  cookieSettingsIntro:
    'Legen Sie fest, welche Daten diese Website erheben und verwenden darf. Sie können diese Einstellungen jederzeit ändern.',
  cookiePreferences: {
    loading: 'Einstellungen werden geladen...',
    title: 'Cookie-Einstellungen',
    description:
      'Wählen Sie, welche Cookies Sie zulassen möchten. Sie können diese Einstellungen jederzeit ändern. Notwendige Cookies sind für den Betrieb der Website erforderlich und lassen sich nicht deaktivieren.',
    required: 'Erforderlich',
    enabled: 'Aktiviert',
    disabled: 'Deaktiviert',
    acceptAll: 'Alle Cookies akzeptieren',
    rejectAll: 'Alle optionalen ablehnen',
    save: 'Auswahl speichern',
    cancel: 'Abbrechen',
    savedAlert: 'Ihre Cookie-Einstellungen wurden gespeichert.',
    errorAlert: 'Ihre Einstellungen konnten nicht gespeichert werden, gelten aber für diese Sitzung.',
  },
  cookieCategories: {
    essential: {
      title: 'Notwendige Cookies',
      description:
        'Diese Cookies sind für den Betrieb der Website erforderlich und können nicht deaktiviert werden. Sie werden nur als Reaktion auf Ihre eigenen Aktionen gesetzt, etwa wenn Sie Ihre Datenschutzeinstellungen festlegen.',
    },
    analytics: {
      title: 'Analyse-Cookies',
      description:
        'Diese Cookies helfen zu verstehen, wie Besucherinnen und Besucher die Website nutzen, indem sie Informationen anonym erfassen und auswerten. Analysen laufen nur mit Ihrer Zustimmung.',
    },
    functional: {
      title: 'Funktionale Cookies',
      description:
        'Diese Cookies ermöglichen erweiterte Funktionen und Personalisierung, etwa das Speichern Ihrer Einstellungen.',
    },
    marketing: {
      title: 'Marketing-Cookies',
      description:
        'Diese Cookies dienen Werbe- und Marketingzwecken. Derzeit werden keine Marketing- oder Werbe-Cookies verwendet.',
    },
  },
  testimonials: {
    quote: 'Zitat',
    counterPrefix: 'Zitat',
    counterOf: 'von',
  },
  error: {
    heading: 'Etwas ist schiefgelaufen.',
    text: 'Beim Laden der Seite ist ein Fehler aufgetreten.',
    retry: 'Erneut versuchen',
  },
  notFoundMeta: {
    title: 'Seite nicht gefunden - Edris Husein',
    description: 'Die gesuchte Seite wurde nicht gefunden.',
  },
};

export const DICTIONARY: Readonly<Record<Lang, Dictionary>> = { en, de };

export function dictionary(lang: Lang): Dictionary {
  return DICTIONARY[lang] ?? DICTIONARY.en;
}

/** Label of the header language switch, keyed by the language it switches to. */
export const LANG_SWITCH: Readonly<Record<Lang, { label: string; title: string }>> = {
  en: { label: 'EN', title: 'English version' },
  de: { label: 'DE', title: 'Deutsche Version' },
};
