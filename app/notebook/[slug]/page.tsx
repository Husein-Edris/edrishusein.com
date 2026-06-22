// Server Component for blog posts with SSG
import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import '@/src/styles/pages/BlogPost.scss';
import '@/src/styles/pages/CaseStudy.scss';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest } from '@/src/lib/rest-client';
import {
  transformPostDetail,
  transformPostListItem,
  type PostDetail,
  type PostListItem,
} from '@/src/lib/transform/transformPost';

// Generate static params for all blog posts (direct REST — no self-HTTP)
export async function generateStaticParams() {
  try {
    const posts = await cmsRest<Array<{ slug: string }>>('/posts?per_page=50&_fields=slug');
    return posts.map((post) => ({ slug: post.slug }));
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

// Server-side data fetching (direct REST + transform)
async function getPost(slug: string): Promise<PostDetail> {
  const posts = await cmsRest<unknown[]>(`/posts?slug=${slug}&_embed&acf_format=standard`);
  if (!Array.isArray(posts) || posts.length === 0) {
    throw new Error('Post not found');
  }
  return rewriteImageUrls(transformPostDetail(posts[0] as never));
}

async function getMoreArticles(excludeSlug: string): Promise<PostListItem[]> {
  try {
    const posts = await cmsRest<unknown[]>('/posts?_embed&per_page=4&orderby=date&order=desc');
    if (!Array.isArray(posts)) return [];
    return rewriteImageUrls(
      posts
        .map((p) => transformPostListItem(p as never))
        .filter((p) => p.slug !== excludeSlug)
        .slice(0, 3)
    );
  } catch (error) {
    console.error('Error fetching more articles:', error);
    return [];
  }
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
        <main id="main-content" className="case-study blog-post">
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
                cards={moreArticles.map((article) => ({
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

// Enable ISR (Incremental Static Regeneration) — static literal required by Next
// (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;