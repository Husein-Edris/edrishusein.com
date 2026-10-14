// Server Component for blog posts with SSG
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import '@/src/styles/pages/BlogPost.scss';
import '@/src/styles/pages/CaseStudy.scss';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest, isTransientCmsError } from '@/src/lib/rest-client';
import { safeJsonLd, metaDescriptionFrom, generateBreadcrumbStructuredData } from '@/src/lib/seo-utils';
import { getSiteContent } from '@/src/lib/site-content';
import { detectContentLanguage } from '@/src/lib/detect-language';
import { buildArticleToc } from '@/src/lib/article-toc';
import ArticleToc from '@/src/components/ArticleToc/ArticleToc';
import PostMeta from '@/src/components/PostMeta/PostMeta';
import { selectRelatedByRotation } from '@/src/lib/related-content';
import {
  transformPostDetail,
  transformPostListItem,
  languageSample,
  type PostDetail,
  type PostListItem,
} from '@/src/lib/transform/transformPost';

// Generate static params for all blog posts (direct REST: no self-HTTP)
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

  const post = await getPost(slug);

  if (!post) {
    return {
      title: 'Article | Notebook - Edris Husein',
      description: 'Read more on Edris Husein\'s notebook',
    };
  }

  return {
    title: `${post.title} - Edris Husein`,
    description: metaDescriptionFrom(post.excerpt) || 'Read more on Edris Husein\'s notebook',
    alternates: { canonical: `/notebook/${slug}` },
    openGraph: {
      title: post.title,
      description: metaDescriptionFrom(post.excerpt),
      url: `/notebook/${slug}`,
      images: post.featuredImage?.node?.sourceUrl ? [post.featuredImage.node.sourceUrl] : [],
      type: 'article',
      publishedTime: post.date,
      authors: [post.author?.name || 'Edris Husein'],
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: metaDescriptionFrom(post.excerpt),
      images: post.featuredImage?.node?.sourceUrl ? [post.featuredImage.node.sourceUrl] : [],
    },
  };
}

// Server-side data fetching (direct REST + transform).
//
// Returns null only when the CMS answers "no such post". A CmsRequestError is
// deliberately left to propagate: it means the CMS could not answer at all, and
// treating that as a 404 is what let a transient database error get baked into
// the static build as a permanently empty page.
async function getPost(slug: string): Promise<PostDetail | null> {
  const posts = await cmsRest<unknown[]>(`/posts?slug=${encodeURIComponent(slug)}&_embed&acf_format=standard`);
  if (!Array.isArray(posts) || posts.length === 0) {
    return null;
  }
  return rewriteImageUrls(transformPostDetail(posts[0] as never));
}

async function getMoreArticles(excludeSlug: string): Promise<PostListItem[]> {
  try {
    // Fetch the whole archive, not just the newest 4. Slicing the 3 most recent
    // meant every post linked to the same 3 slugs, orphaning older posts from the
    // sibling link graph (measured inbound links: 8, 8, 8, 4, 1, 1, 1).
    const posts = await cmsRest<unknown[]>('/posts?_embed&per_page=100&orderby=date&order=desc');
    if (!Array.isArray(posts)) return [];
    const all = posts.map((p) => transformPostListItem(p as never));
    return rewriteImageUrls(selectRelatedByRotation(all, excludeSlug, 3));
  } catch (error) {
    if (isTransientCmsError(error)) throw error;
    console.error('Error fetching more articles:', error);
    return [];
  }
}

