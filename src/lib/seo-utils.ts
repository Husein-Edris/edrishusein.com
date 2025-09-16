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
        mainEntity: {
          "@type": "Person",
          name: "Edris Husein",
          jobTitle: "Full-stack Developer",
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