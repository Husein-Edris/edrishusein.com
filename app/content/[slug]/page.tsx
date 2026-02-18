// app/page/[slug]/page.tsx
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { Metadata } from 'next';
import { generateEnhancedMetadata, generateStructuredData } from '@/src/lib/seo-utils';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import '@/src/styles/pages/WordPressPage.scss';

export const dynamic = 'force-dynamic'; // Always fetch fresh data from WordPress

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

// Helper function to test WordPress API endpoint
async function testWordPressAPI(baseUrl: string): Promise<{success: boolean, issue?: string}> {
  try {
    const testResponse = await fetch(`${baseUrl}/wp-json/wp/v2/`, { 
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
      }
    });
    
    if (!testResponse.ok) {
      return { success: false, issue: `API returned ${testResponse.status} ${testResponse.statusText}` };
    }
    
    const contentType = testResponse.headers.get('content-type');
    if (!contentType?.includes('application/json')) {
      const responseText = await testResponse.text();
      return { 
        success: false, 
        issue: `Non-JSON response (${contentType}). Preview: ${responseText.substring(0, 100)}` 
      };
    }
    
    return { success: true };
    
  } catch (error) {
    return { 
      success: false, 
      issue: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
    };
  }
}

async function getWordPressPage(slug: string): Promise<WordPressPageData | null> {
  try {
    console.log(`🔍 Fetching WordPress page with slug: ${slug}`);
    
    // Try GraphQL first
    try {
      const { client } = await import('@/src/lib/client');
      const GET_PAGE_BY_SLUG = `
        query GetPageBySlug($slug: ID!) {
          page(id: $slug, idType: SLUG) {
            id
            title
            content
            slug
            featuredImage {
              node {
                sourceUrl
                altText
                mediaDetails {
                  height
                  width
                }
              }
            }
            seo {
              title
              metaDesc
              opengraphImage {
                sourceUrl
              }
            }
          }
        }
      `;
      
      const data = await client.request(GET_PAGE_BY_SLUG, { slug });
      
      if (data?.page) {
        console.log(`✅ Found page "${data.page.title}" via GraphQL`);
        return {
          page: {
            id: data.page.id,
            title: data.page.title,
            content: data.page.content,
            slug: data.page.slug,
            featuredImage: data.page.featuredImage,
            seo: data.page.seo
          }
        };
      }
    } catch (graphqlError) {
      console.warn('⚠️ GraphQL failed, falling back to REST API:', graphqlError);
    }
    
    // Fallback to REST API
    console.log('🔍 Using REST API fallback');
    const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';
    
    // Test WordPress API connection first
    const apiTest = await testWordPressAPI(WORDPRESS_REST_URL);
    if (!apiTest.success) {
      console.error(`❌ WordPress API test failed: ${apiTest.issue}`);
      throw new Error(`WordPress API is not accessible: ${apiTest.issue}`);
    }
    
    const response = await fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/pages?slug=${slug}&_embed`, {
      cache: 'no-store',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      }
    });
    
    if (!response.ok) {
      console.error(`❌ WordPress REST API failed: ${response.status} ${response.statusText}`);
      return null;
    }
    
    // Check if response is actually JSON
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      console.error(`❌ WordPress returned non-JSON response. Content-Type: ${contentType}`);
      return null;
    }
    
    const pages = await response.json();
    
    if (!pages || pages.length === 0) {
      console.warn(`⚠️ Page with slug "${slug}" not found in WordPress`);
      return null;
    }
    
    const page = pages[0];
    console.log(`✅ Found page "${page.title?.rendered}" via REST API`);
    
    // Transform WordPress REST data to expected format
    return rewriteImageUrls({
      page: {
        id: page.id.toString(),
        title: page.title?.rendered || '',
        content: page.content?.rendered || '',
        slug: page.slug,
        featuredImage: page._embedded?.['wp:featuredmedia']?.[0] ? {
          node: {
            sourceUrl: page._embedded['wp:featuredmedia'][0].source_url,
            altText: page._embedded['wp:featuredmedia'][0].alt_text || page.title?.rendered || '',
            mediaDetails: {
              width: page._embedded['wp:featuredmedia'][0].media_details?.width || 1200,
              height: page._embedded['wp:featuredmedia'][0].media_details?.height || 600
            }
          }
        } : undefined,
        seo: {
          title: page.yoast_head_json?.title || page.title?.rendered || '',
          metaDesc: page.yoast_head_json?.description || page.excerpt?.rendered || '',
          opengraphImage: page.yoast_head_json?.og_image?.[0] ? {
            sourceUrl: page.yoast_head_json.og_image[0].url
          } : undefined
        }
      }
    });

  } catch (error) {
    console.error('❌ Error fetching WordPress page:', error);
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
        <main className="wordpress-page error-page">
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
      <main className="wordpress-page">
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
          __html: JSON.stringify(structuredData),
        }}
      />
    </>
  );
}