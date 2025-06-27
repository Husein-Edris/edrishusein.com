// Simple blog post page for testing
"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';

export default function BlogPostPageSimple() {
  const params = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  useEffect(() => {
    fetch(`/api/post?slug=${slug}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setPost(data.post);
        } else {
          setError('Post not found');
        }
        setLoading(false);
      })
      .catch(err => {
        setError('Failed to load post');
        setLoading(false);
      });
  }, [slug]);

  if (loading) return (
    <>
      <Header />
      <main style={{ padding: '2rem', minHeight: '60vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <p>Loading...</p>
        </div>
      </main>
      <Footer />
    </>
  );

  if (error) return (
    <>
      <Header />
      <main style={{ padding: '2rem', minHeight: '60vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <h1>Error</h1>
          <p>{error}</p>
          <Link href="/notebook">← Back to Notebook</Link>
        </div>
      </main>
      <Footer />
    </>
  );

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', minHeight: '60vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/notebook" style={{ color: '#666', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
            ← Back to Notebook
          </Link>
          
          {post && (
            <>
              <h1 style={{ marginBottom: '1rem' }}>{post.title}</h1>
              <div style={{ marginBottom: '2rem', color: '#666' }}>
                {post.readingTime} • {new Date(post.date).toLocaleDateString()}
              </div>
              <div 
                style={{ lineHeight: '1.6' }}
                dangerouslySetInnerHTML={{ __html: post.content }} 
              />
            </>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}