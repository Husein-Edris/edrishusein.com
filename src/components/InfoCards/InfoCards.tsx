import Image from 'next/image';
import Link from 'next/link';
import './InfoCards.scss';
import SectionHeader from '../SectionHeader/SectionHeader';

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
  cards: InfoCardProps[];
  columns: 1 | 2 | 3;
  sectionNumber?: string;
  sectionTitle?: string;
  skin?: 'projects' | 'blog' | 'default';
  className?: string;
  variant?: 'dark' | 'light';
}

const InfoCards = ({
  cards,
  columns,
  sectionNumber,
  sectionTitle,
  skin = 'default',
  className = '',
  variant = 'dark'
}: InfoCardsProps) => {
  const sectionClass = `info-cards ${skin} ${skin}-${variant} ${className}`;

  return (
    <section className={sectionClass}>
      <div className="container">
        {(sectionNumber || sectionTitle) && (
          <SectionHeader number={sectionNumber} title={sectionTitle} variant={variant}
          />
        )}
        <div className={`cards-grid columns-${columns}`}>
          {cards.map((card, index) => (
            <Link
              href={card.link || '#'}
              key={index}
              className={`card ${card.variant || variant}`}
            >
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
                  <p className="card-description">{card.description}</p>
                  {skin === 'projects' && card.visitLink && card.caseStudyLink && (
                    <div className="project-links">
                      <Link href={card.visitLink} className="project-link">
                        VISIT SITE
                      </Link>
                      <Link href={card.caseStudyLink} className="project-link">
                        CASE STUDY
                      </Link>
                    </div>
                  )}
                </div>
              </div>
            </Link>
          ))}
        </div>

        {skin === 'projects' && (
          <div className="view-more">
            <Link href="/projects" className="view-more-link">
              VIEW MORE
            </Link>
          </div>
        )}
      </div>
    </section>
  );
};

export default InfoCards;