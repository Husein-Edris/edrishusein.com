import { Metadata } from 'next';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import BackToTopButton from './BackToTopButton';
import CookieSettingsLink from '@/src/components/CookieSettingsLink/CookieSettingsLink';
import { notFound } from 'next/navigation';
import { detectContentLanguage } from '@/src/lib/detect-language';
import { cmsRest, isTransientCmsError } from '@/src/lib/rest-client';
import { getSiteContentOrDefaults } from '@/src/lib/site-content';
import { alternatesFor, localePath } from '@/src/lib/i18n/paths';
import { DATE_LOCALE, DEFAULT_LANG, OG_LOCALE, otherLang, type Lang } from '@/src/lib/i18n/lang';
import { dictionary } from '@/src/lib/i18n/dictionary';
import { localizeRestItem } from '@/src/lib/i18n/localize';
import { fillLabel } from '@/src/lib/transform/transformSiteContent';
import './LegalPage.scss';

interface LegalPageProps {
  title: string;
  content: string;
  lastUpdated?: string;
  breadcrumb?: string;
  showCookieSettings?: boolean;
  lang?: Lang;
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
  acf_fields?: unknown;
}

// Fetch a legal page from WordPress.
//
// No placeholder fallback: the old one rendered "[Your Address]" on the live
// imprint whenever the CMS hiccuped. A transient CMS failure throws out of
// cmsRest, so ISR keeps serving the last good page; a page the CMS does not
// have is a real 404.
async function getLegalPageData(
  slug: string,
  fallbackType: 'imprint' | 'privacy',
  lang: Lang = DEFAULT_LANG
): Promise<LegalPageData> {
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

  // The legal texts are German originals; title_de/content_de win on /de when set.
  const page = localizeRestItem(pages[0], lang);
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

// Generate metadata for legal pages. `path` is the English path; the German
// page gets /de + path as canonical, and both name each other as hreflang.
function generateLegalMetadata(data: LegalPageData, path?: string, lang: Lang = DEFAULT_LANG): Metadata {
  const text = dictionary(lang);
  const description = data.page.seo?.metaDesc || fillLabel(text.legalFallbackDescription, { title: data.page.title });
  return {
    title: data.page.seo?.title || data.page.title,
    description,
    ...(path ? { alternates: alternatesFor(path, lang) } : {}),
    robots: {
      index: true,
      follow: true,
    },
    openGraph: {
      title: data.page.seo?.title || data.page.title,
      description,
      ...(path ? { url: localePath(path, lang) } : {}),
      type: 'article',
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[otherLang(lang)]],
      images: [
        {
          url: '/images/Edris-Husein-Hero.png',
          width: 450,
          height: 450,
          alt: text.ogImageAlt,
        },
      ],
    },
    twitter: {
      card: 'summary',
      title: data.page.seo?.title || data.page.title,
      description,
    },
  };
}

// Format date helper
function formatDate(dateString: string | undefined, lang: Lang): string {
  if (!dateString) return '';
  
  try {
    const date = new Date(dateString);
    return date.toLocaleDateString(DATE_LOCALE[lang], {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  } catch {
    return '';
  }
}

// Legal page component
export default async function LegalPage({
  title,
  content,
  lastUpdated,
  breadcrumb,
  showCookieSettings = true,
  lang = DEFAULT_LANG,
}: LegalPageProps) {
  const siteContent = await getSiteContentOrDefaults(lang);
  const text = dictionary(lang);
  const contentLang = detectContentLanguage(content);

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="legal-page">
        {/* Breadcrumb */}
        {breadcrumb && (
          <nav className="breadcrumb" aria-label={text.breadcrumbLabel}>
            <div className="container">
              <ol className="breadcrumb-list">
                <li className="breadcrumb-item">
                  <Link href={localePath('/', lang)}>{siteContent.chrome.breadcrumbHome}</Link>
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
                  {text.lastUpdated} {formatDate(lastUpdated, lang)}
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
                // Legal texts come from the CMS in German; mark the subtree when
                // its language differs from the page so it is announced correctly.
                lang={contentLang !== lang ? contentLang : undefined}
                dangerouslySetInnerHTML={{ __html: content }}
              />
              
              {/* Cookie Settings Link */}
              {showCookieSettings && (
                <div className="cookie-settings-section">
                  <p>
                    {text.legalCookieNotice}{' '}
                    <CookieSettingsLink>
                      <strong>{siteContent.footer.cookieSettingsLabel}</strong>
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
      <Footer lang={lang} />
    </>
  );
}

// Export helper functions for use in page files
export { getLegalPageData, generateLegalMetadata };