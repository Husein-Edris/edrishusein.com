import { Metadata } from 'next';
import { alternatesFor, absoluteUrl, localePath } from './i18n/paths';
import { DEFAULT_LANG, OG_LOCALE, otherLang, type Lang } from './i18n/lang';
import { decodeEntities } from './transform/decodeEntities';
import { transformPostListItem, type RestPost } from './transform/transformPost';
import { AREA_SERVED_KEYS, type AreaServedKey, type Service } from './transform/transformService';
import { servicePath } from './services';

// Enhanced SEO types for RankMath
export interface RankMathSEO {
  title?: string;
  metaDesc?: string;
  canonical?: string;
  robots?: string[];
  focusKeywords?: string[];
  opengraphImage?: {
    sourceUrl: string;
    altText?: string;
  };
  twitterImage?: {
    sourceUrl: string;
    altText?: string;
  };
  breadcrumbs?: {
    text: string;
    url: string;
  }[];
  schema?: {
    pageType?: string;
    articleType?: string;
  };
  social?: {
    facebook?: {
      title?: string;
      description?: string;
      image?: string;
    };
    twitter?: {
      title?: string;
      description?: string;
      image?: string;
      cardType?: string;
    };
  };
}

interface FallbackData {
  title: string;
  description?: string;
  path: string;
  type?: 'website' | 'article';
  /** Page language; `path` is the English path. */
  lang?: Lang;
}

export function generateEnhancedMetadata(
  seoData: RankMathSEO | null, 
  fallbackData: FallbackData
): Metadata {
  const lang = fallbackData.lang ?? DEFAULT_LANG;
  const canonicalUrl = seoData?.canonical || absoluteUrl(fallbackData.path, lang);
  
  return {
    title: seoData?.title || fallbackData.title,
    description: seoData?.metaDesc || fallbackData.description,
    robots: seoData?.robots?.join(', ') || 'index, follow',
    keywords: seoData?.focusKeywords?.join(', '),
    alternates: {
      canonical: canonicalUrl,
      languages: alternatesFor(fallbackData.path, lang).languages,
    },
    openGraph: {
      title: seoData?.social?.facebook?.title || seoData?.title || fallbackData.title,
      description: seoData?.social?.facebook?.description || seoData?.metaDesc || fallbackData.description,
      url: canonicalUrl,
      siteName: 'Edris Husein',
      images: seoData?.opengraphImage?.sourceUrl ? [{
        url: seoData.opengraphImage.sourceUrl,
        alt: seoData.opengraphImage.altText || fallbackData.title,
      }] : [],
      type: fallbackData.type === 'article' ? 'article' : 'website',
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[otherLang(lang)]],
    },
    twitter: {
      card: (seoData?.social?.twitter?.cardType as any) || 'summary_large_image',
      title: seoData?.social?.twitter?.title || seoData?.title || fallbackData.title,
      description: seoData?.social?.twitter?.description || seoData?.metaDesc || fallbackData.description,
      images: seoData?.twitterImage?.sourceUrl ? [seoData.twitterImage.sourceUrl] : 
              seoData?.opengraphImage?.sourceUrl ? [seoData.opengraphImage.sourceUrl] : [],
    }
  };
}

// Serialize a JSON-LD object for safe embedding inside a <script> tag.
// JSON.stringify alone does not escape `<`, `>`, `&`, or the JS line separators
// U+2028/U+2029, so a value containing `</script>` (e.g. a malicious CMS title)
// could break out of the script element. Escaping these closes that XSS vector.
export function safeJsonLd(data: object): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

