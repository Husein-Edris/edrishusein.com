import './about.scss';
import SectionHeader from '../SectionHeader/SectionHeader';
import Link from 'next/link';
import { cmsText } from '@/src/lib/cms-text';

interface AboutProps {
  data?: {
    title?: string;
    aboutMeText?: string;
    learnMoreLabel?: string;
    learnMoreUrl?: string;
  }
}

const About = ({ data }: AboutProps) => {
  // Use data from props if available, otherwise use fallbacks
  const title = data?.title || "About Me";
  
  
  return (
    <section className="about">
      <div className="container">
        <SectionHeader title={title} variant="light" hideNumber={true} />
        {data?.aboutMeText ? (
          <div
            className="description"
            dangerouslySetInnerHTML={{ __html: data.aboutMeText }}
          />
        ) : (
          <div
            className="description"
          >
            <p>I&apos;m Edris, a WordPress Developer based in Dornbirn, Austria. I specialize in WordPress development, PHP, and modern web technologies, always looking for ways to build better, faster, and more efficient web solutions.</p>

            <h3>What I do</h3>
            <p>Currently, I&apos;m working on freelance projects, helping businesses and individuals create functional and scalable websites. My focus is on custom WordPress solutions, headless CMS setups, and performance optimization.</p>

            <h3>What I did</h3>
            <p>Previously, I worked as a web developer at an Austrian agency, where I contributed to projects for clients such as:</p>

            <ul className='project-list'>
              <li><a href="https://www.fehr-technik.com/" target="_blank">Fehr Lagerlogistik</a></li>
              <li><a href="https://geschaeftsbericht2022.landeskrankenhaus.at/" target="_blank">Vorarlberger Landeskrankenhäuser</a></li>
              <li><a href="https://technikland.at/" target="_blank">Technikland Vorarlberg</a></li>
            </ul>

            <p>Before that, I worked with <a href="https://bobdo.at/" target="_blank">bobdo</a>, focusing on Elementor, CSS, and PHP customizations.</p>

            <p>I&apos;m currently expanding my expertise in React, Next.js, and headless WordPress to push the boundaries of modern web development.</p>
          </div>
        )}
        
        <div className="about-cta">
          <Link href={cmsText(data?.learnMoreUrl, '/about')} className="learn-more-btn">
            {cmsText(data?.learnMoreLabel, 'Learn more about me')}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;