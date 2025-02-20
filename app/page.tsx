import Hero from '@/src/components/Hero/Hero';
import Header from '../src/components/Header/Header';
import About from '@/src/components/about/about';
import InfoCards from '@/src/components/InfoCards/InfoCards';
import { blogPosts } from '@/src/data/blogPosts';
import { projectsData } from '@/src/data/projectsData';
import Contact from '@/src/components/Contact/Contact';
import Footer from '@/src/components/Footer/Footer';


// Todos
// 1. Fetch the projects data form Wordpress
// 2. Fetch the blog posts data form Wordpress
// 3. Fetch the tech stack data form Wordpress
// 4. Add the tech stack page#
// 5. Add the bookshelf page
// 6. Fix Mobile issues
// 9. Add the privacy policy page
// 9. Add the Imprint page
// 10. Add the about page
// 11. Run Build

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <InfoCards
        skin="projects"
        variant="dark"
        sectionNumber="01 "
        sectionTitle="Projects"
        columns={3}
        cards={projectsData}
      />
      <About />
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
        ]} />
      <InfoCards
        skin="blog"
        variant="light"
        sectionNumber="03"
        sectionTitle="NOTEBOOK"
        columns={3}
        cards={blogPosts}
      />
      <Contact />
      <Footer />
    </main>

  );
}