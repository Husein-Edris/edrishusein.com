// Modified InfoCards client component with improved styling
'use client';

import Image from 'next/image';
import Link from 'next/link';
import './InfoCards.scss';
import SectionHeader from '../SectionHeader/SectionHeader';

// Types
interface InfoCardProps {
  title: string;
  description: string;
  image?: string;
  link?: string;
  variant?: 'dark' | 'light';
  visitLink?: string;
  caseStudyLink?: string;
}

interface InfoCardsProps {
  cards?: InfoCardProps[];
  columns?: 1 | 2 | 3;
  sectionNumber?: string;
  sectionTitle?: string;
  skin?: 'projects' | 'blog' | 'default' | 'bookshelf' | 'techstack';
  className?: string;
  variant?: 'dark' | 'light';
}

// Helper function to truncate text and strip HTML
function truncateExcerpt(html: string, maxLength = 120): string {
  if (!html) return '';

  // Strip HTML tags
  const text = html.replace(/<\/?[^>]+(>|$)/g, "");

  if (text.length <= maxLength) return html;

  // Find the last space before maxLength to avoid cutting words
  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const truncatedText = truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength);

  return truncatedText + '...';
}


// Modified InfoCards component
function InfoCards({
  cards,
  columns = 1,
  sectionNumber,
  sectionTitle,
  skin = 'default',
  className = '',
  variant = 'dark'
}: InfoCardsProps) {
  // For client component, we expect cards to be passed as props
  const displayCards = cards ? cards.map(card => ({
    ...card,
    description: truncateExcerpt(card.description, 120)
  })) : [];
  
  const displayTitle = sectionTitle;

  const sectionClass = `info-cards ${skin} ${skin}-${variant} ${className}`;

  return (
    <section className={sectionClass}>
      <div className="container">
        {(sectionNumber || displayTitle) && (
          <SectionHeader
            number={sectionNumber || ''}
            title={displayTitle || ''}
            variant={variant}
          />
        )}
        <div className={`cards-grid columns-${columns}`}>
          {displayCards?.map((card, index) => {
            // For project cards, use div to avoid nested anchors, other cards use Link
            const CardWrapper = skin === 'projects' ? 'div' : Link;
            const cardProps = skin === 'projects' 
              ? { className: `card ${card.variant || variant}` }
              : { href: card.link || '#', className: `card ${card.variant || variant}` };

            if (skin !== 'projects' && !card.link) {
              return null; // Skip cards without links for non-project skins
            }

            return (
              <CardWrapper key={index} {...(cardProps as any)}>
                <div className="card-content">
                  {card.image && (
                    <div className="card-image">
                      <Image
                        src={card.image}
                        alt={card.title}
                        width={400}
                        height={300}
                        priority={index === 0}
                        loading={index === 0 ? "eager" : "lazy"}
                        quality={85}
                      />
                    </div>
                  )}
                  <div className="card-info">
                    <h3 className="card-title">{card.title}</h3>
                    {skin === 'default' && (
                      <div className="card-arrow">
                        <Image
                          src="/icons/arrow-active.svg"
                          alt="Arrow"
                          width={40}
                          height={40}
                          className="arrow-simple"
                        />
                      </div>
                    )}
                    <div
                      className="card-description"
                      dangerouslySetInnerHTML={{ __html: card.description }}
                    />
                    {skin === 'projects' && (card.caseStudyLink || card.visitLink) && (
                      <div className="project-links" onClick={(e) => e.stopPropagation()}>
                        {card.visitLink && card.visitLink !== '#' && (
                          <Link 
                            href={card.visitLink} 
                            className="project-link visit-site-link"
                            onClick={(e) => e.stopPropagation()}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            VISIT LIVE SITE
                          </Link>
                        )}
                        {card.caseStudyLink && (
                          <Link 
                            href={card.caseStudyLink} 
                            className="project-link case-study-link"
                            onClick={(e) => e.stopPropagation()}
                          >
                            CASE STUDY
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </CardWrapper>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default InfoCards;