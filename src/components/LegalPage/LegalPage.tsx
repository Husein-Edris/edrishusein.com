import { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import BackToTopButton from './BackToTopButton';
import CookieSettingsLink from '@/src/components/CookieSettingsLink/CookieSettingsLink';
import './LegalPage.scss';

interface LegalPageProps {
  title: string;
  content: string;
  lastUpdated?: string;
  breadcrumb?: string;
}

interface LegalPageData {
  page: {
    id: string;
    title: string;
    content: string;
    modified?: string;
    seo?: {
      title: string;
      metaDesc: string;
    };
  };
}

// Fallback data for when WordPress is unavailable
const createFallbackData = (pageType: 'imprint' | 'privacy'): LegalPageData => {
  const fallbackContent = {
    imprint: {
      title: 'Imprint',
      content: `
        <h2>Information pursuant to § 5 TMG</h2>
        <p>
          <strong>Edris Husein</strong><br>
          Full-Stack Developer<br>
          [Your Address]<br>
          [City, Postal Code]<br>
          [Country]
        </p>

        <h2>Contact</h2>
        <p>
          Email: [your-email@example.com]<br>
          Website: https://edrishusein.com
        </p>

        <h2>Responsible for content according to § 55, para. 2 RStV</h2>
        <p>
          Edris Husein<br>
          [Same address as above]
        </p>

        <h2>Disclaimer</h2>
        <h3>Accountability for content</h3>
        <p>The contents of our pages have been created with the utmost care. However, we cannot guarantee the contents' accuracy, completeness or topicality.</p>

        <h3>Accountability for links</h3>
        <p>Responsibility for the content of external links (to web pages of third parties) lies solely with the operators of the linked pages.</p>
      `,
      seo: {
        title: 'Imprint - Legal Information',
        metaDesc: 'Legal information and imprint for Edris Husein - Full-stack Developer'
      }
    },
    privacy: {
      title: 'Privacy Policy',
      content: `
        <h2>Privacy Policy</h2>
        <p>This privacy policy explains how we collect, use, and protect your personal information when you visit our website.</p>

        <h2>Information We Collect</h2>
        <p>We may collect the following types of information:</p>
        <ul>
          <li>Information you provide directly (contact forms, email)</li>
          <li>Automatically collected information (IP address, browser type, visit duration)</li>
          <li>Cookies and similar tracking technologies</li>
        </ul>

        <h2>How We Use Your Information</h2>
        <p>We use collected information to:</p>
        <ul>
          <li>Respond to your inquiries</li>
          <li>Improve our website and services</li>
          <li>Analyze website usage and performance</li>
        </ul>

        <h2>Data Protection</h2>
        <p>We implement appropriate security measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction.</p>

        <h2>Third-Party Services</h2>
        <p>Our website may use third-party services such as Google Analytics. These services have their own privacy policies.</p>

        <h2>Your Rights</h2>
        <p>You have the right to access, update, or delete your personal information. Contact us if you wish to exercise these rights.</p>

        <h2>Contact</h2>
        <p>If you have questions about this privacy policy, please contact us at [your-email@example.com]</p>
      `,
      seo: {
        title: 'Privacy Policy - Data Protection',
        metaDesc: 'Privacy policy and data protection information for Edris Husein website'
      }
    }
  };

  return {
    page: {
      id: pageType,
      title: fallbackContent[pageType].title,
      content: fallbackContent[pageType].content,
      modified: new Date().toISOString(),
      seo: fallbackContent[pageType].seo
    }
  };
};

// Fetch legal page data from WordPress
async function getLegalPageData(slug: string, fallbackType: 'imprint' | 'privacy'): Promise<LegalPageData> {
  try {
    console.log(`🔍 Fetching ${slug} page from WordPress REST API`);
    
    const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';
    const response = await fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/pages?slug=${slug}`, {
      next: { revalidate: 3600 } // Revalidate every hour
    });

    if (!response.ok) {
      throw new Error(`WordPress API failed: ${response.status}`);
    }

    const pages = await response.json();
    
    if (!pages || pages.length === 0) {
      throw new Error(`Page ${slug} not found in WordPress`);
    }

    const page = pages[0];
    
    return {
      page: {
        id: page.id.toString(),
        title: page.title?.rendered || fallbackType.charAt(0).toUpperCase() + fallbackType.slice(1),
        content: page.content?.rendered || '',
        modified: page.modified || page.date,
        seo: {
          title: page.yoast_head_json?.title || page.title?.rendered || fallbackType.charAt(0).toUpperCase() + fallbackType.slice(1),
          metaDesc: page.yoast_head_json?.description || `${fallbackType.charAt(0).toUpperCase() + fallbackType.slice(1)} information for Edris Husein`
        }
      }
    };
  } catch (error) {
    console.error(`❌ Error fetching ${slug} page:`, error);
    console.log(`🔄 Using fallback ${fallbackType} data`);
    return createFallbackData(fallbackType);
  }
}

// Generate metadata for legal pages
function generateLegalMetadata(data: LegalPageData): Metadata {
  return {
    title: data.page.seo?.title || data.page.title,
    description: data.page.seo?.metaDesc || `${data.page.title} - Edris Husein`,
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: data.page.seo?.title || data.page.title,
      description: data.page.seo?.metaDesc || `${data.page.title} - Edris Husein`,
      type: 'article',
      locale: 'en_US',
    },
    twitter: {
      card: 'summary',
      title: data.page.seo?.title || data.page.title,
      description: data.page.seo?.metaDesc || `${data.page.title} - Edris Husein`,
    },
  };
}

// Format date helper
function formatDate(dateString?: string): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return '';
  }
}

// Legal page component
export default function LegalPage({ title, content, lastUpdated, breadcrumb }: LegalPageProps) {
  return (
    <>
      <Header />
      <main className="legal-page">
        {/* Breadcrumb */}
        {breadcrumb && (
          <nav className="breadcrumb" aria-label="Breadcrumb">
            <div className="container">
              <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                  <a href="/">Home</a>
                </li>
                <li className="breadcrumb-item" aria-current="page">
                  {breadcrumb}
                </li>
              </ol>
            </div>
          </nav>
        )}

        {/* Hero Section */}
        <section className="legal-hero">
          <div className="container">
            <div className="legal-hero-content">
              <h1 className="legal-title">{title}</h1>
              {lastUpdated && (
                <p className="last-updated">
                  Last updated: {formatDate(lastUpdated)}
                </p>
              )}
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="legal-content">
          <div className="container">
            <div className="content-wrapper">
              <article 
                className="legal-article"
                dangerouslySetInnerHTML={{ __html: content }}
              />
              
              {/* Cookie Settings Link */}
              <div className="cookie-settings-section">
                <p>
                  You can manage your cookie preferences at any time by clicking{' '}
                  <CookieSettingsLink>
                    <strong>Cookie Settings</strong>
                  </CookieSettingsLink>.
                </p>
              </div>

              {/* Back to top */}
              <div className="back-to-top">
                <BackToTopButton className="back-to-top-btn" />
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}

// Export helper functions for use in page files
export { getLegalPageData, generateLegalMetadata };