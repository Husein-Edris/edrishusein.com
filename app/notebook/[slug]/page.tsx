// Server Component for blog posts with SSG
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import '@/src/styles/pages/CaseStudy.scss';
import { WordPressPost } from '@/src/types/api';

// Generate static params for all blog posts
export async function generateStaticParams() {
  try {
    const response = await fetch(`${process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : process.env.NEXT_PUBLIC_SITE_URL}/api/post?limit=50`);
    if (!response.ok) return [];
    
    const data = await response.json();
    if (data.success && data.posts) {
      return data.posts.map((post: WordPressPost) => ({
        slug: post.slug,
      }));
    }
  } catch (error) {
    console.error('Error generating static params for blog posts:', error);
  }
  
  return [];
}

// Generate metadata for SEO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    const post = await getPost(slug);
    
    return {
      title: `${post.title} | Notebook - Edris Husein`,
      description: post.excerpt?.replace(/<[^>]*>/g, '').substring(0, 160) || 'Read more on Edris Husein\'s notebook',
      openGraph: {
        title: post.title,
        description: post.excerpt?.replace(/<[^>]*>/g, '').substring(0, 160),
        images: post.featuredImage?.node?.sourceUrl ? [post.featuredImage.node.sourceUrl] : [],
        type: 'article',
        publishedTime: post.date,
        authors: [post.author?.name || 'Edris Husein'],
      },
      twitter: {
        card: 'summary_large_image',
        title: post.title,
        description: post.excerpt?.replace(/<[^>]*>/g, '').substring(0, 160),
        images: post.featuredImage?.node?.sourceUrl ? [post.featuredImage.node.sourceUrl] : [],
      },
    };
  } catch (error) {
    return {
      title: 'Article | Notebook - Edris Husein',
      description: 'Read more on Edris Husein\'s notebook',
    };
  }
}

// Server-side data fetching
async function getPost(slug: string): Promise<WordPressPost> {
  const response = await fetch(
    `${process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : process.env.NEXT_PUBLIC_SITE_URL}/api/post?slug=${slug}`,
    { next: { revalidate: 3600 } } // Revalidate every hour
  );
  
  if (!response.ok) {
    throw new Error('Failed to fetch post');
  }
  
  const data = await response.json();
  if (!data.success || !data.post) {
    throw new Error('Post not found');
  }
  
  return data.post;
}

async function getMoreArticles(excludeSlug: string): Promise<WordPressPost[]> {
  try {
    const response = await fetch(
      `${process.env.NODE_ENV === 'development' ? 'http://localhost:3001' : process.env.NEXT_PUBLIC_SITE_URL}/api/post?limit=4`,
      { next: { revalidate: 3600 } }
    );
    
    if (!response.ok) return [];
    
    const data = await response.json();
    if (data.success && data.posts) {
      // Filter out current post and limit to 3
      return data.posts
        .filter((p: WordPressPost) => p.slug !== excludeSlug)
        .slice(0, 3);
    }
  } catch (error) {
    console.error('Error fetching more articles:', error);
  }
  
  return [];
}

// Loading component for Suspense
function ArticleLoading() {
  return (
    <div className="loading-page">
      <div className="loading-container">
        <div className="logo-spinner">
          <div className="logo-circle">
            <Image
              src="/edrishusein-logo.svg"
              alt="Edris Husein Logo"
              width={60}
              height={30}
              className="logo-image"
            />
          </div>
          <div className="pulse-rings">
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
            <div className="pulse-ring"></div>
          </div>
        </div>
        <p className="loading-text">Loading article...</p>
      </div>
    </div>
  );
}

// Server Component
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    // Fetch post and more articles in parallel
    const [post, moreArticles] = await Promise.all([
      getPost(slug),
      getMoreArticles(slug),
    ]);

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
                <span className="current">{post.title || 'Post'}</span>
              </nav>
              <h1 className="title">{post.title}</h1>
              {post.excerpt && (
                <div
                  className="overview"
                  dangerouslySetInnerHTML={{ __html: post.excerpt }}
                />
              )}
              <div className="meta-info">
                <time className="post-date">
                  {post.date ? new Date(post.date).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  }) : ''}
                </time>
                {post.readingTime && (
                  <span className="reading-time">{post.readingTime}</span>
                )}
              </div>
              
              {post.categories && post.categories.length > 0 && (
                <div className="post-categories">
                  {post.categories.map((category, index) => (
                    <span key={index} className="category-tag">
                      {category.name}
                    </span>
                  ))}
                </div>
              )}

              {/* Featured Image in Hero */}
              {post.featuredImage?.node ? (
                <div className="featured-image">
                  <Image
                    src={post.featuredImage.node.sourceUrl}
                    alt={post.featuredImage.node.altText || post.title || ''}
                    width={post.featuredImage.node.mediaDetails?.width || 1200}
                    height={post.featuredImage.node.mediaDetails?.height || 600}
                    className="project-featured-image"
                    priority
                    placeholder="blur"
                    blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBQYFBAYGBQYHBwYIChAKCgkJChQODwwQFxQYGBcUFhYaHSUfGhsjHBYWICwgIyYnKSopGR8tMC0oMCUoKSj/2wBDAQcHBwoIChMKChMoGhYaKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCgoKCj/wAARCAABAAEDASIAAhEBAxEB/8QAFQABAQAAAAAAAAAAAAAAAAAAAAv/xAAUEAEAAAAAAAAAAAAAAAAAAAAA/8QAFQEBAQAAAAAAAAAAAAAAAAAAAAX/xAAUEQEAAAAAAAAAAAAAAAAAAAAA/9oADAMBAAIRAxEAPwCdABmX/9k="
                  />
                </div>
              ) : (
                <div className="featured-image">
                  <Image
                    src="/images/Blog-sample-img.png"
                    alt={post.title || 'Blog Post'}
                    width={1200}
                    height={600}
                    className="project-featured-image"
                    priority
                  />
                </div>
              )}
            </div>
          </div>

          <div className="container">
            {/* Article Content */}
            <section className="article-content">
              <div
                className="content"
                dangerouslySetInnerHTML={{ __html: post.content || '' }}
              />
            </section>

            {/* Author Section */}
            {post.author && (
              <section className="author-section">
                <h2>About the Author</h2>
                <div className="author-info">
                  <div className="author-details">
                    <h3 className="author-name">{post.author.name}</h3>
                    <p className="author-bio">
                      {post.author.bio || "Full-stack developer passionate about modern web technologies."}
                    </p>
                  </div>
                </div>
              </section>
            )}

            {/* Tags Section */}
            {post.tags && post.tags.length > 0 && (
              <section className="tags-section">
                <h2>Tags</h2>
                <div className="tags-list">
                  {post.tags.map((tag: any, index: number) => (
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
            <Suspense fallback={<div className="loading-more">Loading more articles...</div>}>
              <InfoCards
                skin="blog"
                variant="light"
                sectionTitle="More Articles"
                columns={3}
                cards={moreArticles.map((article: WordPressPost) => ({
                  title: article.title || 'Untitled',
                  description: article.excerpt?.replace(/<[^>]*>/g, '').substring(0, 120) + '...' || '',
                  image: article.featuredImage?.node?.sourceUrl || "/images/Blog-sample-img.png",
                  link: `/notebook/${article.slug}`,
                  variant: 'light' as const
                }))}
              />
            </Suspense>
          )}
        </main>
        <Footer />
      </>
    );
  } catch (error) {
    console.error('Error loading blog post:', error);
    notFound();
  }
}

// Enable ISR (Incremental Static Regeneration)
export const revalidate = 3600; // Revalidate every hour