// Generate structured data for better SEO
export function generateStructuredData(type: string, data: any): object {
  const baseData = {
    "@context": "https://schema.org",
    "@type": type,
  };

  switch (type) {
    case "BlogPosting":
      return {
        ...baseData,
        headline: data.title,
        description: data.description || data.excerpt,
        author: {
          "@type": "Person",
          name: data.author?.name || "Edris Husein",
          url: "https://edrishusein.com/about"
        },
        datePublished: data.date,
        dateModified: data.modifiedDate || data.date,
        image: data.featuredImage?.node?.sourceUrl,
        url: data.canonical || `https://edrishusein.com/notebook/${data.slug}`,
        mainEntityOfPage: {
          "@type": "WebPage",
          "@id": data.canonical || `https://edrishusein.com/notebook/${data.slug}`
        },
        publisher: {
          "@type": "Person",
          name: "Edris Husein",
          url: "https://edrishusein.com"
        }
      };
    
    case "WebPage":
      return {
        ...baseData,
        name: data.title,
        description: data.description,
        url: data.canonical,
        ...(data.inLanguage ? { inLanguage: data.inLanguage } : {}),
        // Minimal stub of the Person entity declared fully in the homepage
        // @graph. The shared @id joins them site-wide; name/url keep the node
        // resolvable when Google parses this page on its own.
        mainEntity: {
          "@type": "Person",
          "@id": "https://edrishusein.com/#person",
          name: "Edris Husein",
          url: "https://edrishusein.com"
        }
      };

    case "CreativeWork":
      return {
        ...baseData,
        name: data.title,
        description: data.description,
        author: {
          "@type": "Person",
          name: "Edris Husein"
        },
        url: data.canonical,
        ...(data.inLanguage ? { inLanguage: data.inLanguage } : {}),
        image: data.featuredImage?.node?.sourceUrl,
        dateCreated: data.date,
        genre: "Web Development"
      };
    
    default:
      return baseData;
  }
}

// Generate homepage structured data: a Person entity (the site owner), the
// ProfessionalService he runs, and a WebSite entity, emitted together as a
// schema.org @graph. Person + WebSite carry the personal-brand entity signals
// (name, role, canonical URL, verified profiles); ProfessionalService carries the
// local-search signals (place, area served, languages). No priceRange: rates are
// never published.
const SITE_URL = 'https://edrishusein.com';

type AreaServedNode = Readonly<{ "@type": "AdministrativeArea" | "Country"; name: string }>;

// The places the business serves, keyed by the service `area_served` checkbox
// values. Shared by the homepage ProfessionalService and every Service node so
// both state the same areas.
export const AREA_SERVED: Readonly<Record<AreaServedKey, AreaServedNode>> = Object.freeze({
  vorarlberg: Object.freeze({ "@type": "AdministrativeArea", name: "Vorarlberg" }),
  austria: Object.freeze({ "@type": "Country", name: "Austria" }),
  switzerland: Object.freeze({ "@type": "Country", name: "Switzerland" }),
  germany: Object.freeze({ "@type": "Country", name: "Germany" }),
});

const SERVICE_ID = `${SITE_URL}/#service`;
const SERVICE_NAME = "Edris Husein, Web Development";

export function generateHomepageStructuredData(lang: Lang = DEFAULT_LANG): object {
  // The German homepage adds its own WebPage node (inLanguage de-AT), tied to
  // the shared WebSite and service entities.
  const germanPage =
    lang === 'de'
      ? [
          {
            "@type": "WebPage",
            "@id": `${SITE_URL}/de#webpage`,
            url: `${SITE_URL}/de`,
            inLanguage: "de-AT",
            isPartOf: { "@id": `${SITE_URL}/#website` },
            about: { "@id": `${SITE_URL}/#service` },
          },
        ]
      : [];
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Edris Husein",
        jobTitle: "Web Developer",
        url: SITE_URL,
        image: `${SITE_URL}/images/Edris-Husein-Hero.png`,
        description: "Web developer in Dornbirn, Vorarlberg, Austria. Builds, fixes and maintains WordPress sites and web apps for businesses and agencies.",
        knowsAbout: ["Web Development", "React", "Next.js", "TypeScript", "WordPress", "UI/UX Design", "SEO"],
        knowsLanguage: ["en", "de"],
        // Public business address, identical to the live imprint page.
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dornbirn",
          postalCode: "6850",
          addressCountry: "AT"
        },
        sameAs: [
          "https://github.com/Husein-Edris",
          "https://www.linkedin.com/in/edris-husein/"
        ]
      },
      {
        "@type": "ProfessionalService",
        "@id": SERVICE_ID,
        name: SERVICE_NAME,
        url: SITE_URL,
        image: `${SITE_URL}/images/Edris-Husein-Hero.png`,
        email: "kontakt@edrishusein.com",
        description: "WordPress websites, maintenance, fixes and web apps for businesses and agencies in Vorarlberg, Austria, Switzerland and Germany.",
        founder: { "@id": `${SITE_URL}/#person` },
        address: {
          "@type": "PostalAddress",
          addressLocality: "Dornbirn",
          addressRegion: "Vorarlberg",
          postalCode: "6850",
          addressCountry: "AT"
        },
        areaServed: AREA_SERVED_KEYS.map((key) => AREA_SERVED[key]),
        knowsAbout: ["WordPress", "WooCommerce", "Website maintenance", "Web Development", "Next.js", "React"],
        knowsLanguage: ["de", "en"],
        sameAs: [
          "https://github.com/Husein-Edris",
          "https://www.linkedin.com/in/edris-husein/"
        ]
      },
      {
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Edris Husein",
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#person` }
      },
      ...germanPage
    ]
  };
}

