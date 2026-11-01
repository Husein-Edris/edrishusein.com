import Image from 'next/image';
import type { Testimonial } from '@/src/lib/transform/transformTestimonials';

interface ServiceTestimonialProps {
  testimonial: Testimonial | null;
}

// One client in their own words (and language), set large. No rating, no date.
export default function ServiceTestimonial({ testimonial }: ServiceTestimonialProps) {
  if (!testimonial) return null;
  const { quote, name, context, logo, websiteUrl, lang } = testimonial;

  const who = (
    <>
      {logo && (
        <Image src={logo.url} alt="" width={logo.width} height={logo.height} className="service-quote__logo" />
      )}
      <span className="service-quote__who">
        {name && <span className="service-quote__name">{name}</span>}
        {context && <span className="service-quote__context">{context}</span>}
      </span>
    </>
  );

  return (
    <section className="service-block service-quote-block">
      <div className="service-wrap">
        <figure className="service-quote" lang={lang}>
          <svg className="service-quote__mark" viewBox="0 0 48 36" aria-hidden="true" focusable="false">
            <path d="M0 36V22C0 9 7 1.5 19 0l2 5.5C13.5 7.5 10 12 10 18h9v18H0Zm27 0V22C27 9 34 1.5 46 0l2 5.5C40.5 7.5 37 12 37 18h9v18H27Z" />
          </svg>
          <blockquote className="service-quote__text">
            <p>{quote}</p>
          </blockquote>
          <figcaption className="service-quote__by">
            {websiteUrl ? (
              <a href={websiteUrl} className="service-quote__link" target="_blank" rel="noopener noreferrer">
                {who}
              </a>
            ) : (
              who
            )}
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
