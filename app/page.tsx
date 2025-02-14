import Hero from '@/src/components/Hero/Hero';
import Header from '../src/components/Header/Header';
import Projects from '@/src/components/Projects/Projects';
import About from '@/src/components/about/about';

export default function Home() {
  return (
    <main>
      <Header />
      <Hero />
      <Projects />
      <About />
    </main>

  );
}