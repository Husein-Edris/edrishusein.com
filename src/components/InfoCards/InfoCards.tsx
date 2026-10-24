// Card grid used for projects, notebook posts, and the bookshelf / tech stack teasers.
// Cards render visible in the server HTML: no scroll-reveal on proof content.
import Image from 'next/image';
import Link from 'next/link';
import './InfoCards.scss';
import SectionHeader from '../SectionHeader/SectionHeader';
import { truncateExcerpt } from './truncateExcerpt';
import TiltMedia from './TiltMedia';
import { PROJECT_CARD_LABEL_DEFAULTS, type ProjectCardLabels } from '@/src/lib/transform/transformSiteContent';
import { dictionary, type Dictionary } from '@/src/lib/i18n/dictionary';
import { DEFAULT_LANG, type Lang } from '@/src/lib/i18n/lang';

type CardVariant = 'dark' | 'light';
type CardSkin = 'projects' | 'blog' | 'default' | 'bookshelf' | 'techstack';

interface InfoCardProps {
  title: string;
  description: string;
  image?: string;
  link?: string;
  variant?: CardVariant;
  visitLink?: string | null;
  caseStudyLink?: string;
  /** Short label above a featured card's title, e.g. "Client project". */
  kicker?: string;
  /** Technology names shown as chips on featured cards. */
  tags?: string[];
}

interface InfoCardsProps {
  cards?: InfoCardProps[];
  columns?: 1 | 2 | 3;
  sectionNumber?: string;
  sectionTitle?: string;
  skin?: CardSkin;
  className?: string;
  variant?: CardVariant;
  viewMoreLink?: string;
  viewMoreText?: string;
  /** Projects skin: render the first N cards as large, image-led features. */
  featuredCount?: number;
  /** Heading between the featured cards and the remaining grid. */
  restTitle?: string;
  /** Projects skin: CMS-editable card labels (Site Content options page). */
  labels?: ProjectCardLabels;
  /** Page language for screen-reader text; card links arrive already localized. */
  lang?: Lang;
}

interface CardProps {
  card: InfoCardProps;
  skin: CardSkin;
  variant: CardVariant;
  labels: ProjectCardLabels;
  text: Dictionary;
}

function hasLiveSite(card: InfoCardProps): boolean {
  return Boolean(card.visitLink && card.visitLink !== '#');
}

function LiveSiteLink({ href, label, text }: { href: string; label: string; text: Dictionary }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="project-link visit-site-link">
      {label}
      <span className="sr-only"> ({text.opensInNewTab})</span>
    </a>
  );
}

function FeaturedProjectCard({
  card,
  index,
  labels,
  text,
}: {
  card: InfoCardProps;
  index: number;
  labels: ProjectCardLabels;
  text: Dictionary;
}) {
  const href = card.caseStudyLink || card.link || '#';

  return (
    <TiltMedia className={`card card--featured ${index % 2 === 1 ? 'card--flip' : ''}`}>
      <div className="card-image">
        {card.image && (
          <Image
            src={card.image}
            alt=""
            fill
            quality={85}
            priority={index === 0}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 60vw, 720px"
          />
        )}
      </div>
      <div className="card-info">
        <p className="card-kicker">
          <span className="card-index">{String(index + 1).padStart(2, '0')}</span>
          {card.kicker || labels.featuredLabel}
        </p>
        <h3 className="card-title">
          <Link href={href} className="card-link">
            {card.title}
          </Link>
        </h3>
        <div className="card-description" dangerouslySetInnerHTML={{ __html: card.description }} />
        {card.tags && card.tags.length > 0 && (
          <ul className="card-tags" aria-label={text.technologiesLabel}>
            {card.tags.map((tag) => (
              <li key={tag} className="card-tag">
                {tag}
              </li>
            ))}
          </ul>
        )}
        <div className="project-links">
          <span className="project-link case-study-link" aria-hidden="true">
            {labels.readCaseStudyLabel}
          </span>
          {hasLiveSite(card) && <LiveSiteLink href={card.visitLink as string} label={labels.visitLiveSiteLabel} text={text} />}
        </div>
      </div>
    </TiltMedia>
  );
}

