// app/page.tsx
import Hero from '@/src/components/Hero/Hero';
import Header from '@/src/components/Header/Header';
import About from '@/src/components/about/about';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import Contact from '@/src/components/Contact/Contact';
import Footer from '@/src/components/Footer/Footer';
import { client } from '@/src/lib/client';
import { GET_HOMEPAGE_DATA, GET_PROJECTS_FOR_GRID } from '@/src/lib/queries';

async function getHomepageData() {
  try {
    const data = await client.request(GET_HOMEPAGE_DATA);
    return data.page.homepageSections;
  } catch (error) {
    console.error('Error fetching homepage data:', error);
    return null;
  }
}

async function getProjectsData() {
  try {
    const data = await client.request(GET_PROJECTS_FOR_GRID);
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return null;
  }
}

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const [homepageData, projectsData] = await Promise.all([
    getHomepageData(),
    getProjectsData()
  ]);

  const transformedProjects = projectsData?.projects.nodes.map(project => ({
    title: project.title,
    description: project.excerpt,
    image: project.featuredImage?.node?.sourceUrl,
    variant: 'dark',
    visitLink: project.caseStudy?.projectLinks?.liveSite || '#',
    caseStudyLink: `/projects/${project.slug}`
  })) || [];

  return (
    <main>
      <Header />
      <Hero data={homepageData?.heroSection} />

      <InfoCards
        skin="projects"
        variant="dark"
        sectionNumber="01"
        sectionTitle="Projects"
        columns={3}
        cards={transformedProjects}
      />

      <About data={homepageData?.aboutSection} />

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

      <InfoCards
        skin="blog"
        variant="light"
        sectionNumber="03"
        sectionTitle="NOTEBOOK"
        columns={3}
      />

      <Contact data={homepageData?.contactSection} />
      <Footer />
    </main>
  );
}