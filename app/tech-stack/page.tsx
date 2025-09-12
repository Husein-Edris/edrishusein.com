import { GraphQLClient } from 'graphql-request';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/CaseStudy.scss';

export const dynamic = 'force-dynamic'; // Always fetch fresh data from WordPress

const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

// Note: 'techs' field doesn't exist in WordPress GraphQL schema
// Using direct REST API call instead

async function getTechStackData() {
  try {
    console.log('🔍 Fetching tech stack directly from WordPress REST API...');
    const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/tech?_embed&per_page=100`, {
      cache: 'no-store'
    });
    
    if (response.ok) {
      const techs = await response.json();
      console.log('✅ Tech stack data loaded via REST API');
      
      return techs.map((tech: any) => ({
        id: tech.id.toString(),
        title: tech.title?.rendered || tech.title,
        excerpt: tech.excerpt?.rendered || tech.excerpt || '',
        featuredImage: tech._embedded?.['wp:featuredmedia']?.[0] ? {
          node: {
            sourceUrl: tech._embedded['wp:featuredmedia'][0].source_url,
            altText: tech._embedded['wp:featuredmedia'][0].alt_text || tech.title?.rendered || '',
            mediaDetails: {
              width: tech._embedded['wp:featuredmedia'][0].media_details?.width || 100,
              height: tech._embedded['wp:featuredmedia'][0].media_details?.height || 100
            }
          }
        } : null
      }));
    }
  } catch (error) {
    console.error('❌ Tech stack fetch failed:', error);
    
    try {
      const restUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/tech?_embed`;
      const restResponse = await fetch(restUrl);
      
      if (restResponse.ok) {
        const restTechs = await restResponse.json();
        console.log(`✅ Found ${restTechs.length} tech items via REST API`);
        
        // Transform REST API data to match GraphQL structure
        return restTechs.map((tech: any) => ({
          id: tech.id.toString(),
          title: tech.title?.rendered || tech.title,
          excerpt: tech.excerpt?.rendered || tech.excerpt || '',
          featuredImage: tech._embedded?.['wp:featuredmedia']?.[0] ? {
            node: {
              sourceUrl: tech._embedded['wp:featuredmedia'][0].source_url,
              altText: tech._embedded['wp:featuredmedia'][0].alt_text || tech.title?.rendered,
              mediaDetails: {
                height: tech._embedded['wp:featuredmedia'][0].media_details?.height || 400,
                width: tech._embedded['wp:featuredmedia'][0].media_details?.width || 400
              }
            }
          } : null
        }));
      }
    } catch (restError) {
      console.error('❌ REST API also failed:', restError);
    }
    
    console.log('⚠️ Using fallback tech stack data');
    return [];
  }
}

export default async function TechStackPage() {
  const techItems = await getTechStackData() || [];

  return (
    <>
      <Header />
      <main className="case-study">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="container">
            <h1 className="title">TECH STACK</h1>
            <div className="overview">
              <p>The dev tools, apps, devices, and games I use and play with</p>
            </div>
          </div>
        </div>

        <div className="container">
          {/* Tech Grid */}
          <section className="tech-section">
            <div className="tech-grid">
              {techItems.length > 0 ? (
                techItems.map((tech: any) => (
                  <div key={tech.id} className="tech-card">
                    {tech.featuredImage?.node && (
                      <div className="tech-image">
                        <Image
                          src={tech.featuredImage.node.sourceUrl}
                          alt={tech.featuredImage.node.altText || tech.title}
                          width={tech.featuredImage.node.mediaDetails?.width || 100}
                          height={tech.featuredImage.node.mediaDetails?.height || 100}
                          className="featured-image"
                        />
                      </div>
                    )}
                    <div className="tech-content">
                      <h3 className="tech-title">{tech.title}</h3>
                      {tech.excerpt && (
                        <div
                          className="tech-description"
                          dangerouslySetInnerHTML={{ __html: tech.excerpt }}
                        />
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-tech-message" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>Tech stack information is currently being updated. Please check back later.</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}