// Server Component
export default async function BlogPostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  const [post, moreArticles, siteContent] = await Promise.all([
    getPost(slug),
    getMoreArticles(slug),
    getSiteContent(),
  ]);
  const copy = siteContent.articleTemplate;
  const metaLabels = siteContent.notebookPage;

  // Only a genuine "no such slug" reaches here; a CMS outage propagates as a
  // CmsRequestError and fails the build instead of publishing an empty page.
  if (!post) {
    notFound();
  }

  // German articles must not claim inLanguage "en" (or render under a bare
  // lang="en" subtree); detection is a stopword heuristic over the CMS text.
  const articleLanguage = detectContentLanguage(languageSample(post.title, post.excerpt || '', post.content || ''));
  const langAttr = articleLanguage === 'de' ? 'de' : undefined;
  // Ids on every h2 for the contents links; items stay empty below two headings.
  const toc = buildArticleToc(post.content || '');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.excerpt?.replace(/<[^>]*>/g, '').trim() || undefined,
    image: post.featuredImage?.node?.sourceUrl || undefined,
    datePublished: post.date || undefined,
    dateModified: post.modified || post.date || undefined,
    inLanguage: articleLanguage,
    author: {
      '@type': 'Person',
      '@id': 'https://edrishusein.com/#person',
      name: 'Edris Husein',
      url: 'https://edrishusein.com/about',
    },
    publisher: {
      '@type': 'Person',
      '@id': 'https://edrishusein.com/#person',
      name: 'Edris Husein',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `https://edrishusein.com/notebook/${slug}`,
    },
  };

  const breadcrumbJsonLd = generateBreadcrumbStructuredData([
    { text: 'Home', url: 'https://edrishusein.com' },
    { text: 'Notebook', url: 'https://edrishusein.com/notebook' },
    { text: post.title, url: `https://edrishusein.com/notebook/${slug}` },
  ]);

  return (
    <>
      <script
        type="application/ld+json"
        // safeJsonLd escapes <, >, &, U+2028/9 so CMS-sourced text
        // (title/excerpt) can never break out of the script tag (XSS guard).
        dangerouslySetInnerHTML={{ __html: safeJsonLd(jsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: safeJsonLd(breadcrumbJsonLd) }}
      />
      <Header />
      <main id="main-content" tabIndex={-1} className="case-study blog-post">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="container">
            <nav className="breadcrumbs" aria-label="Breadcrumb">
              <Link href="/">Home</Link>
              <span className="separator" aria-hidden="true">/</span>
              <Link href="/notebook">Notebook</Link>
              <span className="separator" aria-hidden="true">/</span>
              <span className="current">{post.title || 'Post'}</span>
            </nav>
            <PostMeta
              className="article-header__meta"
              date={post.date}
              readingMinutes={post.readingMinutes}
              language={articleLanguage}
              labels={metaLabels}
            />
            <h1 className="title" lang={langAttr}>
              {post.title}
            </h1>
            {post.excerpt && (
              <div
                className="overview"
                lang={langAttr}
                dangerouslySetInnerHTML={{ __html: post.excerpt }}
              />
            )}

            {/* Featured image only when the post has one; no stock fallback picture. */}
            {post.featuredImage?.node && (
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
            )}
          </div>
        </div>

        <div className="container">
          {/* Article content, centered, with the sticky contents column on desktop (design C1). */}
          <div className={`article-layout${toc.items.length > 0 ? ' article-layout--with-toc' : ''}`}>
            {toc.items.length > 0 && (
              <aside className="article-layout__toc">
                <ArticleToc items={toc.items} heading={copy.tocHeading} lang={langAttr} />
              </aside>
            )}
            <section className="article-content" lang={langAttr}>
              <div
                className="content"
                dangerouslySetInnerHTML={{ __html: toc.html }}
              />
            </section>
          </div>

          {/* Author Section */}
          {post.author && (
            <section className="author-section">
              <h2>{copy.authorHeading}</h2>
              <div className="author-info">
                <div className="author-details">
                  <h3 className="author-name">{post.author.name}</h3>
                  <p className="author-bio">
                    {post.author.bio || copy.authorBioFallback}
                  </p>
                </div>
              </div>
            </section>
          )}

          {/* Tags Section */}
          {post.tags && post.tags.length > 0 && (
            <section className="tags-section">
              <h2>{copy.tagsHeading}</h2>
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
          <InfoCards
            skin="blog"
            variant="dark"
            sectionTitle={copy.moreArticlesHeading}
            columns={3}
            cards={moreArticles.map((article) => ({
              title: article.title || 'Untitled',
              description: article.excerpt?.replace(/<[^>]*>/g, '').substring(0, 120) + '...' || '',
              image: article.featuredImage?.node?.sourceUrl || "/images/Blog-sample-img.png",
              link: `/notebook/${article.slug}`,
              variant: 'dark' as const
            }))}
          />
        )}
      </main>
      <Footer />
    </>
  );
}

// Enable ISR (Incremental Static Regeneration): static literal required by Next
// (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;