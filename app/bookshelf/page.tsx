'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import SectionHeader from '@/src/components/SectionHeader/SectionHeader';
import '@/src/styles/pages/Bookshelf.scss';

export default function BookshelfPage() {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    async function fetchBooks() {
      try {
        console.log('🔍 Fetching books via REST API');
        const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/book?_embed&per_page=100`);
        
        if (response.ok) {
          const booksData = await response.json();
          
          const transformedBooks = booksData.map((book: any) => ({
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
          
          setBooks(transformedBooks);
          console.log(`✅ Loaded ${transformedBooks.length} books`);
        }
      } catch (error) {
        console.error('❌ Error fetching books:', error);
      }
    }

    fetchBooks();
  }, []);

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