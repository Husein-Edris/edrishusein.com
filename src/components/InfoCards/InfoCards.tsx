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
  viewMoreLink?: string;
  viewMoreText?: string;
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
  variant = 'dark',
  viewMoreLink,
  viewMoreText
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
          <div className="section-header-wrapper">
            <SectionHeader
              number={sectionNumber || ''}
              title={displayTitle || ''}
              variant={variant}
            />
            {viewMoreLink && (
              <div className="view-more-inline">
                <Link href={viewMoreLink} className="view-more-link">
                  {viewMoreText || 'VIEW MORE'}
                </Link>
              </div>
            )}
          </div>
        )}
        <div className={`cards-grid columns-${columns}`}>
          {displayCards?.map((card, index) => {
            if (skin !== 'projects' && !card.link) {
              return null; // Skip cards without links for non-project skins
            }

            // For non-project cards, wrap entire card in Link
            if (skin !== 'projects') {
              return (
                <Link key={index} href={card.link || '#'} className={`card ${card.variant || variant}`}>
                  <div className="card-content">
                    {card.image && (
                      <div className="card-image">
                        <Image
                          src={card.image}
                          alt={card.title}
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
                    </div>
                  </div>
                </Link>
              );
            }

            // For project cards, don't wrap entire card - only specific elements link to case study
            return (
              <div key={index} className={`card ${card.variant || variant}`}>
                <div className="card-content">
                  {card.image && (
                    <Link 
                      href={card.caseStudyLink || '#'} 
                      className="card-image"
                      style={{
                        backgroundImage: `url(${card.image})`,
                        backgroundSize: 'contain',
                        backgroundPosition: '50% 50%',
                        backgroundRepeat: 'no-repeat',
                        color: 'transparent',
                        height: '300px'
                      }}
                      aria-label={card.title}
                    >
                      {/* Hidden text for screen readers */}
                      <span style={{ position: 'absolute', left: '-9999px' }}>{card.title}</span>
                    </Link>
                  )}
                  <div className="card-info">
                    <Link href={card.caseStudyLink || '#'}>
                      <h3 className="card-title">{card.title}</h3>
                    </Link>
                    <div
                      className="card-description"
                      dangerouslySetInnerHTML={{ __html: card.description }}
                    />
                    {(card.caseStudyLink || card.visitLink) && (
                      <div className="project-links">
                        {card.visitLink && card.visitLink !== '#' && (
                          <button 
                            type="button"
                            className="project-link visit-site-link"
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              console.log('Visit button clicked, URL:', card.visitLink);
                              window.open(card.visitLink, '_blank', 'noopener,noreferrer');
                            }}
                          >
                            VISIT LIVE SITE
                          </button>
                        )}
                        {card.caseStudyLink && (
                          <Link 
                            href={card.caseStudyLink}
                            className="project-link case-study-link"
                          >
                            CASE STUDY
                          </Link>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
}

export default InfoCards;