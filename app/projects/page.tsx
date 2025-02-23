// app/projects/page.tsx
import { client } from '@/src/lib/client';
import { GET_ALL_PROJECTS } from '@/src/lib/queries';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import InfoCards from '@/src/components/InfoCards/InfoCards';

async function getAllProjects() {
  try {
    const data = await client.request(GET_ALL_PROJECTS);
    return data;
  } catch (error) {
    console.error('Error fetching projects:', error);
    return null;
  }
}

export default async function ProjectsPage() {
  const projectsData = await getAllProjects();

  const transformedProjects = projectsData?.projects.nodes.map(project => ({
    title: project.title,
    description: project.excerpt,
    image: project.featuredImage?.node?.sourceUrl,
    variant: 'dark',
    visitLink: project.caseStudy?.projectLinks?.liveSite || '#',
    caseStudyLink: `/projects/${project.slug}`
  })) || [];

  return (
    <>
      <Header />
      <main>
        <InfoCards
          skin="projects"
          variant="dark"
          sectionNumber="02"
          sectionTitle="All Projects"
          columns={3}
          cards={transformedProjects}
        />
      </main>
      <Footer />
    </>
  );
}