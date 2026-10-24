import type { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest, isTransientCmsError } from '@/src/lib/rest-client';
import { transformMedia } from '@/src/lib/transform/transformMedia';
import { rendered } from '@/src/lib/transform/transformProjects';
import { decodeEntities } from '@/src/lib/transform/decodeEntities';
import { getSiteContent } from '@/src/lib/site-content';
import { toParagraphs } from '@/src/lib/transform/transformSiteContent';
import { generateStructuredData, pageOpenGraph, safeJsonLd } from '@/src/lib/seo-utils';
import { absoluteUrl, alternatesFor } from '@/src/lib/i18n/paths';
import type { Lang } from '@/src/lib/i18n/lang';
import { localizeRestItem } from '@/src/lib/i18n/localize';
import { langFromParams, type LangParams } from '@/src/lib/i18n/route';
import '@/src/styles/pages/Bookshelf.scss';

// ISR: cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langFromParams(params);
  const { meta } = await getSiteContent(lang);
  return {
    title: meta.bookshelfTitle,
    description: meta.bookshelfDescription,
    alternates: alternatesFor('/bookshelf', lang),
    openGraph: pageOpenGraph({ title: meta.bookshelfTitle, description: meta.bookshelfDescription, path: '/bookshelf', lang }),
  };
}

async function getBooksData(lang: Lang) {
  try {
    const books = await cmsRest<Array<{ id: number | string; title?: unknown; excerpt?: unknown; _embedded?: { 'wp:featuredmedia'?: unknown[] } }>>(
      '/book?_embed&per_page=100'
    );
    if (!Array.isArray(books)) return [];
    return rewriteImageUrls(
      books.map((raw) => localizeRestItem(raw, lang)).map((book) => ({
        id: String(book.id),
        title: decodeEntities(rendered(book.title as never)),
        excerpt: rendered(book.excerpt as never),
        featuredImage: transformMedia(book._embedded?.['wp:featuredmedia']?.[0] as never),
      }))
    );
  } catch (error) {
    // Transient: rethrow so ISR keeps the last good shelf instead of caching an
    // empty one. A permanent 4xx still renders the empty-state message.
    if (isTransientCmsError(error)) throw error;
    console.error('Error fetching books:', error);
    return [];
  }
}

export default async function BookshelfPage({ params }: LangParams) {
  const lang = await langFromParams(params);
  const [books, siteContent] = await Promise.all([getBooksData(lang), getSiteContent(lang)]);
  const copy = siteContent.bookshelfPage;

  const webPageJsonLd = generateStructuredData('WebPage', {
    title: siteContent.meta.bookshelfTitle,
    description: siteContent.meta.bookshelfDescription,
    canonical: absoluteUrl('/bookshelf', lang),
    inLanguage: lang,
  });

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(webPageJsonLd) }}
      />
      <Header />
      <main id="main-content" tabIndex={-1} className="bookshelf-page">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="container">
            <h1 className="title">{copy.title}</h1>
            <div className="overview">
              <p>{copy.lead}</p>
              {toParagraphs(copy.intro).map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </div>
        </div>

        <div className="container">
          {/* Books Grid */}
          <section className="books-section">
            <div className="books-grid">
              {books.length > 0 ? (
                books.map((book: any) => (
                  <div key={book.id} className="book-card">
                    {book.featuredImage?.node && (
                      <div className="book-cover">
                        <Image
                          src={book.featuredImage.node.sourceUrl}
                          alt={book.featuredImage.node.altText || book.title}
                          width={book.featuredImage.node.mediaDetails?.width || 300}
                          height={book.featuredImage.node.mediaDetails?.height || 400}
                          className="book-image"
                        />
                      </div>
                    )}
                    <div className="book-title">{book.title}</div>
                    {book.excerpt && (
                      <div 
                        className="book-description"
                        dangerouslySetInnerHTML={{ __html: book.excerpt }}
                      />
                    )}
                  </div>
                ))
              ) : (
                <div className="no-books-message" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                  <p>{copy.emptyMessage}</p>
                </div>
              )}
            </div>
          </section>
        </div>
      </main>
      <Footer lang={lang} />
    </>
  );
}