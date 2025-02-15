import Hero from '@/src/components/Hero/Hero';
import Header from '../src/components/Header/Header';
import Projects from '@/src/components/Projects/Projects';
import About from '@/src/components/about/about';
import InfoCards from '@/src/components/InfoCards/InfoCards';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Projects />
      <About />
      <InfoCards
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

    </main>

  );
}