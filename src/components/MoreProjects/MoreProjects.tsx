'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import InfoCards from '../InfoCards/InfoCards';
// Removed loading.scss import to prevent full-page overlay issues

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
        console.log(`🔍 Fetching more projects, excluding: ${currentProjectSlug}`);
        const response = await fetch(`/api/more-projects?exclude=${currentProjectSlug}`);
        console.log(`📡 API response status: ${response.status}`);
        
        const data = await response.json();
        console.log('📊 API response data:', data);

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
      <div style={{ 
        padding: '2rem', 
        textAlign: 'center', 
        color: '#666',
        fontFamily: 'Inter, sans-serif'
      }}>
        <div style={{
          display: 'inline-block',
          width: '20px',
          height: '20px',
          border: '2px solid #f3f3f3',
          borderTop: '2px solid #B2A59B',
          borderRadius: '50%',
          animation: 'spin 1s linear infinite'
        }}></div>
        <p style={{ marginTop: '1rem' }}>Loading more projects...</p>
        <style jsx>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
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