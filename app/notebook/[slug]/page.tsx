// Server Component for blog post pages with client-side data fetching
import dynamic from 'next/dynamic';

// Required for static export - return empty array to skip pre-generation
export async function generateStaticParams() {
  return [];
}

// Dynamic import of client component to avoid SSR issues
const BlogPostPageClient = dynamic(() => import('./BlogPostPageClient'), { 
  ssr: false 
});

export default function BlogPostPage() {
  return <BlogPostPageClient />;
}