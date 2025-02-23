import { GraphQLClient } from 'graphql-request';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import { GET_ALL_PROJECTS } from '@/src/lib/queries/projects';
import '@/src/styles/pages/Projects.scss';

const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

async function getProjectsData() {
  try {
    const data = await client.request(GET_ALL_PROJECTS);
    return data.projects.nodes;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return [];
  }
}

export default async function ProjectsPage() {
  const projects = await getProjectsData();

  return (
    <>
      <Header />
      <main className="projects-archive">
        <div className="hero-section">
          <h1 className="title">PROJECTS</h1>
          <p className="description">
            Selected projects I've worked on
          </p>
        </div>

        <div className="container">
          <div className="projects-grid">
            {projects.map((project: any, index: number) => (
              <div key={project.id} className={`project-card ${index % 2 === 0 ? 'dark' : 'light'}`}>
                {project.featuredImage?.node && (
                  <div className="card-image">
                    <Image
                      src={project.featuredImage.node.sourceUrl}
                      alt={project.featuredImage.node.altText || project.title}
                      width={400}
                      height={300}
                      className="project-image"
                      priority={index < 2}
                    />
                  </div>
                )}
                <div className="card-content">
                  <h3 className="card-title">{project.title}</h3>
                  <div 
                    className="card-description"
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
            ))}
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}