// Complete Open Graph block for a static page. Page-level `openGraph` replaces
// the root layout's whole openGraph object (Next merges metadata per top-level
// key), so a page adding just og:url would silently lose the shared image and
// locale; this helper keeps every required tag together.
export function pageOpenGraph(data: {
  title: string;
  description: string;
  /** English path; localized with `lang`. */
  path: string;
  lang?: Lang;
  imageAlt?: string;
}) {
  const lang = data.lang ?? DEFAULT_LANG;
  return {
    title: data.title,
    description: data.description,
    url: localePath(data.path, lang),
    type: 'website' as const,
    locale: OG_LOCALE[lang],
    alternateLocale: [OG_LOCALE[otherLang(lang)]],
    images: [
      {
        url: '/images/Edris-Husein-Hero.png',
        width: 450,
        height: 450,
        alt: data.imageAlt ?? 'Edris Husein - Web Developer',
      },
    ],
  };
}

// Minimal Person stub carrying the site-wide entity @id. The full Person node
// (image, address, sameAs, ...) lives only in the homepage @graph; pages embed
// this stub so their schema stays resolvable when parsed in isolation.
function personRef(): object {
  return {
    "@type": "Person",
    "@id": `${SITE_URL}/#person`,
    name: "Edris Husein",
    url: SITE_URL,
  };
}

// ProfilePage for /about: the strongest "this page is about this person" signal
// schema.org offers, and the join point between the site and the name SERP.
export function generateProfilePageStructuredData(data: { title: string; description: string; lang?: Lang }): object {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: data.title,
    description: data.description,
    url: absoluteUrl('/about', data.lang),
    ...(data.lang ? { inLanguage: data.lang } : {}),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: personRef(),
  };
}

// ContactPage for /contact, tied to the same Person entity.
export function generateContactPageStructuredData(
  description: string,
  options: { lang?: Lang; name?: string } = {}
): object {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: options.name ?? "Contact Edris Husein",
    description,
    url: absoluteUrl('/contact', options.lang),
    ...(options.lang ? { inLanguage: options.lang } : {}),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: personRef(),
  };
}

export interface CollectionListingItem {
  title: string;
  /** Site-relative ("/notebook/slug") or already-absolute URL. */
  path: string;
}

export interface CollectionListing {
  name: string;
  description: string;
  /** Site-relative path of the listing page itself, e.g. "/notebook". */
  path: string;
  items: CollectionListingItem[];
  /** Page language; adds inLanguage. Paths are passed already localized. */
  lang?: Lang;
}

// Google shows about 155 characters of a meta description before it truncates.
const META_DESCRIPTION_MAX = 155;

// Plain text from CMS-rendered HTML. Tags collapse to a space so adjacent blocks
// don't glue words together, and entities (`&#8217;`, `&amp;`) are decoded so
// they neither show literally nor count toward a length limit.
function plainTextFrom(html: string | null | undefined): string {
  if (!html) return '';
  return decodeEntities(html.replace(/<[^>]*>/g, ' '))
    .replace(/\s+/g, ' ')
    .trim();
}

// Build a meta description from CMS-rendered HTML (post/project excerpts).
// WordPress returns excerpts as `<p>text </p>\n`, so naively stripping tags left
// a trailing newline inside the content attribute of every short excerpt.
// Longer text is cut on the last word boundary within the limit; a single word
// longer than the limit is cut hard.
export function metaDescriptionFrom(html: string | null | undefined, maxLength = META_DESCRIPTION_MAX): string {
  const text = plainTextFrom(html);
  if (text.length <= maxLength) return text;

  const window = text.slice(0, maxLength + 1);
  const lastSpace = window.lastIndexOf(' ');
  return (lastSpace > 0 ? window.slice(0, lastSpace) : text.slice(0, maxLength)).trimEnd();
}

