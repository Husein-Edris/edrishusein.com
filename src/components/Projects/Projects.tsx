import Image from 'next/image';
import Link from 'next/link';
import './Projects.scss';
import SectionHeader from '../SectionHeader/SectionHeader';


const Projects = () => {
  const projects = [
    {
      id: 1,
      title: 'Beschützerbox',
      description: 'WordPress website for selling security internet for the companies and individuals',
      image: '/projects/beschuetzerbox.png',
      visitLink: 'https://example.com',
      caseStudyLink: '#',
      variant: 'dark',
    },
    {
      id: 2,
      title: 'Beschützerbox',
      description: 'WordPress website for selling security internet for the companies and individuals',
      image: '/projects/beschuetzerbox.png',
      visitLink: 'https://example.com',
      caseStudyLink: '#',
      variant: 'dark',
    },
    {
      id: 3,
      title: 'Beschützerbox',
      description: 'WordPress website for selling security internet for the companies and individuals',
      image: '/projects/beschuetzerbox.png',
      visitLink: 'https://example.com',
      caseStudyLink: '#',
      variant: 'light',
    },
  ];

  return (
    <section className="projects">
      <div className="container">
      <SectionHeader number="01" title="Projects" />

        
        <div className="projects-grid">
          {projects.map((project) => (
            <div key={project.id} className={`project-card ${project.variant}`}>
              <div className="project-image">
                <Image
                  src={project.image}
                  alt={project.title}
                  width={1200}
                  height={1200}
                  priority={project.id === 1}
                />
              </div>
              <div className="project-content">
                <h3 className="project-title">{project.title}</h3>
                <p className="project-description">{project.description}</p>
                <div className="project-links">
                  <Link href={project.visitLink} className="project-link">
                    VISIT SITE
                  </Link>
                  <Link href={project.caseStudyLink} className="project-link">
                    CASE STUDY
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="view-more">
          <Link href="/projects" className="view-more-link">
            VIEW MORE
          </Link>
        </div>
      </div>
    </section>
  );
};

export default Projects;