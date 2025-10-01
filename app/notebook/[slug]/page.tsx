// Server Component for blog post pages with client-side data fetching
import BlogPostPageClient from './BlogPostPageClient';

// Required for static export - return empty array to skip pre-generation
export async function generateStaticParams() {
  return [];
}

export default function BlogPostPage() {
  return <BlogPostPageClient />;
}