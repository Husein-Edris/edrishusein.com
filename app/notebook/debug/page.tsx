// Debug page to test blog functionality
"use client";

import { useState, useEffect } from 'react';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';

export default function DebugPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/post?slug=hello-ya-nas-duplicate')
      .then(res => res.json())
      .then(data => {
        setData(data);
        setLoading(false);
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  return (
    <>
      <Header />
      <main style={{ padding: '2rem', minHeight: '60vh' }}>
        <h1>Debug Blog API</h1>
        {loading && <p>Loading...</p>}
        {data && (
          <pre style={{ background: '#f5f5f5', padding: '1rem', overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        )}
      </main>
      <Footer />
    </>
  );
}