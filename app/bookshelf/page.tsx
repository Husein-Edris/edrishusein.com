import type { Metadata } from 'next';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import SectionHeader from '@/src/components/SectionHeader/SectionHeader';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest } from '@/src/lib/rest-client';
import { transformMedia } from '@/src/lib/transform/transformMedia';
import { rendered } from '@/src/lib/transform/transformProjects';
import { decodeEntities } from '@/src/lib/transform/decodeEntities';
import '@/src/styles/pages/Bookshelf.scss';

// ISR — cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Bookshelf - Edris Husein',
  description: 'Books and pieces of wisdom Edris Husein has enjoyed reading, spanning software craft, design, and personal growth.',
  alternates: { canonical: '/bookshelf' },
};

async function getBooksData() {
  try {
    const books = await cmsRest<Array<{ id: number | string; title?: unknown; excerpt?: unknown; _embedded?: { 'wp:featuredmedia'?: unknown[] } }>>(
      '/book?_embed&per_page=100'
    );
    if (!Array.isArray(books)) return [];
    if (process.env.NODE_ENV === 'development') {
      console.log(`✅ ${books.length} books loaded via REST API`);
    }
    return rewriteImageUrls(
      books.map((book) => ({
        id: String(book.id),
        title: decodeEntities(rendered(book.title as never)),
        excerpt: rendered(book.excerpt as never),
        featuredImage: transformMedia(book._embedded?.['wp:featuredmedia']?.[0] as never),
      }))
    );
  } catch (error) {
    console.error('Error fetching books:', error);
    return [];
  }
}

export default async function BookshelfPage() {
  const books = await getBooksData();

  return (
    <>
      <Header />
      <main id="main-content" tabIndex={-1} className="bookshelf-page">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="container">
            <h1 className="title">BOOKSHELF</h1>
            <div className="overview">
              <p>Books and pieces of wisdom I've enjoyed reading</p>
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
                  <p>Bookshelf is currently being updated. Please check back later.</p>
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