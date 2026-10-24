import './about.scss';
import SectionHeader from '../SectionHeader/SectionHeader';
import Link from 'next/link';
import { cmsText } from '@/src/lib/cms-text';
import { localePath } from '@/src/lib/i18n/paths';
import { DEFAULT_LANG, type Lang } from '@/src/lib/i18n/lang';

interface AboutProps {
  data?: {
    title?: string;
    aboutMeText?: string;
    learnMoreLabel?: string;
    learnMoreUrl?: string;
  }
  lang?: Lang;
}

const ABOUT_DEFAULTS = {
  en: { title: 'About Me', learnMoreLabel: 'Learn more about me' },
  de: { title: 'Über mich', learnMoreLabel: 'Mehr über mich' },
} as const;

// Shown only while Home > About Me > About Me Text is empty.
function FallbackTextDe() {
  return (
    <div className="description">
      <p>Ich bin Edris, WordPress-Entwickler in Dornbirn, Österreich. Mein Schwerpunkt liegt auf WordPress-Entwicklung, PHP und modernen Webtechnologien, und ich suche immer nach Wegen, bessere, schnellere und effizientere Weblösungen zu bauen.</p>

      <h3>Was ich mache</h3>
      <p>Derzeit arbeite ich an Freelance-Projekten und helfe Unternehmen und Einzelpersonen, funktionale und skalierbare Websites aufzubauen. Mein Fokus liegt auf individuellen WordPress-Lösungen, Headless-CMS-Setups und Performance-Optimierung.</p>

      <h3>Was ich gemacht habe</h3>
      <p>Zuvor war ich als Webentwickler bei einer österreichischen Agentur tätig und habe an Projekten für Kunden wie diese mitgearbeitet:</p>

      <ul className='project-list'>
        <li><a href="https://www.fehr-technik.com/" target="_blank">Fehr Lagerlogistik</a></li>
        <li><a href="https://geschaeftsbericht2022.landeskrankenhaus.at/" target="_blank">Vorarlberger Landeskrankenhäuser</a></li>
        <li><a href="https://technikland.at/" target="_blank">Technikland Vorarlberg</a></li>
      </ul>

      <p>Davor habe ich bei <a href="https://bobdo.at/" target="_blank">bobdo</a> gearbeitet, mit Schwerpunkt auf Elementor, CSS und PHP-Anpassungen.</p>

      <p>Aktuell vertiefe ich mein Wissen in React, Next.js und Headless WordPress, um die Möglichkeiten moderner Webentwicklung weiter auszuschöpfen.</p>
    </div>
  );
}

const About = ({ data, lang = DEFAULT_LANG }: AboutProps) => {
  const defaults = ABOUT_DEFAULTS[lang];
  // Use data from props if available, otherwise use fallbacks
  const title = data?.title || defaults.title;
  
  
  return (
    <section className="about">
      <div className="container">
        <SectionHeader title={title} variant="light" hideNumber={true} />
        {data?.aboutMeText ? (
          <div
            className="description"
            dangerouslySetInnerHTML={{ __html: data.aboutMeText }}
          />
        ) : lang === 'de' ? (
          <FallbackTextDe />
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
          <Link href={localePath(cmsText(data?.learnMoreUrl, '/about'), lang)} className="learn-more-btn">
            {cmsText(data?.learnMoreLabel, defaults.learnMoreLabel)}
          </Link>
        </div>
      </div>
    </section>
  );
};

export default About;