// Modified InfoCards component with truncated text and improved styling
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

const GET_BOOKSHELF_DATA = `
  query GetBookshelfData {
    page(id: "home", idType: URI) {
      homepageSections {
        bookshelfSection {
          title
          description
          featuredImage {
            sourceUrl
            altText
          }
          button {
            url
            title
            target
          }
        }
      }
    }
  }
`;

const GET_TECHSTACK_DATA = `
  query GetTechStackData {
    page(id: "home", idType: URI) {
      homepageSections {
        techstackSection {
          title
          description
          featuredImage {
            sourceUrl
            altText
          }
          button {
            url
            title
            target
          }
        }
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
  skin?: 'projects' | 'blog' | 'default' | 'bookshelf' | 'techstack';
  className?: string;
  variant?: 'dark' | 'light';
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

// Data fetching functions
async function getProjectsData() {
  try {
    const data = await client.request(GET_PROJECTS_DATA);

    const projectCards: InfoCardProps[] = data.projects.nodes.map((project: any) => ({
      title: project.title,
      description: truncateExcerpt(project.excerpt, 120),
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
      description: truncateExcerpt(post.excerpt, 120),
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

async function getBookshelfData() {
  try {
    const data = await client.request(GET_BOOKSHELF_DATA);
    const section = data.page.homepageSections.bookshelfSection;

    if (!section) {
      console.error('Bookshelf section data not found');
      return null;
    }

    return {
      cards: [{
        title: section.title || "BOOKSHELF",
        description: section.description || "Books and pieces of wisdom I've enjoyed reading",
        image: section.featuredImage?.sourceUrl || "/images/books-bg.png",
        link: section.button?.url || "/bookshelf",
        variant: 'light'
      }],
      sectionTitle: section.title || "BOOKSHELF"
    };
  } catch (error) {
    console.error('Error fetching bookshelf data:', error);
    return null;
  }
}

async function getTechStackData() {
  try {
    const data = await client.request(GET_TECHSTACK_DATA);
    const section = data.page.homepageSections.techstackSection;

    if (!section) {
      console.error('Tech stack section data not found');
      return null;
    }

    return {
      cards: [{
        title: section.title || "TECH STACK",
        description: section.description || "The dev tools, apps, devices, and games I use and play with",
        image: section.featuredImage?.sourceUrl || "/images/tech-bg.png",
        link: section.button?.url || "/tech-stack",
        variant: 'light'
      }],
      sectionTitle: section.title || "TECH STACK"
    };
  } catch (error) {
    console.error('Error fetching tech stack data:', error);
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
      case 'bookshelf':
        data = await getBookshelfData();
        break;
      case 'techstack':
        data = await getTechStackData();
        break;
    }

    if (data) {
      displayCards = data.cards;
      displayTitle = data.sectionTitle;
    }
  } else {
    // If cards are provided by props, still apply the truncation
    displayCards = displayCards.map(card => ({
      ...card,
      description: truncateExcerpt(card.description, 120)
    }));
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

        {(skin === 'projects' || skin === 'blog') && (
          <div className="view-more">
            <Link
              href={skin === 'projects' ? '/projects' : '/notebook'}
              className="view-more-link"
            >
              VIEW MORE
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default InfoCards;