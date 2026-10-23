import { Metadata } from 'next';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import BackToTopButton from './BackToTopButton';
import CookieSettingsLink from '@/src/components/CookieSettingsLink/CookieSettingsLink';
import { notFound } from 'next/navigation';
import { detectContentLanguage } from '@/src/lib/detect-language';
import { cmsRest, isTransientCmsError } from '@/src/lib/rest-client';
import './LegalPage.scss';

interface LegalPageProps {
  title: string;
  content: string;
  lastUpdated?: string;
  breadcrumb?: string;
  showCookieSettings?: boolean;
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

interface RestLegalPage {
  id: number | string;
  date?: string;
  modified?: string;
  title?: { rendered?: string };
  content?: { rendered?: string };
  yoast_head_json?: { title?: string; description?: string };
}

// Fetch a legal page from WordPress.
//
// No placeholder fallback: the old one rendered "[Your Address]" on the live
// imprint whenever the CMS hiccuped. A transient CMS failure throws out of
// cmsRest, so ISR keeps serving the last good page; a page the CMS does not
// have is a real 404.
async function getLegalPageData(slug: string, fallbackType: 'imprint' | 'privacy'): Promise<LegalPageData> {
  let pages: RestLegalPage[];
  try {
    pages = await cmsRest<RestLegalPage[]>(`/pages?slug=${encodeURIComponent(slug)}`);
  } catch (error: unknown) {
    if (isTransientCmsError(error)) throw error;
    notFound();
  }

  if (!Array.isArray(pages) || pages.length === 0) {
    notFound();
  }

  const page = pages[0];
  const typeLabel = fallbackType.charAt(0).toUpperCase() + fallbackType.slice(1);

  return {
    page: {
      id: page.id.toString(),
      title: page.title?.rendered || typeLabel,
      content: page.content?.rendered || '',
      modified: page.modified || page.date,
      seo: {
        title: page.yoast_head_json?.title || page.title?.rendered || typeLabel,
        metaDesc: page.yoast_head_json?.description || `${typeLabel} information for Edris Husein`
      }
    }
  };
}

// Generate metadata for legal pages
function generateLegalMetadata(data: LegalPageData, canonicalPath?: string): Metadata {
  return {
    title: data.page.seo?.title || data.page.title,
    description: data.page.seo?.metaDesc || `${data.page.title} - Edris Husein`,
    ...(canonicalPath ? { alternates: { canonical: canonicalPath } } : {}),
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: data.page.seo?.title || data.page.title,
      description: data.page.seo?.metaDesc || `${data.page.title} - Edris Husein`,
      ...(canonicalPath ? { url: canonicalPath } : {}),
      type: 'article',
      locale: 'en_US',
      images: [
        {
          url: '/images/Edris-Husein-Hero.png',
          width: 450,
          height: 450,
          alt: 'Edris Husein - Web Developer',
        },
      ],
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
export default function LegalPage({ title, content, lastUpdated, breadcrumb, showCookieSettings = true }: LegalPageProps) {
  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="legal-page">
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
                // Legal texts come from the CMS in German; mark the subtree so
                // it is not announced/indexed as English (site default lang).
                lang={detectContentLanguage(content) === 'de' ? 'de' : undefined}
                dangerouslySetInnerHTML={{ __html: content }}
              />
              
              {/* Cookie Settings Link */}
              {showCookieSettings && (
                <div className="cookie-settings-section">
                  <p>
                    You can manage your cookie preferences at any time by clicking{' '}
                    <CookieSettingsLink>
                      <strong>Cookie Settings</strong>
                    </CookieSettingsLink>.
                  </p>
                </div>
              )}

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