'use client';
import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/Blog.scss';

export default function BlogArchivePage() {
    const [posts, setPosts] = useState([]);

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
                }
            } catch (error) {
                console.error('❌ Error fetching posts:', error);
            }
        }

        fetchPosts();
    }, []);

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