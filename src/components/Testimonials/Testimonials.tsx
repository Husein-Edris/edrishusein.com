'use client';

import { useId, useState, useSyncExternalStore } from 'react';
import Image from 'next/image';
import './Testimonials.scss';
import {
  DEFAULT_TESTIMONIALS_SECTION,
  type Testimonial,
  type TestimonialsSection,
} from '@/src/lib/transform/transformTestimonials';
import { useLang } from '@/src/components/LangProvider/LangProvider';
import { DICTIONARY, dictionary, type Dictionary } from '@/src/lib/i18n/dictionary';
import { fillLabel } from '@/src/lib/transform/transformSiteContent';

interface TestimonialsProps {
  /** From DataFetcher.getHomepageData() as `testimonialsSection`; absent = code defaults. */
  data?: TestimonialsSection;
}

const LOGO_HEIGHT = 28;
const noopSubscribe = () => () => {};

// False in the server HTML and during hydration, true once JS runs: the
// controls stay hidden for visitors without JS.
function useHasJs(): boolean {
  return useSyncExternalStore(noopSubscribe, () => true, () => false);
}
const LOGO_MAX_WIDTH = 144;

/** "https://www.starsmedia.com/" -> "starsmedia.com", for the link's accessible name. */
export function hostOf(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./i, '');
  } catch {
    return '';
  }
}

/** "Leon Heuser, Managing Director, ReviewForest, opens reviewforest.org in a new tab" */
export function attributionLabel(item: Testimonial, text: Dictionary = DICTIONARY.en): string {
  const host = hostOf(item.websiteUrl);
  return [item.name, item.context, host ? fillLabel(text.opensHostInNewTab, { host }) : text.opensInNewTab]
    .filter(Boolean)
    .join(', ');
}

// The company name sits next to the logo, so the logo itself is decorative.
function Logo({ logo }: { logo: NonNullable<Testimonial['logo']> }) {
  const ratio = logo.width > 0 && logo.height > 0 ? logo.width / logo.height : 3;
  const width = Math.min(LOGO_MAX_WIDTH, Math.round(LOGO_HEIGHT * ratio));
  return (
    <Image
      className="testimonial__logo"
      src={logo.url}
      alt=""
      width={width}
      height={Math.round(width / ratio)}
      sizes={`${width}px`}
      unoptimized={/\.svg(\?|#|$)/i.test(logo.url)}
    />
  );
}

// Logo, then two rows: name, then role and company. Links to the client site when set.
function Attribution({ item, text }: { item: Testimonial; text: Dictionary }) {
  const body = (
    <>
      {item.logo && <Logo logo={item.logo} />}
      {(item.name || item.context) && (
        <span className="testimonial__who">
          {item.name && <span className="testimonial__name">{item.name}</span>}
          {item.context && <span className="testimonial__company">{item.context}</span>}
        </span>
      )}
    </>
  );

  return (
    <figcaption className="testimonial__by">
      {item.websiteUrl ? (
        <a
          className="testimonial__link"
          href={item.websiteUrl}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={attributionLabel(item, text)}
        >
          {body}
        </a>
      ) : (
        <span className="testimonial__line">{body}</span>
      )}
    </figcaption>
  );
}

// Editorial rotation (design S2): label and counter on the left, one quote on
// the right. Without JS the first quote shows and the controls stay hidden.
// No autoplay. The Home page picks and orders the items (ACF relationship).
const Testimonials = ({ data }: TestimonialsProps) => {
  const { title, prevLabel, nextLabel, items: shown } = data ?? DEFAULT_TESTIMONIALS_SECTION;
  const lang = useLang();
  const text = dictionary(lang).testimonials;
  const attributionText = dictionary(lang);
  const [active, setActive] = useState(0);
  const ready = useHasJs();
  const [moved, setMoved] = useState(false);
  const headingId = useId();
  const quotesId = useId();

  if (shown.length === 0) return null;

  const total = shown.length;
  const go = (step: number) => {
    setMoved(true);
    setActive((current) => (current + step + total) % total);
  };
  const hasControls = total > 1;

  return (
    <div className={`testimonials${moved ? ' testimonials--moved' : ''}`}>
      <div className="testimonials__container">
        <div className="testimonials__side">
          <h2 className="testimonials__label" id={headingId}>
            {title}
          </h2>

          {hasControls && (
            <div
              className="testimonials__nav"
              role="group"
              aria-labelledby={headingId}
              hidden={!ready}
            >
              <button
                type="button"
                className="testimonials__arrow"
                aria-controls={quotesId}
                onClick={() => go(-1)}
              >
                <span aria-hidden="true">&larr;</span> {prevLabel}
                <span className="sr-only"> {text.quote}</span>
              </button>
              <p className="testimonials__count">
                <span className="sr-only">{text.counterPrefix} </span>
                {active + 1}
                <span aria-hidden="true"> / </span>
                <span className="sr-only"> {text.counterOf} </span>
                {total}
              </p>
              <button
                type="button"
                className="testimonials__arrow"
                aria-controls={quotesId}
                onClick={() => go(1)}
              >
                {nextLabel}
                <span className="sr-only"> {text.quote}</span> <span aria-hidden="true">&rarr;</span>
              </button>
            </div>
          )}
        </div>

        <div className="testimonials__main" id={quotesId} aria-live="polite">
          {shown.map((item, index) => (
            <figure
              className={`testimonial${index === active ? '' : ' testimonial--off'}`}
              key={`${item.name}-${index}`}
            >
              <blockquote className="testimonial__quote" lang={item.lang}>
                <p>{item.quote}</p>
              </blockquote>
              {(item.name || item.context || item.logo) && <Attribution item={item} text={attributionText} />}
            </figure>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Testimonials;
