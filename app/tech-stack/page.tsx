import { GraphQLClient } from 'graphql-request';
import Image from 'next/image';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/TechStack.scss';

const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

const GET_TECH_STACK = `
  query GetTechStack {
    techs(first: 100) {
      nodes {
        id
        title
        excerpt
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              height
              width
            }
          }
        }
      }
    }
  }
`;

async function getTechStackData() {
  try {
    const data = await client.request(GET_TECH_STACK);
    return data.techs.nodes;
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    return [];
  }
}

export default async function TechStackPage() {
  const techItems = await getTechStackData();

  return (
    <>
      <Header />
      <main className="tech-stack-page">
        <div className="container">
          <div className="hero-section">
            <h1 className="title">TECH STACK</h1>
            <p className="description">
              The dev tools, apps, devices, and games I use and play with
            </p>
          </div>

          <div className="tech-grid">
            {techItems.map((tech: any) => (
              <div key={tech.id} className="tech-card">
                {tech.featuredImage?.node && (
                  <div className="image-wrapper">
                    <Image
                      src={tech.featuredImage.node.sourceUrl}
                      alt={tech.featuredImage.node.altText || tech.title}
                      fill
                      className="tech-image"
                    />
                  </div>
                )}
                <div className="content">
                  <h3 className="tech-title">{tech.title}</h3>
                  {tech.excerpt && (
                    <div
                      className="tech-description"
                      dangerouslySetInnerHTML={{ __html: tech.excerpt }}
                    />
                  )}
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