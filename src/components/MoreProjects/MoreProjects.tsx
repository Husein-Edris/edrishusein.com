import InfoCards from '../InfoCards/InfoCards';

interface MoreProjectsProps {
  currentProjectSlug: string;
  allProjects?: any[]; // Pass projects as props instead of fetching
}

interface InfoCardProps {
  title: string;
  description: string;
  image?: string;
  link?: string;
  variant?: 'dark' | 'light';
  visitLink?: string;
  caseStudyLink?: string;
}

// Helper function to truncate text and strip HTML
function truncateExcerpt(html: string, maxLength = 120): string {
  if (!html) return '';

  // Strip HTML tags
  const text = html.replace(/<\/?[^>]+(>|$)/g, "");

  if (text.length <= maxLength) return html;

  // Find the last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const truncatedText = truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength);

  return truncatedText + '...';
}

export default function MoreProjects({ currentProjectSlug, allProjects = [] }: MoreProjectsProps) {
  // Filter out current project and limit to 3
  const otherProjects = allProjects
    .filter(project => project.slug !== currentProjectSlug)
    .slice(0, 3);

  const projectCards: InfoCardProps[] = otherProjects.map((project: any) => ({
    title: project.title,
    description: truncateExcerpt(project.excerpt, 120),
    image: project.featuredImage?.node?.sourceUrl || '/images/Blog-sample-img.png',
    link: `/projects/${project.slug}`,
    variant: 'dark' as const,
    visitLink: project.caseStudy?.projectLinks?.liveSite || null,
    caseStudyLink: `/projects/${project.slug}`
  }));

  // If no projects available, don't render anything
  if (projectCards.length === 0) {
    return null;
  }

  return (
    <InfoCards
      skin="projects"
      variant="dark"
      sectionTitle="More Projects"
      columns={3}
      cards={projectCards}
    />
  );
}