'use client';

import './about.scss';
import SectionHeader from '../SectionHeader/SectionHeader';
import Link from 'next/link';
import { useScrollAnimation } from '../../hooks/useScrollAnimation';

interface AboutProps {
  data?: {
    title?: string;
    aboutMeText?: string;
  }
}

const About = ({ data }: AboutProps) => {
  // Use data from props if available, otherwise use fallbacks
  const title = data?.title || "About Me";
  
  // Animation hooks
  const headerAnimation = useScrollAnimation({ threshold: 0.2 });
  const descriptionAnimation = useScrollAnimation({ threshold: 0.1, delay: 300 });
  const ctaAnimation = useScrollAnimation({ threshold: 0.2, delay: 600 });
  
  return (
    <section className="about">
      <div className="container">
        <div 
          ref={headerAnimation.ref}
          className={`about-header-animated ${headerAnimation.className}`}
        >
          <SectionHeader title={title} variant="light" hideNumber={true} />
        </div>
        {data?.aboutMeText ? (
          <div 
            ref={descriptionAnimation.ref}
            className={`description animated-description ${descriptionAnimation.className}`}
            dangerouslySetInnerHTML={{ __html: data.aboutMeText }}
          />
        ) : (
          <div 
            ref={descriptionAnimation.ref}
            className={`description animated-description ${descriptionAnimation.className}`}
          >
            <p>I'm Edris, a WordPress Developer based in Dornbirn, Austria. I specialize in WordPress development, PHP, and modern web technologies, always looking for ways to build better, faster, and more efficient web solutions.</p>

            <h3>What I do</h3>
            <p>Currently, I'm working on freelance projects, helping businesses and individuals create functional and scalable websites. My focus is on custom WordPress solutions, headless CMS setups, and performance optimization.</p>

            <h3>What I did</h3>
            <p>Previously, I worked as a Junior Web Developer at <a href="https://www.bap.cc/" target="_blank">Baschnegger Ammann Partner Werbeagentur</a>, where I contributed to projects for clients such as:</p>

            <ul className='project-list'>
              <li><a href="https://www.fehr-technik.com/" target="_blank">Fehr Lagerlogistik</a></li>
              <li><a href="https://geschaeftsbericht2022.landeskrankenhaus.at/" target="_blank">Vorarlberger Landeskrankenhäuser</a></li>
              <li><a href="https://technikland.at/" target="_blank">Technikland Vorarlberg</a></li>
            </ul>

            <p>Before that, I worked with <a href="https://bobdo.at/" target="_blank">bobdo</a>, focusing on Elementor, CSS, and PHP customizations.</p>

            <p>I'm currently expanding my expertise in React, Next.js, and headless WordPress to push the boundaries of modern web development.</p>
          </div>
        )}
        
        <div 
          ref={ctaAnimation.ref}
          className={`about-cta animated-cta ${ctaAnimation.className}`}
        >
          <Link href="/about" className="learn-more-btn">
            Learn more about me
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;