// app/page/[slug]/page.tsx
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { Metadata } from 'next';
import { generateEnhancedMetadata, generateStructuredData, safeJsonLd } from '@/src/lib/seo-utils';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest } from '@/src/lib/rest-client';
import { transformMedia } from '@/src/lib/transform/transformMedia';
import '@/src/styles/pages/WordPressPage.scss';

// ISR — cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

// Types for WordPress page data
interface WordPressPageData {
  page: {
    id: string;
    title: string;
    content: string;
    slug: string;
    featuredImage?: {
      node: {
        sourceUrl: string;
        altText: string;
        mediaDetails: {
          width: number;
          height: number;
        };
      };
    };
    seo?: {
      title: string;
      metaDesc: string;
      opengraphImage?: {
        sourceUrl: string;
      };
    };
  };
}

async function getWordPressPage(slug: string): Promise<WordPressPageData | null> {
  try {
    const pages = await cmsRest<Array<{
      id: number | string;
      slug: string;
      title?: { rendered?: string };
      content?: { rendered?: string };
      excerpt?: { rendered?: string };
      _embedded?: { 'wp:featuredmedia'?: unknown[] };
    }>>(`/pages?slug=${slug}&_embed`);

    if (!Array.isArray(pages) || pages.length === 0) {
      return null;
    }

    const page = pages[0];

    return rewriteImageUrls({
      page: {
        id: String(page.id),
        title: page.title?.rendered || '',
        content: page.content?.rendered || '',
        slug: page.slug,
        featuredImage: transformMedia(page._embedded?.['wp:featuredmedia']?.[0] as never) ?? undefined,
        seo: {
          title: page.title?.rendered || '',
          metaDesc: page.excerpt?.rendered || '',
        },
      },
    });
  } catch (error) {
    console.error('Error fetching WordPress page:', error);
    return null;
  }
}

// Generate static params for known pages (optional - for better performance)
export async function generateStaticParams() {
  // You can add known page slugs here for better performance
  // For now, we'll handle all pages dynamically
  return [];
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const data = await getWordPressPage(params.slug);
  
  if (!data) {
    return {
      title: 'Page Not Found - Edris Husein',
      description: 'The requested page could not be found.'
    };
  }

  return generateEnhancedMetadata(
    data.page.seo,
    {
      title: data.page.title,
      description: data.page.seo?.metaDesc || `Learn more about ${data.page.title}`,
      path: `/page/${params.slug}`,
      type: 'website'
    }
  );
}

export default async function WordPressPage({ params }: { params: { slug: string } }) {
  const data = await getWordPressPage(params.slug);

  // Handle page not found
  if (!data) {
    return (
      <>
        <Header />
        <main id="main-content" className="wordpress-page error-page">
          <div className="container">
            <div className="error-content">
              <h1>Page Not Found</h1>
              <p>The page you're looking for doesn't exist or has been moved.</p>
              <a href="/" className="back-home-link">Back to Home</a>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const page = data.page;

  // Generate structured data
  const structuredData = generateStructuredData('WebPage', {
    title: page.title,
    description: page.seo?.metaDesc || `Learn more about ${page.title}`,
    canonical: `https://edrishusein.com/page/${params.slug}`
  });

  return (
    <>
      <Header />
      <main id="main-content" className="wordpress-page">
        {/* Hero Section */}
        <section className="page-hero">
          <div className="container">
            <div className="hero-content">
              <div className="hero-text">
                <h1 className="hero-title">{page.title}</h1>
              </div>
              {page.featuredImage && (
                <div className="hero-image">
                  <Image
                    src={page.featuredImage.node.sourceUrl}
                    alt={page.featuredImage.node.altText}
                    width={page.featuredImage.node.mediaDetails.width}
                    height={page.featuredImage.node.mediaDetails.height}
                    className="featured-image"
                    priority
                  />
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content - Gutenberg Blocks */}
        {page.content && (
          <section className="page-content">
            <div className="container">
              <div className="content-wrapper">
                <div 
                  className="gutenberg-content"
                  dangerouslySetInnerHTML={{ __html: page.content }}
                />
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
      
      {/* Structured Data for SEO */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: safeJsonLd(structuredData),
        }}
      />
    </>
  );
}