'use client';
// Client Component for blog post pages
import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/BlogPost.scss';

export default function BlogPostPage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPost() {
      if (!slug) return;
      
      try {
        console.log(`🔍 Fetching post: ${slug}`);
        const response = await fetch(`${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/posts?slug=${slug}&_embed`);
        
        if (response.ok) {
          const postData = await response.json();
          
          if (postData.length > 0) {
            const postItem = postData[0];
            const transformedPost = {
              id: postItem.id,
              title: postItem.title?.rendered || postItem.title,
              content: postItem.content?.rendered || postItem.content || '',
              excerpt: postItem.excerpt?.rendered || postItem.excerpt || '',
              date: postItem.date,
              featuredImage: postItem._embedded?.['wp:featuredmedia']?.[0] ? {
                node: {
                  sourceUrl: postItem._embedded['wp:featuredmedia'][0].source_url,
                  altText: postItem._embedded['wp:featuredmedia'][0].alt_text || postItem.title?.rendered || '',
                  mediaDetails: {
                    width: postItem._embedded['wp:featuredmedia'][0].media_details?.width || 800,
                    height: postItem._embedded['wp:featuredmedia'][0].media_details?.height || 600
                  }
                }
              } : null,
              author: postItem._embedded?.author?.[0] || { name: 'Edris Husein' }
            };
            
            setPost(transformedPost);
            console.log(`✅ Loaded post: ${transformedPost.title}`);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching post:', error);
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [slug]);

  if (!post && !loading) {
    return (
      <>
        <Header />
        <main className="blog-post">
          <div className="container">
            <h1>Post Not Found</h1>
            <p>The post you're looking for doesn't exist or has been removed.</p>
            <Link href="/notebook" className="btn btn-primary">
              Back to Notebook
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="blog-post">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="container">
            <Link href="/notebook" className="back-link">
              ← Back to Notebook
            </Link>
            <h1 className="title">{post?.title || 'Loading...'}</h1>
            {post?.date && (
              <div className="post-meta">
                <span className="date">
                  {new Date(post.date).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
                <span className="author">by {post.author?.name || 'Edris Husein'}</span>
              </div>
            )}
          </div>
        </div>

        {/* Featured Image */}
        {post?.featuredImage?.node && (
          <div className="featured-image-section">
            <div className="container">
              <Image
                src={post.featuredImage.node.sourceUrl}
                alt={post.featuredImage.node.altText || post.title}
                width={post.featuredImage.node.mediaDetails?.width || 800}
                height={post.featuredImage.node.mediaDetails?.height || 600}
                className="featured-image"
                priority
              />
            </div>
          </div>
        )}

        {/* Content Section */}
        {post?.content && (
          <div className="content-section">
            <div className="container">
              <article 
                className="post-content"
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </div>
          </div>
        )}

        {/* Navigation */}
        <div className="post-navigation">
          <div className="container">
            <Link href="/notebook" className="btn btn-outline">
              ← Back to All Posts
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}