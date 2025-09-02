'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import InfoCards from '../InfoCards/InfoCards';
import '../../../app/loading.scss';

interface MoreProjectsProps {
  currentProjectSlug: string;
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

export default function MoreProjects({ currentProjectSlug }: MoreProjectsProps) {
  const [projects, setProjects] = useState<InfoCardProps[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchOtherProjects() {
      try {
        const response = await fetch(`/api/more-projects?exclude=${currentProjectSlug}`);
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || data.error || `HTTP error! Status: ${response.status}`);
        }

        const projectCards: InfoCardProps[] = data.projects.nodes.map((project: any) => ({
          title: project.title,
          description: truncateExcerpt(project.excerpt, 120),
          image: project.featuredImage?.node?.sourceUrl || '/images/Blog-sample-img.png',
          link: `/projects/${project.slug}`,
          variant: 'dark' as const,
          visitLink: project.caseStudy?.projectLinks?.liveSite || null,
          caseStudyLink: `/projects/${project.slug}`
        }));

        setProjects(projectCards);
      } catch (err) {
        console.error('Error fetching other projects:', err);
        setError(err instanceof Error ? err.message : 'Failed to load more projects');
      } finally {
        setLoading(false);
      }
    }

    if (currentProjectSlug) {
      fetchOtherProjects();
    } else {
      setError('No current project slug provided');
      setLoading(false);
    }
  }, [currentProjectSlug]);

  if (loading) {
    return (
      <div className="loading-page">
        <div className="loading-container">
          <div className="logo-spinner">
            <div className="logo-circle">
              <Image
                src="/edrishusein-logo.svg"
                alt="Edris Husein Logo"
                width={60}
                height={30}
                className="logo-image"
              />
            </div>
            <div className="pulse-rings">
              <div className="pulse-ring"></div>
              <div className="pulse-ring"></div>
              <div className="pulse-ring"></div>
            </div>
          </div>
          <p className="loading-text">Loading more projects...</p>
        </div>
      </div>
    );
  }

  if (error) {
    // Provide a static fallback with available projects
    const fallbackProjects: InfoCardProps[] = [
      {
        title: "Geschäftsbericht für Vorarlberger Landeskrankenhäuser",
        description: "Annual report design and development project for healthcare institutions.",
        image: "/images/Blog-sample-img.png",
        link: "/projects/geschaftsbericht-fur-vorarlberger-landeskrankenhauser",
        variant: 'dark' as 'dark' | 'light',
        visitLink: "#",
        caseStudyLink: "/projects/geschaftsbericht-fur-vorarlberger-landeskrankenhauser"
      }
    ].filter(project => !project.link?.includes(currentProjectSlug));

    if (fallbackProjects.length > 0) {
      return (
        <InfoCards
          cards={fallbackProjects}
          columns={3}
          sectionTitle="More Projects"
          skin="projects"
          variant="dark"
          className="more-projects-cards"
        />
      );
    }

    return (
      <div className="more-projects-error">
        <div className="container">
          <h2>More Projects</h2>
          <p>Unable to load more projects at this time.</p>
        </div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="more-projects-empty">
        <div className="container">
          <h2>More Projects</h2>
          <p>No other projects available at this time.</p>
        </div>
      </div>
    );
  }

  return (
    <InfoCards
      cards={projects}
      columns={3}
      sectionTitle="More Projects"
      skin="projects"
      variant="dark"
      className="more-projects-cards"
    />
  );
}