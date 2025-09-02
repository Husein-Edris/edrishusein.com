// Simple blog post page for testing
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import '@/src/styles/pages/CaseStudy.scss';
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
      <main className="case-study">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="container">
            <nav className="breadcrumbs">
              <Link href="/">Home</Link>
              <span className="separator">/</span>
              <Link href="/notebook">Notebook</Link>
              <span className="separator">/</span>
              <span className="current">{post?.title || 'Post'}</span>
            </nav>
            <h1 className="title">{post?.title}</h1>
            {post?.excerpt && (
              <div
                className="overview"
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />
            )}
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
        </div>

        <div className="container">
          {/* Featured Image */}
          {post?.featuredImage?.node ? (
            <div className="featured-image">
              <Image
                src={post.featuredImage.node.sourceUrl}
                alt={post.featuredImage.node.altText || post?.title || ''}
                width={post?.featuredImage?.node?.mediaDetails?.width || 1200}
                height={post?.featuredImage?.node?.mediaDetails?.height || 600}
                className="project-featured-image"
                priority
              />
            </div>
          ) : (
            <div className="featured-image">
              <Image
                src="/images/Blog-sample-img.png"
                alt={post?.title || 'Blog Post'}
                width={1200}
                height={600}
                className="project-featured-image"
                priority
              />
            </div>
          )}

          {/* Article Content */}
          <section className="article-content">
            <div
              className="content"
              dangerouslySetInnerHTML={{ __html: post?.content || '' }}
            />
          </section>

          {/* Author Section */}
          {post?.author && (
            <section className="author-section">
              <h2>About the Author</h2>
              <div className="author-info">
                <div className="author-details">
                  <h3 className="author-name">{post?.author?.name}</h3>
                  <p className="author-bio">
                    {post?.author?.bio || "Full-stack developer passionate about modern web technologies."}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Tags Section */}
          {post?.tags && post.tags.length > 0 && (
            <section className="tags-section">
              <h2>Tags</h2>
              <div className="tags-list">
                {post?.tags?.map((tag: any, index: number) => (
                  <span key={index} className="tag">
                    #{tag.name}
                  </span>
                ))}
              </div>
            </section>
          )}
        </div>

        {/* More Articles Section */}
        {moreArticles.length > 0 && (
          <InfoCards
            skin="blog"
            variant="light"
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