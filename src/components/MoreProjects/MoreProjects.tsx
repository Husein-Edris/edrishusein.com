import InfoCards from '../InfoCards/InfoCards';
import { truncateExcerpt } from '../InfoCards/truncateExcerpt';
import { selectRelatedByRotation } from '@/src/lib/related-content';
import type { WordPressProject } from '@/src/types/wordpress';
import type { ProjectCardLabels } from '@/src/lib/transform/transformSiteContent';

interface MoreProjectsProps {
  currentProjectSlug: string;
  allProjects?: WordPressProject[]; // Pass projects as props instead of fetching
  /** Section heading; CMS Site Content > Case study template. */
  title?: string;
  /** Card link labels; CMS Site Content > Project cards. */
  labels?: ProjectCardLabels;
}

interface InfoCardProps {
  title: string;
  description: string;
  image?: string;
  link?: string;
  variant?: 'dark' | 'light';
  visitLink?: string | null;
  caseStudyLink?: string;
}

export default function MoreProjects({
  currentProjectSlug,
  allProjects = [],
  title = 'More Projects',
  labels,
}: MoreProjectsProps) {
  // Rotate rather than always taking the first 3 in menu_order. The old slice
  // funnelled every sibling link into the same 3 projects, so the rest of the
  // case studies sat on a single inbound link from the archive page.
  const otherProjects = selectRelatedByRotation(allProjects, currentProjectSlug, 3);

  const projectCards: InfoCardProps[] = otherProjects.map((project) => ({
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
      sectionTitle={title}
      columns={3}
      cards={projectCards}
      labels={labels}
    />
  );
}