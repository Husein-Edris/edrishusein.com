import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest, isTransientCmsError } from '@/src/lib/rest-client';
import { localizedPostListItem } from '@/src/lib/transform/transformPost';
import { getSiteContent } from '@/src/lib/site-content';
import { decodeEntities } from '@/src/lib/transform/decodeEntities';
import PostMeta from '@/src/components/PostMeta/PostMeta';
import { generateCollectionPageStructuredData, pageOpenGraph, safeJsonLd } from '@/src/lib/seo-utils';
import { alternatesFor, localePath } from '@/src/lib/i18n/paths';
import type { Lang } from '@/src/lib/i18n/lang';
import { langFromParams, type LangParams } from '@/src/lib/i18n/route';
import '@/src/styles/pages/Blog.scss';

// ISR: cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const lang = await langFromParams(params);
  const { meta } = await getSiteContent(lang);
  return {
    title: meta.notebookTitle,
    description: meta.notebookDescription,
    alternates: alternatesFor('/notebook', lang),
    openGraph: pageOpenGraph({ title: meta.notebookTitle, description: meta.notebookDescription, path: '/notebook', lang }),
  };
}

// The list thumbnail is a small fixed square (see Blog.scss .notebook-list__thumb).
const THUMB_SIZES = '(max-width: 768px) 80px, 128px';

function plainExcerpt(html: string): string {
    return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

// A transient CMS failure rethrows so ISR keeps serving the last good archive
// instead of caching "No posts available" for the next window.
async function getPostsData(lang: Lang) {
    try {
        const posts = await cmsRest<unknown[]>('/posts?_embed&per_page=100&orderby=date&order=desc');
        if (!Array.isArray(posts)) return [];
        return rewriteImageUrls(posts.map((p) => localizedPostListItem(p as never, lang)));
    } catch (error) {
        if (isTransientCmsError(error)) throw error;
        console.error('Error fetching posts:', error);
        return [];
    }
}

export default async function BlogArchivePage({ params }: LangParams) {
    const lang = await langFromParams(params);
    const [posts, siteContent] = await Promise.all([getPostsData(lang), getSiteContent(lang)]);
    const copy = siteContent.notebookPage;

    const collectionJsonLd = generateCollectionPageStructuredData({
        name: siteContent.nav.notebook,
        description: siteContent.meta.notebookDescription,
        path: localePath('/notebook', lang),
        items: posts.map((post) => ({ title: post.title, path: localePath(`/notebook/${post.slug}`, lang) })),
        lang,
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
                        // Text-first list (2026-10-14): one column, equal weight per post, the
                        // cover as a small uncropped thumbnail so the titles lead, not the art.
                        <ul className="notebook-list">
                            {posts.map((post, index) => {
                                // lang only where the post differs from the page language.
                                const postLang = post.language !== lang ? post.language : undefined;
                                const image = post.featuredImage?.node;
                                const excerpt = plainExcerpt(post.excerpt);
                                return (
                                    <li key={post.id} className="notebook-list__item">
                                        <div className="notebook-list__body">
                                            <PostMeta
                                                date={post.date}
                                                readingMinutes={post.readingMinutes}
                                                language={post.language}
                                                labels={copy}
                                                lang={lang}
                                            />
                                            {/* h2: sits directly under the page h1 (WCAG 1.3.1). The link covers the whole row. */}
                                            <h2 className="notebook-list__title" lang={postLang}>
                                                <Link href={localePath(`/notebook/${post.slug}`, lang)} className="notebook-list__link">
                                                    {post.title}
                                                </Link>
                                            </h2>
                                            {excerpt && (
                                                <p className="notebook-list__excerpt" lang={postLang}>
                                                    {excerpt}
                                                </p>
                                            )}
                                        </div>
                                        {image && (
                                            <div className="notebook-list__thumb">
                                                <Image
                                                    src={image.sourceUrl}
                                                    alt=""
                                                    fill
                                                    sizes={THUMB_SIZES}
                                                    priority={index === 0}
                                                    className="notebook-list__image"
                                                />
                                            </div>
                                        )}
                                    </li>
                                );
                            })}
                        </ul>
                    ) : (
                        <p className="no-posts-message">{copy.emptyMessage}</p>
                    )}
                </div>
            </main>
            <Footer lang={lang} />
        </>
    );
}