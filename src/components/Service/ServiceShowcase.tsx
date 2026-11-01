import Image from 'next/image';
import type { ServiceShowcase as Showcase } from '@/src/lib/transform/transformService';

interface ServiceShowcaseProps {
  showcase: Showcase | null;
}

// Stands in for "Recent work" on a service with no case-study screenshot (e.g.
// maintenance): one real artefact of the job in the same window frame.
export default function ServiceShowcase({ showcase }: ServiceShowcaseProps) {
  if (!showcase) return null;
  const { image, caption } = showcase;
  return (
    <section className="service-block service-showcase" aria-label={caption || image.alt}>
      <div className="service-wrap">
        <figure className="service-frame service-showcase__frame" data-reveal="mask">
          <span className="service-frame__window">
            <span className="service-frame__bar" aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            <span className="service-frame__media">
              <Image
                src={image.url}
                alt={image.alt}
                fill
                sizes="(max-width: 768px) 100vw, 1200px"
                className="service-frame__image service-showcase__image"
              />
            </span>
          </span>
          {caption && <figcaption className="service-frame__caption service-showcase__caption">{caption}</figcaption>}
        </figure>
      </div>
    </section>
  );
}
