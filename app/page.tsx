import { GraphQLClient } from 'graphql-request';
import Hero from '@/src/components/Hero/Hero';
import Header from '@/src/components/Header/Header';
import About from '@/src/components/about/about';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import Contact from '@/src/components/Contact/Contact';
import Footer from '@/src/components/Footer/Footer';

// GraphQL client setup
const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '', {
  headers: {
    'Content-Type': 'application/json',
  },
});

// Query for hero and homepage sections
const GET_HOMEPAGE_DATA = `
  query GetHomepage {
    page(id: "home", idType: URI) {
      homepageSections {
        heroSection {
          title
          heroCopy
          heroImage {
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
        aboutSection {
          title
          aboutMeText
        }
        contactSection {
          subTitle
          title
          email
        }
      }
    }
  }
`;

async function getHomepageData() {
  try {
    const data = await client.request(GET_HOMEPAGE_DATA);
    return data.page.homepageSections;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return null;
  }
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const homepageData = await getHomepageData();

  return (
    <main>
      <Header />
      <Hero data={homepageData?.heroSection} />
      
      {/* Projects section - fetches its own data */}
      <InfoCards
        skin="projects"
        variant="dark"
        sectionNumber="01"
        columns={3}
      />

      <About data={homepageData?.aboutSection} />
      
      {/* Bookshelf and Tech Stack */}
      <InfoCards
        skin="default"
        variant="dark"
        columns={2}
        cards={[
          {
            title: "BOOKSHELF",
            description: "Books and pieces of wisdom I've enjoyed reading",
            image: "/images/books-bg.png",
            link: "/bookshelf"
          },
          {
            title: "TECH STACK",
            description: "The dev tools, apps, devices, and games I use and play with",
            image: "/images/tech-bg.png",
            link: "/tech-stack"
          }
        ]}
      />
      
      {/* Blog/Notebook section - fetches its own data */}
      <InfoCards
        skin="blog"
        variant="light"
        sectionNumber="03"
        columns={3}
      />

      <Contact data={homepageData?.contactSection} />
      <Footer />
    </main>
  );
}