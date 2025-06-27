// Backup of the original blog post page
"use client";

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';

export default function BlogPostPageSimple() {
  const params = useParams();
  const slug = Array.isArray(params.slug) ? params.slug[0] : params.slug;

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', minHeight: '60vh' }}>
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>
          <Link href="/notebook" style={{ color: '#666', textDecoration: 'none', marginBottom: '2rem', display: 'inline-block' }}>
            ← Back to Notebook
          </Link>
          <h1>Blog Post: {slug}</h1>
          <p>This is a simplified version to test if the page loads.</p>
          <p>If you see this, the routing and basic rendering works.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}