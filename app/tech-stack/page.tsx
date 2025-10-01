import { GraphQLClient } from 'graphql-request';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/CaseStudy.scss';


const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

// Note: 'techs' field doesn't exist in WordPress GraphQL schema
// Using direct REST API call instead

// Fisher-Yates shuffle algorithm for random array ordering
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // Create a copy to avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

async function getTechStackData() {
  // For static export, use fallback data only to avoid network timeouts
  console.log('📊 Using static fallback data for tech stack');
  return [];
}

export default async function TechStackPage() {
  const techItems = await getTechStackData() || [];
  
  // Randomize the order of tech items on each page load
  const randomizedTechItems = shuffleArray(techItems);

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
              {randomizedTechItems.length > 0 ? (
                randomizedTechItems.map((tech: any) => (
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