// Simple blog post page for testing
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import '@/src/styles/pages/BlogPost.scss';
import { WordPressPost } from '@/src/types/api';

export default function BlogPostPageSimple() {
  const params = useParams();
  const [post, setPost] = useState<WordPressPost | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [moreArticles, setMoreArticles] = useState<WordPressPost[]>([]);
  
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  useEffect(() => {
    // Fetch the main post
    fetch(`/api/post?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPost(data.post);
        } else {
          setError('Post not found');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('Failed to load post');
        setLoading(false);
      });

    // Fetch more articles for the "More Articles" section
    fetch('/api/post?limit=3')
      .then(res => res.json())
      .then(data => {
        if (data.success && data.posts) {
          // Filter out current post
          const otherPosts = data.posts.filter((p: WordPressPost) => p.slug !== slug);
          setMoreArticles(otherPosts.slice(0, 3));
        }
      })
      .catch(err => {
        console.log('Could not load more articles:', err);
      });
  }, [slug]);

  if (loading) return (
    <>
      <Header />
      <main style={{ padding: '2rem', minHeight: '60vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p>Loading...</p>
        </div>
      </main>
      <Footer />
    </>
  );

  if (error) return (
    <>
      <Header />
      <main style={{ padding: '2rem', minHeight: '60vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1>Error</h1>
          <p>{error}</p>
          <Link href="/notebook">← Back to Notebook</Link>
        </div>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <main className="blog-post">
        <article className="post-article">
          <header className="post-header">
            <div className="container">
              <div className="post-meta">
                <nav className="breadcrumbs">
                  <Link href="/">Home</Link>
                  <span className="separator">/</span>
                  <Link href="/notebook">Notebook</Link>
                  <span className="separator">/</span>
                  <span className="current">{post?.title || 'Post'}</span>
                </nav>
                <div className="meta-info">
                  <time className="post-date">
                    {post?.date ? new Date(post.date).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    }) : ''}
                  </time>
                  {post?.readingTime && (
                    <span className="reading-time">{post.readingTime}</span>
                  )}
                </div>
              </div>
              
              <h1 className="post-title">{post?.title}</h1>
              
              {post?.categories && post.categories.length > 0 && (
                <div className="post-categories">
                  {post.categories.map((category, index) => (
                    <span key={index} className="category-tag">
                      {category.name}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </header>

          {/* Featured Image */}
          {post?.featuredImage?.node ? (
            <div className="post-featured-image">
              <Image
                src={post.featuredImage.node.sourceUrl}
                alt={post.featuredImage.node.altText || post?.title || ''}
                width={post?.featuredImage?.node?.mediaDetails?.width || 1200}
                height={post?.featuredImage?.node?.mediaDetails?.height || 600}
                className="featured-image"
                priority
              />
            </div>
          ) : (
            <div className="post-featured-image">
              <Image
                src="/images/Blog-sample-img.png"
                alt={post?.title || 'Blog Post'}
                width={1200}
                height={600}
                className="featured-image"
                priority
              />
            </div>
          )}

          <div className="post-content">
            <div className="container">
              <div className="content-wrapper">
                <div
                  className="prose"
                  dangerouslySetInnerHTML={{ __html: post?.content || '' }}
                />
              </div>
            </div>
          </div>

          <footer className="post-footer">
            <div className="container">
              {post?.author && (
                <div className="author-info">
                  <div className="author-details">
                    <h3 className="author-name">Written by {post?.author?.name}</h3>
                    <p className="author-bio">
                      {post?.author?.bio || "Full-stack developer passionate about modern web technologies."}
                    </p>
                  </div>
                </div>
              )}

              {post?.tags && post.tags.length > 0 && (
                <div className="post-tags">
                  <h3>Tags</h3>
                  <div className="tags-list">
                    {post?.tags?.map((tag: any, index: number) => (
                      <span key={index} className="tag">
                        #{tag.name}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </footer>
        </article>

        {/* More Articles Section */}
        {moreArticles.length > 0 && (
          <InfoCards
            skin="blog"
            variant="light"
            sectionNumber="03"
            sectionTitle="More Articles"
            columns={3}
            cards={moreArticles.map((article: WordPressPost) => ({
              title: article?.title || 'Untitled',
              description: article?.excerpt?.replace(/<[^>]*>/g, '').substring(0, 120) + '...' || '',
              image: article?.featuredImage?.node?.sourceUrl || "/images/Blog-sample-img.png",
              link: `/notebook/${article?.slug}`,
              variant: 'light' as const
            }))}
          />
        )}
      </main>
      <Footer />
    </>
  );
}