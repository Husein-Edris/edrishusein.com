import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest, isTransientCmsError } from '@/src/lib/rest-client';
import { transformPostListItem } from '@/src/lib/transform/transformPost';
import { getSiteContent } from '@/src/lib/site-content';
import { magazineSizes, showsExcerpt } from '@/src/lib/magazine-layout';
import { decodeEntities } from '@/src/lib/transform/decodeEntities';
import PostMeta from '@/src/components/PostMeta/PostMeta';
import { generateCollectionPageStructuredData, pageOpenGraph, safeJsonLd } from '@/src/lib/seo-utils';
import '@/src/styles/pages/Blog.scss';

// ISR: cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Notebook: Web Development Articles - Edris Husein',
  description: 'Web development articles and notes by Edris Husein: Next.js, React, WordPress and SEO, written from real client projects in Austria and Germany.',
  alternates: { canonical: '/notebook' },
  openGraph: pageOpenGraph({
    title: 'Notebook: Web Development Articles - Edris Husein',
    description: 'Web development articles and notes by Edris Husein: Next.js, React, WordPress and SEO, written from real client projects in Austria and Germany.',
    path: '/notebook',
  }),
};

// Rendered width of each card size, for next/image srcset selection.
const IMAGE_SIZES = {
    xl: '(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 800px',
    m: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px',
    s: '(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px',
    w: '(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 600px',
    full: '(max-width: 768px) 100vw, 1200px',
} as const;

function plainExcerpt(html: string): string {
    return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

// A transient CMS failure rethrows so ISR keeps serving the last good archive
// instead of caching "No posts available" for the next window.
async function getPostsData() {
    try {
        const posts = await cmsRest<unknown[]>('/posts?_embed&per_page=100&orderby=date&order=desc');
        if (!Array.isArray(posts)) return [];
        return rewriteImageUrls(posts.map((p) => transformPostListItem(p as never)));
    } catch (error) {
        if (isTransientCmsError(error)) throw error;
        console.error('Error fetching posts:', error);
        return [];
    }
}

export default async function BlogArchivePage() {
    const [posts, siteContent] = await Promise.all([getPostsData(), getSiteContent()]);
    const copy = siteContent.notebookPage;
    const sizes = magazineSizes(posts.length);

    const collectionJsonLd = generateCollectionPageStructuredData({
        name: 'Notebook',
        description: 'Thoughts, insights, and reflections on web development, technology, and the craft of building software by Edris Husein.',
        path: '/notebook',
        items: posts.map((post) => ({ title: post.title, path: `/notebook/${post.slug}` })),
    });

    return (
        <>
            <script
                type="application/ld+json"
                // safeJsonLd escapes <, >, &, U+2028/9 so CMS-sourced post titles
                // can never break out of the script tag (XSS guard).
                dangerouslySetInnerHTML={{ __html: safeJsonLd(collectionJsonLd) }}
            />
            <Header />
            <main id="main-content" tabIndex={-1} className="blog-archive">
                <div className="hero-section">
                    <h1 className="title">
                        {copy.title}
                        <span className="subtitle">
                            {copy.subtitle}
                        </span>
                    </h1>
                </div>

                <div className="container">
                    {posts.length > 0 ? (
                        <ul className="magazine">
                            {posts.map((post, index) => {
                                const size = sizes[index];
                                const lang = post.language === 'de' ? 'de' : undefined;
                                const image = post.featuredImage?.node;
                                const excerpt = showsExcerpt(size) ? plainExcerpt(post.excerpt) : '';
                                return (
                                    <li key={post.id} className={`magazine__card magazine__card--${size}`}>
                                        <div className="magazine__media">
                                            {image ? (
                                                <Image
                                                    src={image.sourceUrl}
                                                    alt=""
                                                    fill
                                                    sizes={IMAGE_SIZES[size]}
                                                    priority={index === 0}
                                                    className="magazine__image"
                                                />
                                            ) : (
                                                // No featured image: a tinted block with the title, never a stock picture.
                                                <span className="magazine__placeholder" aria-hidden="true" lang={lang}>
                                                    {post.title}
                                                </span>
                                            )}
                                        </div>
                                        <div className="magazine__body">
                                            <PostMeta
                                                date={post.date}
                                                readingMinutes={post.readingMinutes}
                                                language={post.language}
                                                labels={copy}
                                            />
                                            {/* h2: sits directly under the page h1 (WCAG 1.3.1). The link covers the whole card. */}
                                            <h2 className="magazine__title" lang={lang}>
                                                <Link href={`/notebook/${post.slug}`} className="magazine__link">
                                                    {post.title}
                                                </Link>
                                            </h2>
                                            {excerpt && (
                                                <p className="magazine__excerpt" lang={lang}>
                                                    {excerpt}
                                                </p>
                                            )}
                                        </div>
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="no-posts-message">{copy.emptyMessage}</p>
                    )}
                </div>
            </main>
            <Footer />
        </>
    );
}