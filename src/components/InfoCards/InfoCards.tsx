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
  columns: 1 | 2 | 3;
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
  columns,
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
            number={sectionNumber}
            title={displayTitle}
            variant={variant}
          />
        )}
        <div className={`cards-grid columns-${columns}`}>
          {displayCards?.map((card, index) => {
            // For project cards, make the entire card clickable to the case study page
            const CardWrapper = skin === 'projects' ? Link : Link;
            const cardProps = skin === 'projects' 
              ? { href: card.caseStudyLink || '#', className: `card ${card.variant || variant}` }
              : { href: card.link || '#', className: `card ${card.variant || variant}` };

            return (
              <CardWrapper key={index} {...cardProps}>
                <div className="card-content">
                  {card.image && (
                    <div className="card-image">
                      <Image
                        src={card.image}
                        alt={card.title}
                        width={400}
                        height={300}
                        priority={index === 0}
                      />
                    </div>
                  )}
                  <div className="card-info">
                    <h3 className="card-title">{card.title}</h3>
                    {skin === 'default' && (
                      <div className="card-arrow">
                        <Image
                          src="/icons/arrow-disabled.svg"
                          alt="Arrow"
                          width={40}
                          height={40}
                          className="arrow-disabled"
                        />
                        <Image
                          src="/icons/arrow-active.svg"
                          alt="Arrow"
                          width={40}
                          height={40}
                          className="arrow-active"
                        />
                      </div>
                    )}
                    <div
                      className="card-description"
                      dangerouslySetInnerHTML={{ __html: card.description }}
                    />
                    {skin === 'projects' && card.caseStudyLink && (
                      <div className="project-links" onClick={(e) => e.stopPropagation()}>
                        <Link 
                          href={card.caseStudyLink} 
                          className="project-link case-study-link"
                          onClick={(e) => e.stopPropagation()}
                        >
                          CASE STUDY
                        </Link>
                      </div>
                    )}
                  </div>
                </div>
              </CardWrapper>
            );
          })}
        </div>

        {(skin === 'projects' || skin === 'blog') && (
          <div className="view-more">
            <Link
              href={skin === 'projects' ? '/projects' : '/notebook'}
              className="view-more-link"
            >
              VIEW MORE
            </Link>
          </div>
        )}
      </div>
    </section>
  );
}

export default InfoCards;