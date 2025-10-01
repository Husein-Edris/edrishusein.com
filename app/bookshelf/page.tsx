import { GraphQLClient } from 'graphql-request';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import SectionHeader from '@/src/components/SectionHeader/SectionHeader';
import '@/src/styles/pages/Bookshelf.scss';


const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

const GET_BOOKS = `
  query GetBooks {
    books(first: 100) {
      nodes {
        id
        title
        excerpt
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
      }
    }
  }
`;

async function getBooksData() {
  // For static export, use fallback data only
  console.log('📊 Using static fallback data for books');
  return [];
}

export default async function BookshelfPage() {
  const books = await getBooksData();

  return (
    <>
      <Header />
      <main className="bookshelf-page">
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