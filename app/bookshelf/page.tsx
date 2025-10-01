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
  try {
    console.log('🔍 Fetching books via GraphQL...');
    const data = await client.request(GET_BOOKS) as any;
    
    if (data?.books?.nodes) {
      console.log(`✅ Found ${data.books.nodes.length} books via GraphQL`);
      return data.books.nodes;
    }
    
    throw new Error('No books data received from GraphQL');
    
  } catch (error) {
    console.error('❌ GraphQL books fetch failed:', error);
    
    // Try WordPress REST API as fallback
    try {
      const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';
      console.log('🔄 Falling back to WordPress REST API for books...');
      
      const restResponse = await fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/book?_embed&per_page=100`, {
        cache: 'no-store'
      });
      
      if (restResponse.ok) {
        const restBooks = await restResponse.json();
        console.log(`✅ Found ${restBooks.length} books via REST API`);
        
        // Transform REST API data to match GraphQL structure
        return restBooks.map((book: any) => ({
          id: book.id.toString(),
          title: book.title?.rendered || book.title,
          excerpt: book.excerpt?.rendered || book.excerpt || '',
          featuredImage: book._embedded?.['wp:featuredmedia']?.[0] ? {
            node: {
              sourceUrl: book._embedded['wp:featuredmedia'][0].source_url,
              altText: book._embedded['wp:featuredmedia'][0].alt_text || book.title?.rendered || '',
              mediaDetails: {
                width: book._embedded['wp:featuredmedia'][0].media_details?.width || 300,
                height: book._embedded['wp:featuredmedia'][0].media_details?.height || 400
              }
            }
          } : null
        }));
      }
    } catch (restError) {
      console.error('❌ REST API fallback also failed:', restError);
    }
    
    console.log('⚠️ Using empty books array as final fallback');
    return [];
  }
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