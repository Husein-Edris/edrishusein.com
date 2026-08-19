import { Metadata } from 'next';

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
}

export function generateEnhancedMetadata(
  seoData: RankMathSEO | null, 
  fallbackData: FallbackData
): Metadata {
  const baseUrl = 'https://edrishusein.com';
  const canonicalUrl = seoData?.canonical || `${baseUrl}${fallbackData.path}`;
  
  return {
    title: seoData?.title || fallbackData.title,
    description: seoData?.metaDesc || fallbackData.description,
    robots: seoData?.robots?.join(', ') || 'index, follow',
    keywords: seoData?.focusKeywords?.join(', '),
    alternates: {
      canonical: canonicalUrl,
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
        image: data.featuredImage?.node?.sourceUrl,
        dateCreated: data.date,
        genre: "Web Development"
      };
    
    default:
      return baseData;
  }
}

// Generate homepage structured data: a Person entity (the site owner) plus a
// WebSite entity, emitted together as a schema.org @graph. This gives Google the
// entity signals a personal-brand homepage needs (name, role, canonical URL,
// verified social profiles) which the inner pages' page-level schema does not cover.
const SITE_URL = 'https://edrishusein.com';

export function generateHomepageStructuredData(): object {
  return {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Person",
        "@id": `${SITE_URL}/#person`,
        name: "Edris Husein",
        jobTitle: "Full-Stack Web Developer",
        url: SITE_URL,
        image: `${SITE_URL}/images/Edris-Husein-Hero.png`,
        description: "Full-stack web developer in Dornbirn, Austria, building websites and web apps with Next.js, React, TypeScript and WordPress.",
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
        "@type": "WebSite",
        "@id": `${SITE_URL}/#website`,
        name: "Edris Husein",
        url: SITE_URL,
        publisher: { "@id": `${SITE_URL}/#person` }
      }
    ]
  };
}

// Complete Open Graph block for a static page. Page-level `openGraph` replaces
// the root layout's whole openGraph object (Next merges metadata per top-level
// key), so a page adding just og:url would silently lose the shared image and
// locale; this helper keeps every required tag together.
export function pageOpenGraph(data: { title: string; description: string; path: string }) {
  return {
    title: data.title,
    description: data.description,
    url: data.path,
    type: 'website' as const,
    locale: 'en_US',
    images: [
      {
        url: '/images/Edris-Husein-Hero.png',
        width: 450,
        height: 450,
        alt: 'Edris Husein - Full-Stack Web Developer',
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
export function generateProfilePageStructuredData(data: { title: string; description: string }): object {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    name: data.title,
    description: data.description,
    url: `${SITE_URL}/about`,
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: personRef(),
  };
}

// ContactPage for /contact, tied to the same Person entity.
export function generateContactPageStructuredData(description: string): object {
  return {
    "@context": "https://schema.org",
    "@type": "ContactPage",
    name: "Contact Edris Husein",
    description,
    url: `${SITE_URL}/contact`,
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
}

// Build a meta description from CMS-rendered HTML (post/project excerpts).
// WordPress returns excerpts as `<p>text </p>\n`, so naively stripping tags left
// a trailing newline inside the content attribute of every short excerpt.
// Tags collapse to a space so adjacent blocks don't glue words together.
export function metaDescriptionFrom(html: string | null | undefined, maxLength = 160): string {
  if (!html) return '';

  const text = html
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

  return text.length <= maxLength ? text : text.slice(0, maxLength).trimEnd();
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
  isPartOf: { "@id": string };
  mainEntity: {
    "@type": "ItemList";
    numberOfItems: number;
    itemListElement: CollectionListItemLd[];
  };
}

function absoluteUrl(path: string): string {
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
    url: absoluteUrl(listing.path),
    isPartOf: { "@id": `${SITE_URL}/#website` },
    mainEntity: {
      "@type": "ItemList",
      numberOfItems: listing.items.length,
      itemListElement: listing.items.map((item, index) => ({
        "@type": "ListItem",
        position: index + 1,
        name: item.title,
        url: absoluteUrl(item.path),
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