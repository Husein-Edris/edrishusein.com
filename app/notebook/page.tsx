'use client';
import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/Blog.scss';
import '@/src/styles/pages/BlogPost.scss';

export default function BlogArchivePage() {
    const [posts, setPosts] = useState([]);
    const [currentPost, setCurrentPost] = useState(null);
    const searchParams = useSearchParams();
    const slug = searchParams.get('slug');

    useEffect(() => {
        async function fetchPosts() {
            try {
                console.log('🔍 Fetching posts via REST API');
                const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/posts?_embed&per_page=100`);
                
                if (response.ok) {
                    const postsData = await response.json();
                    
                    const transformedPosts = postsData.map((post: any) => ({
                        id: post.id.toString(),
                        title: post.title?.rendered || post.title,
                        excerpt: post.excerpt?.rendered || post.excerpt || '',
                        slug: post.slug,
                        content: post.content?.rendered || '',
                        date: post.date,
                        featuredImage: post._embedded?.['wp:featuredmedia']?.[0] ? {
                            node: {
                                sourceUrl: post._embedded['wp:featuredmedia'][0].source_url,
                                altText: post._embedded['wp:featuredmedia'][0].alt_text || post.title?.rendered || '',
                                mediaDetails: {
                                    width: post._embedded['wp:featuredmedia'][0].media_details?.width || 400,
                                    height: post._embedded['wp:featuredmedia'][0].media_details?.height || 400
                                }
                            }
                        } : null
                    }));
                    
                    setPosts(transformedPosts);
                    console.log(`✅ Loaded ${transformedPosts.length} posts`);
                    
                    // If slug is provided, find and set the current post
                    if (slug) {
                        const post = transformedPosts.find(p => p.slug === slug);
                        if (post) {
                            setCurrentPost(post);
                        }
                    }
                }
            } catch (error) {
                console.error('❌ Error fetching posts:', error);
            }
        }

        fetchPosts();
    }, [slug]);

    // If slug is provided and post is found, show individual post
    if (slug && currentPost) {
        return (
            <>
                <Header />
                <main className="blog-post">
                    <div className="container">
                        <Link href="/notebook" className="back-link">
                            ← Back to Notebook
                        </Link>
                        <article className="post-content">
                            <h1 className="post-title">{currentPost.title}</h1>
                            
                            {currentPost.featuredImage?.node && (
                                <div className="post-featured-image">
                                    <Image
                                        src={currentPost.featuredImage.node.sourceUrl}
                                        alt={currentPost.featuredImage.node.altText || currentPost.title}
                                        width={currentPost.featuredImage.node.mediaDetails?.width || 800}
                                        height={currentPost.featuredImage.node.mediaDetails?.height || 600}
                                        className="featured-image"
                                        priority
                                    />
                                </div>
                            )}
                            
                            <div 
                                className="post-body"
                                dangerouslySetInnerHTML={{ __html: currentPost.content }} 
                            />
                        </article>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // If slug is provided but post not found
    if (slug && !currentPost) {
        return (
            <>
                <Header />
                <main className="blog-post">
                    <div className="container">
                        <Link href="/notebook" className="back-link">
                            ← Back to Notebook
                        </Link>
                        <h1>Post Not Found</h1>
                        <p>The post you're looking for doesn't exist or has been removed.</p>
                    </div>
                </main>
                <Footer />
            </>
        );
    }

    // Default: show all posts
    return (
        <>
            <Header />
            <main className="blog-archive">
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
                                <Link href={`/notebook?slug=${post.slug}`} key={post.id} className="blog-card">
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
                                            <h3 className="card-title">{post.title}</h3>
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