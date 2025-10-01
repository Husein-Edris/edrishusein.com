'use client';

import Image from 'next/image';
import Link from 'next/link';
import './Projects.scss';
import SectionHeader from '../SectionHeader/SectionHeader';
import { useScrollAnimation, useStaggeredAnimation } from '../../hooks/useScrollAnimation';

interface ProjectImage {
  node: {
    sourceUrl: string;
    altText: string;
    mediaDetails: {
      height: number;
      width: number;
    }
  }
}

interface Project {
  id: string;
  title: string;
  excerpt: string;
  featuredImage: ProjectImage;
  uri: string;
}

interface ProjectsProps {
  data?: {
    projects: Project[];
    sectionTitle?: string;
  }
}

const Projects = ({ data }: ProjectsProps) => {
  // Fallback data
  const fallbackProjects = [
    {
      id: '1',
      title: 'Beschützerbox',
      excerpt: 'WordPress website for selling security internet for the companies and individuals',
      featuredImage: {
        node: {
          sourceUrl: '/projects/beschuetzerbox.png',
          altText: 'Beschützerbox',
          mediaDetails: {
            width: 1200,
            height: 1200
          }
        }
      },
      uri: '/projects/beschutzerbox'
    }
  ];

  const projects = data?.projects || fallbackProjects;
  const sectionTitle = data?.sectionTitle || 'Projects';

  // Animation hooks
  const headerAnimation = useScrollAnimation({ threshold: 0.2 });
  const gridAnimation = useScrollAnimation({ threshold: 0.1, delay: 200 });

  return (
    <section className="projects">
      <div className="container">
        <div 
          ref={headerAnimation.ref} 
          className={`section-header-animated ${headerAnimation.className}`}
        >
          <SectionHeader title={sectionTitle} hideNumber={true} />
        </div>
        
        <div 
          ref={gridAnimation.ref}
          className={`projects-grid animated-grid ${gridAnimation.className}`}
        >
          {projects.map((project, index) => {
            const cardAnimation = useStaggeredAnimation(index, 150);
            
            return (
              <div 
                key={project.id} 
                ref={cardAnimation.ref}
                className={`project-card ${index % 2 === 0 ? 'dark' : 'light'} ${cardAnimation.className}`}
              >
                <div className="project-image">
                <Image
                  src={project.featuredImage.node.sourceUrl}
                  alt={project.featuredImage.node.altText || project.title}
                  width={project.featuredImage.node.mediaDetails.width}
                  height={project.featuredImage.node.mediaDetails.height}
                  priority={index === 0}
                />
              </div>
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <div 
                  className="project-description"
                  dangerouslySetInnerHTML={{ __html: project.excerpt }}
                />
                <div className="project-links">
                  <Link href={`/projects/${project.uri}`} className="project-link">
                    VISIT SITE
                  </Link>
                  <Link href={`/projects/${project.uri}/case-study`} className="project-link">
                    CASE STUDY
                  </Link>
                </div>
              </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default Projects;