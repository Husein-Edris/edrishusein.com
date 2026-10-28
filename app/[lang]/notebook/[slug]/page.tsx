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
import { buildArticleToc } from '@/src/lib/article-toc';
import { withSidenotes, splitLead } from '@/src/lib/article-sidenotes';
import PostMeta from '@/src/components/PostMeta/PostMeta';
import { selectRelatedByRotation } from '@/src/lib/related-content';
import {
  localizedPostDetail,
  localizedPostListItem,
  type PostDetail,
  type PostListItem,
} from '@/src/lib/transform/transformPost';
import { absoluteUrl, alternatesFor, localePath } from '@/src/lib/i18n/paths';
import { OG_LOCALE, otherLang, type Lang } from '@/src/lib/i18n/lang';
import { dictionary } from '@/src/lib/i18n/dictionary';
import { langFromParams } from '@/src/lib/i18n/route';

type PostParams = { params: Promise<{ lang: string; slug: string }> };

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
export async function generateMetadata({ params }: PostParams) {
  const { slug } = await params;
  const lang = await langFromParams(params);
  const text = dictionary(lang);

  const post = await getPost(slug, lang);

  if (!post) {
    return {
      title: text.articleFallbackTitle,
      description: text.articleFallbackDescription,
    };
  }

  const path = `/notebook/${slug}`;
  return {
    title: `${post.title} - Edris Husein`,
    description: metaDescriptionFrom(post.excerpt) || text.articleFallbackDescription,
    alternates: alternatesFor(path, lang),
    openGraph: {
      title: post.title,
      description: metaDescriptionFrom(post.excerpt),
      url: localePath(path, lang),
      locale: OG_LOCALE[lang],
      alternateLocale: [OG_LOCALE[otherLang(lang)]],
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
async function getPost(slug: string, lang: Lang): Promise<PostDetail | null> {
  const posts = await cmsRest<unknown[]>(`/posts?slug=${encodeURIComponent(slug)}&_embed&acf_format=standard`);
  if (!Array.isArray(posts) || posts.length === 0) {
    return null;
  }
  return rewriteImageUrls(localizedPostDetail(posts[0] as never, lang));
}

async function getMoreArticles(excludeSlug: string, lang: Lang): Promise<PostListItem[]> {
  try {
    // Fetch the whole archive, not just the newest 4. Slicing the 3 most recent
    // meant every post linked to the same 3 slugs, orphaning older posts from the
    // sibling link graph (measured inbound links: 8, 8, 8, 4, 1, 1, 1).
    const posts = await cmsRest<unknown[]>('/posts?_embed&per_page=100&orderby=date&order=desc');
    if (!Array.isArray(posts)) return [];
    const all = posts.map((p) => localizedPostListItem(p as never, lang));
    return rewriteImageUrls(selectRelatedByRotation(all, excludeSlug, 3));
  } catch (error) {
    if (isTransientCmsError(error)) throw error;
    console.error('Error fetching more articles:', error);
    return [];
  }
}

// Server Component
export default async function BlogPostPage({ params }: PostParams) {
  const { slug } = await params;
  const lang = await langFromParams(params);
  const text = dictionary(lang);
  
  const [post, moreArticles, siteContent] = await Promise.all([
    getPost(slug, lang),
    getMoreArticles(slug, lang),
    getSiteContent(lang),
  ]);
  const copy = siteContent.articleTemplate;
  const metaLabels = siteContent.notebookPage;

  // Only a genuine "no such slug" reaches here; a CMS outage propagates as a
  // CmsRequestError and fails the build instead of publishing an empty page.
  if (!post) {
    notFound();
  }

  // The article's own language: German when it has a German body on /de
  // (content_de), otherwise the stopword guess over the original CMS text. It
  // sets inLanguage and a lang attribute where it differs from the page.
  const articleLanguage = post.language;
  const langAttr = articleLanguage !== lang ? articleLanguage : undefined;
  const canonical = absoluteUrl(`/notebook/${slug}`, lang);
  // Ids on every h2 for the contents links; items stay empty below two headings.
  const toc = buildArticleToc(post.content || '');
  // Data-margin layout: cited paragraphs carry their source and figure in the margin column.
  const body = splitLead(withSidenotes(toc.html));
  const takeaways = post.conclusionSection?.conclusionPoints.filter((p) => p.pointText) ?? [];

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
      url: absoluteUrl('/about', lang),
    },
    publisher: {
      '@type': 'Person',
      '@id': 'https://edrishusein.com/#person',
      name: 'Edris Husein',
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': canonical,
    },
  };

  const breadcrumbJsonLd = generateBreadcrumbStructuredData([
    { text: siteContent.chrome.breadcrumbHome, url: absoluteUrl('/', lang) },
    { text: siteContent.nav.notebook, url: absoluteUrl('/notebook', lang) },
    { text: post.title, url: canonical },
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
      <main id="main-content" tabIndex={-1} className="case-study blog-post post-margin">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="container">
            <nav className="breadcrumbs" aria-label={text.breadcrumbLabel}>
              <Link href={localePath('/', lang)}>{siteContent.chrome.breadcrumbHome}</Link>
              <span className="separator" aria-hidden="true">/</span>
              <Link href={localePath('/notebook', lang)}>{siteContent.nav.notebook}</Link>
              <span className="separator" aria-hidden="true">/</span>
              <span className="current" lang={langAttr}>{post.title || text.untitled}</span>
            </nav>
            <PostMeta
              className="article-header__meta"
              date={post.date}
              readingMinutes={post.readingMinutes}
              language={articleLanguage}
              labels={metaLabels}
              lang={lang}
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
          <div className="post-margin__grid">
            <section className="article-content" lang={langAttr}>
              <div className="content">
                {body.lead && <div className="post-margin__flow" dangerouslySetInnerHTML={{ __html: body.lead }} />}
                {takeaways.length > 0 && (
                  <aside className="post-margin__takeaways" aria-label={post.conclusionSection?.conclusionTitle || undefined}>
                    <p className="post-margin__takeaways-title">{post.conclusionSection?.conclusionTitle}</p>
                    <ul>
                      {takeaways.map((point) => (
                        <li key={point.pointText}>{point.pointText}</li>
                      ))}
                    </ul>
                  </aside>
                )}
                <div className="post-margin__flow" dangerouslySetInnerHTML={{ __html: body.rest }} />
              </div>
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
              title: article.title || text.untitled,
              description: article.excerpt?.replace(/<[^>]*>/g, '').substring(0, 120) + '...' || '',
              image: article.featuredImage?.node?.sourceUrl || "/images/Blog-sample-img.png",
              link: localePath(`/notebook/${article.slug}`, lang),
              variant: 'dark' as const
            }))}
            lang={lang}
          />
        )}
      </main>
      <Footer lang={lang} />
    </>
  );
}

// Enable ISR (Incremental Static Regeneration): static literal required by Next
// (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;