// Test blog post page
"use client";

import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';

export default function TestBlogPost() {
  return (
    <>
      <Header />
      <main className="blog-post">
        <div className="container">
          <h1>Test Blog Post</h1>
          <p>This is a simple test page to verify the routing works.</p>
        </div>
      </main>
      <Footer />
    </>
  );
}