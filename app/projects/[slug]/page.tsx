// Server Component for project pages with client-side data fetching
import dynamic from 'next/dynamic';

// Required for static export - return empty array to skip pre-generation
export async function generateStaticParams() {
  return [];
}

// Dynamic import of client component to avoid SSR issues
const ProjectPageClient = dynamic(() => import('./ProjectPageClient'), { 
  ssr: false 
});

export default function ProjectPage() {
  return <ProjectPageClient />;
}