/**
 * The languages an article exists in. A post whose own text (title, excerpt and
 * the start of the content, the same guess the notebook cards use) is German has
 * no English version: its English URL shows German text, so only `de` counts.
 * Pass the REST post as fetched, before localizeRestItem, so a German
 * translation of an English post is not mistaken for a German original.
 */
export function articleLanguageVersions(post: RestPost): Lang[] {
  return transformPostListItem(post).language === 'de' ? ['de'] : ['en', 'de'];
}

export interface CollectionListItemLd {
  "@type": "ListItem";
  position: number;
  name: string;
  url: string;
}

export interface CollectionPageLd {
  "@context": "https://schema.org";
  "@type": "CollectionPage";
  name: string;
  description: string;
  url: string;
  inLanguage?: string;
  isPartOf: { "@id": string };
  mainEntity: {
    "@type": "ItemList";
    numberOfItems: number;
    itemListElement: CollectionListItemLd[];
  };
}

function siteRelativeUrl(path: string): string {
  return path.startsWith('http') ? path : `${SITE_URL}${path}`;
}

// Structured data for the two hub/listing pages (/notebook, /projects). Their
// children were previously reachable only as bare <a> tags, so nothing told
// Google the page IS a collection or which entries belong to it. CollectionPage
// + ItemList states the membership explicitly and ties it back to the WebSite
// entity declared on the homepage.
export function generateCollectionPageStructuredData(listing: CollectionListing): CollectionPageLd {
  return {
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: listing.name,
    description: listing.description,
    url: siteRelativeUrl(listing.path),
    ...(listing.lang ? { inLanguage: listing.lang } : {}),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listing.items.length,
      itemListElement: listing.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: siteRelativeUrl(item.path),
      })),
    },
  };
}

// Generate breadcrumb structured data
export function generateBreadcrumbStructuredData(breadcrumbs: { text: string; url: string }[]): object {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: breadcrumbs.map((breadcrumb, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: breadcrumb.text,
      item: breadcrumb.url
    }))
  };
}

export interface ServiceBreadcrumbLabels {
  /** First crumb, e.g. Site Content chrome.breadcrumbHome. */
  home: string;
  /** Second crumb, the /services index name. */
  services: string;
}

// Schema inLanguage per page language, same values as the homepage WebPage node.
const SCHEMA_LANGUAGE: Readonly<Record<Lang, string>> = { en: 'en', de: 'de-AT' };

/**
 * One @graph for a service page: the Service (provided by the homepage
 * ProfessionalService), a FAQPage when the page shows FAQ entries, and the
 * BreadcrumbList. No offers, priceRange or ratings: prices are never published
 * and there is no rating data. Serialize the result with safeJsonLd().
 */
export function generateServicePageStructuredData(
  service: Service,
  lang: Lang,
  labels: ServiceBreadcrumbLabels
): object {
  const url = `${SITE_URL}${servicePath(service, lang)}`;
  const description = service.seoDescription || metaDescriptionFrom(service.excerpt);

  const serviceNode = {
    "@type": "Service",
    "@id": `${url}#service`,
    name: service.headline,
    ...(service.serviceType ? { serviceType: service.serviceType } : {}),
    ...(description ? { description } : {}),
    url,
    inLanguage: SCHEMA_LANGUAGE[lang],
    provider: { "@type": "ProfessionalService", "@id": SERVICE_ID, name: SERVICE_NAME, url: SITE_URL },
    ...(service.areaServed.length > 0 ? { areaServed: service.areaServed.map((key) => AREA_SERVED[key]) } : {}),
  };

  const faqNode =
    service.faq.length > 0
      ? [
          {
            "@type": "FAQPage",
            "@id": `${url}#faq`,
            mainEntity: service.faq.map((entry) => ({
              "@type": "Question",
              name: entry.question,
              acceptedAnswer: { "@type": "Answer", text: plainTextFrom(entry.answerHtml) },
            })),
          },
        ]
      : [];

  // Inside a @graph the node inherits the graph's @context.
  const breadcrumb = generateBreadcrumbStructuredData([
    { text: labels.home, url: absoluteUrl('/', lang) },
    { text: labels.services, url: absoluteUrl('/services', lang) },
    { text: service.title, url },
  ]);
  const breadcrumbNode = Object.fromEntries(Object.entries(breadcrumb).filter(([key]) => key !== "@context"));

  return {
    "@context": "https://schema.org",
    "@graph": [serviceNode, ...faqNode, breadcrumbNode],
  };
}
