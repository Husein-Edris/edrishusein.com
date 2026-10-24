// src/components/Hero/Hero.tsx
import Image from 'next/image';
import Link from 'next/link';
import { HeroSection } from '@/src/types/wordpress';
import type { HeroFrame } from '@/src/lib/hero-frames';
import ShowcaseVideo from './ShowcaseVideo';
import HeroCopyText from './HeroCopyText';
import HeroStrip from './HeroStrip';
import { autoLinkHeroCopy, parseHeroCopy, type HeroCopyLink } from './heroCopy';
import { HERO_FALLBACK_COPY, isInternalPath, resolveHeroContent } from './heroContent';
import { DEFAULT_LANG, type Lang } from '@/src/lib/i18n/lang';
import './Hero.scss';

interface HeroProps {
  data?: HeroSection;
  frames?: HeroFrame[];
  /** Project names in the paragraph linked to their live sites while the CMS copy has no links. */
  copyLinks?: HeroCopyLink[];
  lang?: Lang;
}

// Rendered widths of the strip (Hero.scss): a swipe row of 82% wide frames under
// 640px, three columns (1fr 1.4fr 1fr) above it, in a 1200px row on desktop.
// Screenshots are about 2:1 and object-fit: cover crops them into a 16:10 box
// (16:9.4 for the lead), so the drawn image is wider than its column: x1.25 for
// side frames, x1.18 for the lead. The sizes below include that factor so the
// picked file is never below 1x of the drawn width.
const LEAD_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 45vw, 572px';
const SIDE_SIZES = '(max-width: 640px) 100vw, (max-width: 1024px) 34vw, 430px';

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
                {...(isLead ? { preload: true, fetchPriority: 'high' as const } : { loading: 'eager' as const })}
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

const Hero = ({ data, frames = [], copyLinks = [], lang = DEFAULT_LANG }: HeroProps) => {
  const parsedCopy = parseHeroCopy(data?.heroCopy);
  const copy = autoLinkHeroCopy(parsedCopy.length > 0 ? parsedCopy : parseHeroCopy(HERO_FALLBACK_COPY[lang]), copyLinks);
  const { eyebrow, heading, primaryCta, secondaryCta } = resolveHeroContent(data, lang);

  return (
    <section className="hero">
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
          <HeroStrip>
            {frames.map((frame) => (
              <HeroFrameCard key={frame.slug} frame={frame} />
            ))}
          </HeroStrip>
        )}
      </div>
    </section>
  );
};

export default Hero;
