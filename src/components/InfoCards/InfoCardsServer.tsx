// Server component wrapper for InfoCards with data fetching
import { GraphQLClient } from 'graphql-request';
import InfoCards from './InfoCards';

// GraphQL client setup
const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

// GraphQL queries
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
        slug
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
        caseStudy {
          projectLinks {
            liveSite
            github
          }
        }
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

interface InfoCardsServerProps {
  columns: 1 | 2 | 3;
  sectionNumber?: string;
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

    const projectCards: InfoCardProps[] = (data as any).projects.nodes.map((project: { 
      title: string; 
      excerpt: string; 
      slug: string; 
      featuredImage?: { node?: { sourceUrl?: string } }; 
      caseStudy?: { projectLinks?: { liveSite?: string } } 
    }) => ({
      title: project.title,
      description: truncateExcerpt(project.excerpt, 120),
      image: project.featuredImage?.node?.sourceUrl,
      link: `/projects/${project.slug}`,
      variant: 'dark' as const,
      visitLink: project.caseStudy?.projectLinks?.liveSite || '#',
      caseStudyLink: `/projects/${project.slug}`
    }));

    return {
      cards: projectCards,
      sectionTitle: (data as any).page.homepageSections.projectsSection.title
    };
  } catch (error) {
    console.error('Error fetching projects:', error);
    return null;
  }
}

async function getPostsData() {
  try {
    const data = await client.request(GET_POSTS_DATA);

    const postCards: InfoCardProps[] = (data as any).posts.nodes.map((post: { 
      title: string; 
      excerpt: string; 
      uri: string; 
      featuredImage?: { node?: { sourceUrl?: string } } 
    }) => ({
      title: post.title,
      description: truncateExcerpt(post.excerpt, 120),
      image: post.featuredImage?.node?.sourceUrl,
      link: `/notebook/${post.uri}`,
      variant: 'light'
    }));

    return {
      cards: postCards,
      sectionTitle: (data as any).page.homepageSections.notebookSection.title
    };
  } catch (error) {
    console.error('Error fetching posts:', error);
    return null;
  }
}

// Server component wrapper
async function InfoCardsServer({
  columns,
  sectionNumber,
  skin = 'default',
  className = '',
  variant = 'dark'
}: InfoCardsServerProps) {
  let cards: InfoCardProps[] = [];
  let sectionTitle: string | undefined;

  // Fetch data based on skin type
  if (skin === 'projects') {
    const data = await getProjectsData();
    if (data) {
      cards = data.cards;
      sectionTitle = data.sectionTitle;
    }
  } else if (skin === 'blog') {
    const data = await getPostsData();
    if (data) {
      cards = data.cards;
      sectionTitle = data.sectionTitle;
    }
  }

  return (
    <InfoCards
      cards={cards}
      columns={columns}
      sectionNumber={sectionNumber}
      sectionTitle={sectionTitle}
      skin={skin}
      className={className}
      variant={variant}
    />
  );
}

export default InfoCardsServer;