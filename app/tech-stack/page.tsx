import type { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest } from '@/src/lib/rest-client';
import { transformMedia } from '@/src/lib/transform/transformMedia';
import { rendered } from '@/src/lib/transform/transformProjects';
import '@/src/styles/pages/CaseStudy.scss';

// Kept dynamic on purpose: the tech grid is shuffled per request (below).
export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Tech Stack - Edris Husein',
  description: 'The tools, languages, and frameworks Edris Husein uses to build modern web applications.',
  alternates: { canonical: '/tech-stack' },
};

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
  try {
    const techs = await cmsRest<Array<{ id: number | string; title?: unknown; excerpt?: unknown; _embedded?: { 'wp:featuredmedia'?: unknown[] } }>>(
      '/tech?_embed&per_page=100'
    );
    if (!Array.isArray(techs)) return [];
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${techs.length} tech items loaded via REST API`);
    }
    return rewriteImageUrls(
      techs.map((tech) => ({
        id: String(tech.id),
        title: rendered(tech.title as never),
        excerpt: rendered(tech.excerpt as never),
        featuredImage: transformMedia(tech._embedded?.['wp:featuredmedia']?.[0] as never),
      }))
    );
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    return [];
  }
}

export default async function TechStackPage() {
  const techItems = await getTechStackData() || [];
  
  // Randomize the order of tech items on each page load
  const randomizedTechItems = shuffleArray(techItems);

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="case-study">
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