function ProjectCard({ card, variant, labels, text }: Omit<CardProps, 'skin'>) {
  const href = card.caseStudyLink || card.link || '#';

  return (
    <TiltMedia className={`card ${card.variant || variant}`}>
      <div className="card-content">
        {card.image && (
          <div className="card-image">
            <Image
              src={card.image}
              alt=""
              fill
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 400px"
            />
          </div>
        )}
        <div className="card-info">
          <h3 className="card-title">
            {/* Stretched link: its ::after covers the whole card. */}
            <Link href={href} className="card-link">
              {card.title}
            </Link>
          </h3>
          <div className="card-description" dangerouslySetInnerHTML={{ __html: card.description }} />
          <div className="project-links">
            <span className="project-link case-study-link" aria-hidden="true">
              {labels.readCaseStudyLabel}
            </span>
            {hasLiveSite(card) && <LiveSiteLink href={card.visitLink as string} label={labels.visitLiveSiteLabel} text={text} />}
          </div>
        </div>
      </div>
    </TiltMedia>
  );
}

function LinkCard({ card, skin, variant }: Omit<CardProps, 'labels' | 'text'>) {
  return (
    <Link href={card.link || '#'} className={`card ${card.variant || variant}`}>
      <div className="card-content">
        {card.image && (
          <div className="card-image">
            <Image
              src={card.image}
              alt=""
              width={400}
              height={300}
              quality={85}
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              style={{ height: 'auto' }}
            />
          </div>
        )}
        <div className="card-info">
          <h3 className="card-title">{card.title}</h3>
          {skin === 'default' && (
            <div className="card-arrow">
              <Image src="/icons/arrow-active.svg" alt="" width={40} height={40} className="arrow-simple" />
            </div>
          )}
          <div className="card-description" dangerouslySetInnerHTML={{ __html: card.description }} />
        </div>
      </div>
    </Link>
  );
}

function Card({ card, skin, variant, labels, text }: CardProps) {
  if (skin === 'projects') return <ProjectCard card={card} variant={variant} labels={labels} text={text} />;
  if (!card.link) return null;
  return <LinkCard card={card} skin={skin} variant={variant} />;
}

function ViewMore({ href, text, fallback, className }: { href: string; text?: string; fallback: string; className: string }) {
  return (
    <div className={`view-more-inline ${className}`}>
      <Link href={href} className="view-more-link">
        {text || fallback}
      </Link>
    </div>
  );
}

function InfoCards({
  cards,
  columns = 1,
  sectionNumber,
  sectionTitle,
  skin = 'default',
  className = '',
  variant = 'dark',
  viewMoreLink,
  viewMoreText,
  featuredCount = 0,
  restTitle,
  labels = PROJECT_CARD_LABEL_DEFAULTS,
  lang = DEFAULT_LANG,
}: InfoCardsProps) {
  const text = dictionary(lang);
  const allCards = cards ?? [];
  const featureLimit = skin === 'projects' ? featuredCount : 0;
  const featuredCards = allCards.slice(0, featureLimit).map((card) => ({
    ...card,
    description: truncateExcerpt(card.description, 220),
  }));
  const displayCards = allCards.slice(featureLimit).map((card) => ({
    ...card,
    description: truncateExcerpt(card.description, 120),
  }));

  return (
    <section className={`info-cards ${skin} ${skin}-${variant} ${className}`}>
      <div className="container">
        {(sectionNumber || sectionTitle) && (
          <div className="section-header-wrapper">
            <SectionHeader number={sectionNumber || ''} title={sectionTitle || ''} variant={variant} hideNumber />
            {viewMoreLink && <ViewMore href={viewMoreLink} text={viewMoreText} fallback={text.viewMore} className="view-more-desktop" />}
          </div>
        )}
        {featuredCards.length > 0 && (
          <div className="featured-grid">
            {featuredCards.map((card, index) => (
              <FeaturedProjectCard
                key={card.caseStudyLink || card.link || index}
                card={card}
                index={index}
                labels={labels}
                text={text}
              />
            ))}
          </div>
        )}
        {restTitle && displayCards.length > 0 && <h2 className="rest-title">{restTitle}</h2>}
        <div className={`cards-grid columns-${columns}`}>
          {displayCards.map((card, index) => (
            <Card
              key={card.caseStudyLink || card.link || index}
              card={card}
              skin={skin}
              variant={variant}
              labels={labels}
              text={text}
            />
          ))}
        </div>
        {viewMoreLink && <ViewMore href={viewMoreLink} text={viewMoreText} fallback={text.viewMore} className="view-more-mobile" />}
      </div>
    </section>
  );
}

export default InfoCards;
