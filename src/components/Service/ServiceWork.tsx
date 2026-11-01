import type { CSSProperties } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { hasScreenshot, type ServiceLink } from '@/src/lib/services';

interface ServiceWorkProps {
  heading: string;
  projects: ServiceLink[];
}

// Frames on screen at most; further case studies follow as a line of links.
const FRAME_COUNT = 3;

// Real sites in the same browser-window frame as the homepage hero. Each frame
// opens from the top down as it scrolls in.
export default function ServiceWork({ heading, projects }: ServiceWorkProps) {
  if (projects.length === 0) return null;
  const framed = projects.filter(hasScreenshot).slice(0, FRAME_COUNT);
  const rest = projects.filter((project) => !framed.includes(project));

  return (
    <section className="service-block service-work" aria-labelledby="service-work-heading">
      <div className="service-wrap">
        <h2 id="service-work-heading" className="service-heading">
          {heading}
        </h2>
        {framed.length > 0 && (
          <ul className={`service-work__frames service-work__frames--${framed.length}`}>
            {framed.map((project, index) => (
              <li key={project.id} className="service-frame" data-reveal="mask" style={{ '--i': index } as CSSProperties}>
                <Link href={project.path} className="service-frame__link">
                  <span className="service-frame__window">
                    <span className="service-frame__bar" aria-hidden="true">
                      <i />
                      <i />
                      <i />
                      {project.domain && <span className="service-frame__domain">{project.domain}</span>}
                    </span>
                    <span className="service-frame__media">
                      {project.image && (
                        <Image
                          src={project.image.url}
                          alt={project.image.alt}
                          fill
                          sizes={index === 0 ? '(max-width: 768px) 100vw, 700px' : '(max-width: 768px) 100vw, 480px'}
                          className="service-frame__image"
                        />
                      )}
                    </span>
                  </span>
                  <span className="service-frame__caption">
                    <span className="service-frame__title">{project.title}</span>
                    {project.excerpt && <span className="service-frame__excerpt">{project.excerpt}</span>}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        )}
        {rest.length > 0 && (
          <ul className="service-work__more">
            {rest.map((project) => (
              <li key={project.id}>
                <Link href={project.path}>{project.title}</Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}
