// app/projects/[slug]/page.tsx
import { Metadata } from 'next';
import { GraphQLClient } from 'graphql-request';
import Image from 'next/image';
import Link from 'next/link';
import { GET_CASE_STUDY } from '@/src/lib/queries/projects';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/CaseStudy.scss';

const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

async function getCaseStudyData(slug: string) {
  try {
    console.log('GraphQL Endpoint:', process.env.NEXT_PUBLIC_WORDPRESS_API_URL);
    console.log('Fetching case study for slug:', slug);
    
    const data = await client.request(GET_CASE_STUDY, { slug });
    
    // Log the full raw data for inspection
    console.log('Raw GraphQL Response:', JSON.stringify(data, null, 2));
    
    if (!data.project) {
      console.error('No project found for slug:', slug);
      console.error('Possible reasons:');
      console.error('1. Slug might be incorrect');
      console.error('2. Project might not exist in the database');
      console.error('3. GraphQL query might not match the schema');
      return null;
    }
    return data.project;
  } catch (error) {
    console.error('Error fetching case study:', error);
    if (error instanceof Error) {
      console.error('Detailed Error:', {
        message: error.message,
        name: error.name,
        stack: error.stack
      });
    }
    return null;
  }
}
export default async function CaseStudyPage({ params }: { params: { slug: string } }) {
  // Log the received slug
  console.log('Received slug:', params.slug);

  const project = await getCaseStudyData(params.slug);
  
  if (!project) {
    return (
      <>
        <Header />
        <main className="case-study">
          <div className="container">
            <h1 className="title">Project Not Found</h1>
            <p>Sorry, we couldn't find the project you're looking for.</p>
            <Link href="/projects" className="link-button">
              Back to Projects
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  // Log the project data structure
  console.log('Project data structure:', {
    title: project.title,
    hasCaseStudy: !!project.caseStudy,
    hasTechnologies: !!project.caseStudy?.projectOverview?.technologies,
    hasContent: !!project.caseStudy?.projectContent,
    hasGallery: !!project.caseStudy?.projectGallery,
    hasLinks: !!project.caseStudy?.projectLinks
  });

  const { caseStudy } = project;

  // Early return if no case study data
  if (!caseStudy) {
    return (
      <>
        <Header />
        <main className="case-study">
          <div className="container">
            <h1 className="title">{project.title}</h1>
            <p>Case study information is not available for this project.</p>
            <Link href="/projects" className="link-button">
              Back to Projects
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Header />
      <main className="case-study">
        <div className="container">
          <h1 className="title">{project.title}</h1>

          {/* Tech Stack */}
          {caseStudy.projectOverview?.technologies?.length > 0 && (
            <section className="tech-stack">
              <h2>Technologies Used</h2>
              <div className="tech-grid">
                {caseStudy.projectOverview.technologies.map((tech: any) => (
                  <div key={tech.id} className="tech-item">
                    {tech.featuredImage?.node && (
                      <Image
                        src={tech.featuredImage.node.sourceUrl}
                        alt={tech.featuredImage.node.altText || tech.title}
                        width={40}
                        height={40}
                      />
                    )}
                    <span>{tech.title}</span>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Challenge & Solution */}
          {(caseStudy.projectContent?.challenge || caseStudy.projectContent?.solution) && (
            <section className="content">
              {caseStudy.projectContent.challenge && (
                <div className="challenge">
                  <h2>The Challenge</h2>
                  <div dangerouslySetInnerHTML={{ __html: caseStudy.projectContent.challenge }} />
                </div>
              )}
              
              {caseStudy.projectContent.solution && (
                <div className="solution">
                  <h2>The Solution</h2>
                  <div dangerouslySetInnerHTML={{ __html: caseStudy.projectContent.solution }} />
                </div>
              )}
            </section>
          )}

          {/* Key Features */}
          {caseStudy.projectContent?.keyFeatures?.length > 0 && (
            <section className="features">
              <h2>Key Features</h2>
              <div className="features-grid">
                {caseStudy.projectContent.keyFeatures.map((feature: any, index: number) => (
                  <div key={index} className="feature-card">
                    {feature.image && (
                      <Image
                        src={feature.image.sourceUrl}
                        alt={feature.image.altText || feature.title}
                        width={400}
                        height={300}
                      />
                    )}
                    <h3>{feature.title}</h3>
                    <p>{feature.description}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Project Gallery */}
          {caseStudy.projectGallery?.length > 0 && (
            <section className="gallery">
              <h2>Project Gallery</h2>
              <div className="gallery-grid">
                {caseStudy.projectGallery.map((image: any, index: number) => (
                  <Image
                    key={index}
                    src={image.sourceUrl}
                    alt={image.altText || `Gallery image ${index + 1}`}
                    width={600}
                    height={400}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Project Links */}
          <section className="links">
            {caseStudy.projectLinks?.liveSite && (
              <Link 
                href={caseStudy.projectLinks.liveSite}
                className="link-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                Visit Live Site
              </Link>
            )}
            {caseStudy.projectLinks?.github && (
              <Link 
                href={caseStudy.projectLinks.github}
                className="link-button"
                target="_blank"
                rel="noopener noreferrer"
              >
                View Source Code
              </Link>
            )}
          </section>
        </div>
      </main>
      <Footer />
    </>
  );
}