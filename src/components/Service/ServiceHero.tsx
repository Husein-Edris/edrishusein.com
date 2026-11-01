import type { ReactNode } from 'react';
import Image from 'next/image';
import HeroScene from '@/src/components/HeroScene/HeroScene';
import { PORTRAIT_FALLBACK } from '@/src/lib/portrait';

interface ServiceHeroProps {
  headline: string;
  introHtml: string;
  /** The contact buttons (ServiceContact). */
  contact: ReactNode;
  /** Short line under the buttons; '' hides it. */
  note: string;
  portraitCaption: string;
}

// First viewport: the offer and its one action on the left, the person who
// does the work on the right, the site's dot terrain underneath both.
export default function ServiceHero({ headline, introHtml, contact, note, portraitCaption }: ServiceHeroProps) {
  return (
    <section className="service-hero">
      <HeroScene />
      <div className="service-wrap service-hero__grid">
        <div className="service-hero__copy">
          <h1 className="service-hero__title">{headline}</h1>
          {introHtml && <div className="service-hero__intro" dangerouslySetInnerHTML={{ __html: introHtml }} />}
          <div className="service-hero__actions">
            {contact}
            {note && <p className="service-hero__note">{note}</p>}
          </div>
        </div>
        <figure className="service-hero__portrait">
          <span className="service-hero__photo">
            <Image
              src={PORTRAIT_FALLBACK.src}
              alt={PORTRAIT_FALLBACK.alt}
              width={PORTRAIT_FALLBACK.width}
              height={PORTRAIT_FALLBACK.height}
              sizes="(max-width: 768px) 160px, 360px"
              preload
              fetchPriority="high"
            />
          </span>
          {portraitCaption && <figcaption>{portraitCaption}</figcaption>}
        </figure>
      </div>
    </section>
  );
}
