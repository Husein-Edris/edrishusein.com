// Server Component for project pages with client-side data fetching
import ProjectPageClient from './ProjectPageClient';

// Required for static export - return empty array to skip pre-generation
export async function generateStaticParams() {
  return [];
}

export default function ProjectPage() {
  return <ProjectPageClient />;
}