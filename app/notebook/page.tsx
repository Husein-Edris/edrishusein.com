import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest } from '@/src/lib/rest-client';
import { transformPostListItem } from '@/src/lib/transform/transformPost';
import '@/src/styles/pages/Blog.scss';

// ISR — cached render refreshed at most once per 60s (keep in sync with CMS_REVALIDATE = 60).
export const revalidate = 60;

export const metadata: Metadata = {
  title: 'Notebook - Edris Husein',
  description: 'Thoughts, insights, and reflections on web development, technology, and the craft of building software by Edris Husein.',
  alternates: { canonical: '/notebook' },
};

async function getPostsData() {
    try {
        const posts = await cmsRest<unknown[]>('/posts?_embed&per_page=100&orderby=date&order=desc');
        if (!Array.isArray(posts)) return [];
        if (process.env.NODE_ENV === 'development') {
            console.log(`✅ ${posts.length} posts loaded via REST API`);
        }
        return rewriteImageUrls(posts.map((p) => transformPostListItem(p as never)));
    } catch (error) {
        console.error('Error fetching posts:', error);
        return [];
    }
}

export default async function BlogArchivePage() {
    const posts = await getPostsData();

    return (
        <>
            <Header />
            <main id="main-content" tabIndex={-1} className="blog-archive">
                <div className="hero-section">
                    <h1 className="title">NOTEBOOK</h1>
                    <p className="description">
                        My thoughts, insights, and reflections
                    </p>
                </div>

                <div className="container">
                    <div className="blog-grid">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <Link href={`/notebook/${post.slug}`} key={post.id} className="blog-card">
                                    <div className="card-content">
                                        {post.featuredImage?.node && (
                                            <div className="card-image">
                                                <Image
                                                    src={post.featuredImage.node.sourceUrl}
                                                    alt={post.featuredImage.node.altText || post.title}
                                                    fill
                                                    className="post-image"
                                                />
                                            </div>
                                        )}
                                        <div className="card-info">
                                            {/* h2: sits directly under the page h1, no h2 in between (WCAG 1.3.1) */}
                                            <h2 className="card-title">{post.title}</h2>
                                            {post.excerpt && (
                                                <div
                                                    className="card-description"
                                                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="no-posts-message" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                <p>No posts available at the moment. Please check back later.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}