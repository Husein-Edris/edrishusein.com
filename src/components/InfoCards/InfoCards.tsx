import { GraphQLClient } from 'graphql-request';
import Image from 'next/image';
import Link from 'next/link';
import './InfoCards.scss';
import SectionHeader from '../SectionHeader/SectionHeader';

// GraphQL client setup
const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

// GraphQL queries for different content types
const GET_PROJECTS_DATA = `
  query GetProjectsData {
    page(id: "home", idType: URI) {
      homepageSections {
        projectsSection {
          title
        }
      }
    }
    projects(first: 3) {
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
        uri
      }
    }
  }
`;

const GET_POSTS_DATA = `
  query GetPostsData {
    page(id: "home", idType: URI) {
      homepageSections {
        notebookSection {
          title
        }
      }
    }
    posts(first: 3) {
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
        uri
      }
    }
  }
`;

// Types
interface InfoCardProps {
  title: string;
  description: string;
  image?: string;
  link?: string;
  variant?: 'dark' | 'light';
  visitLink?: string;
  caseStudyLink?: string;
}

interface InfoCardsProps {
  cards?: InfoCardProps[];
  columns: 1 | 2 | 3;
  sectionNumber?: string;
  sectionTitle?: string;
  skin?: 'projects' | 'blog' | 'default';
  className?: string;
  variant?: 'dark' | 'light';
}

// Data fetching functions
async function getProjectsData() {
  try {
    const data = await client.request(GET_PROJECTS_DATA);

    const projectCards: InfoCardProps[] = data.projects.nodes.map((project: any) => ({
      title: project.title,
      description: project.excerpt,
      image: project.featuredImage?.node?.sourceUrl,
      link: `/projects/${project.uri}`,
      variant: 'dark',
      visitLink: `/projects/${project.uri}`,
      caseStudyLink: `/projects/${project.uri}/case-study`
    }));

    return {
      cards: projectCards,
      sectionTitle: data.page.homepageSections.projectsSection.title
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return null;
  }
}

async function getPostsData() {
  try {
    const data = await client.request(GET_POSTS_DATA);

    const postCards: InfoCardProps[] = data.posts.nodes.map((post: any) => ({
      title: post.title,
      description: post.excerpt,
      image: post.featuredImage?.node?.sourceUrl,
      link: `/notebook/${post.uri}`,
      variant: 'light'
    }));

    return {
      cards: postCards,
      sectionTitle: data.page.homepageSections.notebookSection.title
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return null;
  }
}

// Modified InfoCards component
async function InfoCards({
  cards,
  columns,
  sectionNumber,
  sectionTitle,
  skin = 'default',
  className = '',
  variant = 'dark'
}: InfoCardsProps) {
  // Fetch data based on skin type if no cards provided
  let displayCards = cards;
  let displayTitle = sectionTitle;

  if (!cards) {
    let data = null;

    switch (skin) {
      case 'projects':
        data = await getProjectsData();
        break;
      case 'blog':
        data = await getPostsData();
        break;
      // Add cases for bookshelf and tech stack when they're set up in GraphQL
    }

    if (data) {
      displayCards = data.cards;
      displayTitle = data.sectionTitle;
    }
  }

  const sectionClass = `info-cards ${skin} ${skin}-${variant} ${className}`;

  return (
    <section className={sectionClass}>
      <div className="container">
        {(sectionNumber || displayTitle) && (
          <SectionHeader
            number={sectionNumber}
            title={displayTitle}
            variant={variant}
          />
        )}
        <div className={`cards-grid columns-${columns}`}>
          {displayCards?.map((card, index) => (
            <Link
              href={card.link || '#'}
              key={index}
              className={`card ${card.variant || variant}`}
            >
              <div className="card-content">
                {card.image && (
                  <div className="card-image">
                    <Image
                      src={card.image}
                      alt={card.title}
                      width={400}
                      height={300}
                      priority={index === 0}
                    />
                  </div>
                )}
                <div className="card-info">
                  <h3 className="card-title">{card.title}</h3>
                  {skin === 'default' && (
                    <div className="card-arrow">
                      <Image
                        src="/icons/arrow-disabled.svg"
                        alt="Arrow"
                        width={40}
                        height={40}
                        className="arrow-disabled"
                      />
                      <Image
                        src="/icons/arrow-active.svg"
                        alt="Arrow"
                        width={40}
                        height={40}
                        className="arrow-active"
                      />
                    </div>
                  )}
                  <div
                    className="card-description"
                    dangerouslySetInnerHTML={{ __html: card.description }}
                  />
                  {skin === 'projects' && card.visitLink && card.caseStudyLink && (
                    <div className="project-links">
                      <Link href={card.visitLink} className="project-link">
                        VISIT SITE
                      </Link>
                      <Link href={card.caseStudyLink} className="project-link">
                        CASE STUDY
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {skin === 'projects' && (
          <div className="view-more">
            <Link href="/projects" className="view-more-link">
              VIEW MORE
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default InfoCards;