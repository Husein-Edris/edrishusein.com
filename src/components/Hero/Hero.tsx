// src/components/Hero/Hero.tsx
import Image from 'next/image';
import Link from 'next/link';
import { HeroSection } from '@/src/types/wordpress';
import type { HeroFrame } from '@/src/lib/hero-frames';
import HeroScene from '../HeroScene/HeroScene';
import ShowcaseVideo from './ShowcaseVideo';
import HeroCopyText from './HeroCopyText';
import { autoLinkHeroCopy, parseHeroCopy, type HeroCopyLink } from './heroCopy';
import { isInternalPath, resolveHeroContent } from './heroContent';
import './Hero.scss';

interface HeroProps {
  data?: HeroSection;
  frames?: HeroFrame[];
  /** Project names in the paragraph linked to their live sites while the CMS copy has no links. */
  copyLinks?: HeroCopyLink[];
}

const FALLBACK_COPY = 'I build and look after websites and web solutions for businesses and agencies.';

// Rendered widths of the strip columns (Hero.scss): 1 column under 640px,
// 2 columns (1fr 1.4fr) up to 1024px, 3 columns (1fr 1.4fr 1fr) in a 1200px row.
// Screenshots are about 2:1 and object-fit: cover crops them into a 16:10 box
// (16:9.4 for the lead), so the drawn image is wider than its column: x1.25 for
// side frames, x1.18 for the lead. The sizes below include that factor so the
// picked file is never below 1x of the drawn width.
const LEAD_SIZES = '(max-width: 640px) calc(118vw - 38px), (max-width: 1024px) 66vw, 572px';
const SIDE_SIZES = '(max-width: 1024px) 50vw, 430px';

function HeroCta({ label, url, className }: { label: string; url: string; className: string }) {
  if (isInternalPath(url)) {
    return (
      <Link href={url} className={className}>
        {label}
      </Link>
    );
  }
  return (
    <a href={url} className={className}>
      {label}
    </a>
  );
}

function HeroFrameCard({ frame }: { frame: HeroFrame }) {
  const { image, video, isLead } = frame;
  return (
    <li className={`hero-frame${isLead ? ' hero-frame--lead' : ''}`}>
      <Link href={frame.href} className="hero-frame__link">
        <span className="hero-frame__window">
          <span className="hero-frame__bar" aria-hidden="true">
            <i />
            <i />
            <i />
            {frame.domain && <span className="hero-frame__domain">{frame.domain}</span>}
          </span>
          <span className="hero-frame__media">
            {image?.sourceUrl && (
              <Image
                src={image.sourceUrl}
                alt=""
                fill
                className="hero-frame__image"
                sizes={isLead ? LEAD_SIZES : SIDE_SIZES}
                quality={85}
                {...(isLead ? { preload: true, fetchPriority: 'high' as const } : { loading: 'lazy' as const })}
              />
            )}
            {video && image?.sourceUrl && (
              <ShowcaseVideo src={video} poster={image.sourceUrl} className="hero-frame__video" />
            )}
          </span>
        </span>
        <span className="hero-frame__caption">
          <span className="hero-frame__title">{frame.title}</span>
          {frame.builtAt && <span className="hero-frame__meta">{frame.builtAt}</span>}
        </span>
      </Link>
    </li>
  );
}

const Hero = ({ data, frames = [], copyLinks = [] }: HeroProps) => {
  const parsedCopy = parseHeroCopy(data?.heroCopy);
  const copy = autoLinkHeroCopy(parsedCopy.length > 0 ? parsedCopy : parseHeroCopy(FALLBACK_COPY), copyLinks);
  const { eyebrow, heading, primaryCta, secondaryCta } = resolveHeroContent(data);

  return (
    <section className="hero">
      <HeroScene />
      <div className="hero__inner">
        <div className="hero__intro">
          <p className="hero__eyebrow">{eyebrow}</p>
          <h1 className="hero__title">{heading}</h1>
          <p className="hero__sub">
            <HeroCopyText nodes={copy} />
          </p>
          <div className="hero__actions">
            <HeroCta {...primaryCta} className="hero__cta hero__cta--primary" />
            <HeroCta {...secondaryCta} className="hero__cta hero__cta--secondary" />
          </div>
        </div>
        {frames.length > 0 && (
          <ul className="hero__strip" aria-label="Selected projects">
            {frames.map((frame) => (
              <HeroFrameCard key={frame.slug} frame={frame} />
            ))}
          </ul>
        )}
      </div>
    </section>
  );
};

export default Hero;
