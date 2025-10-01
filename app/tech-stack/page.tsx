'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/CaseStudy.scss';

// Fisher-Yates shuffle algorithm for random array ordering
function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // Create a copy to avoid mutating original
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export default function TechStackPage() {
  const [techItems, setTechItems] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    async function fetchTechStack() {
      try {
        console.log('🔍 Fetching tech stack via REST API');
        const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/tech?_embed&per_page=100`);
        
        if (response.ok) {
          const techData = await response.json();
          
          const transformedTech = techData.map((tech: any) => ({
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
          
          // Randomize the order of tech items
          const randomizedTechItems = shuffleArray(transformedTech);
          setTechItems(randomizedTechItems);
          console.log(`✅ Loaded ${transformedTech.length} tech items`);
        }
      } catch (error) {
        console.error('❌ Error fetching tech stack:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchTechStack();
  }, []);

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
              {loading ? (
                <div style={{ textAlign: 'center', padding: '4rem', color: '#666' }}>
                  <p>Loading tech stack...</p>
                </div>
              ) : techItems.length > 0 ? (
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