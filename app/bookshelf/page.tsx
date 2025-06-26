import { GraphQLClient } from 'graphql-request';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
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
    const data = await client.request(GET_BOOKS) as any;
    return data.books.nodes;
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
      <main className="bookshelf-page">
        <div className="hero-section">
          <h1 className="title">BOOKSHELF</h1>
          <p className="description">
            Books and pieces of wisdom I've enjoyed reading
          </p>
        </div>

        <div className="container">
          <div className="books-grid">
            {books.map((book: any) => (
              <div key={book.id} className="book-card">
                {book.featuredImage?.node && (
                  <div className="image-wrapper">
                    <Image
                      src={book.featuredImage.node.sourceUrl}
                      alt={book.featuredImage.node.altText || book.title}
                      fill
                      className="book-image"
                    />
                  </div>
                )}
                <div className="content">
                  <h3 className="book-title">{book.title}</h3>
                  {book.excerpt && (
                    <div 
                      className="book-description"
                      dangerouslySetInnerHTML={{ __html: book.excerpt }}
                    />
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}