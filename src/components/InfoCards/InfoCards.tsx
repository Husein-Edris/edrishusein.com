import Image from 'next/image';
import Link from 'next/link';
import './InfoCards.scss';

interface InfoCardProps {
  title: string;
  description: string;
  image?: string;
  link?: string;
  variant?: 'dark' | 'light';
}

interface InfoCardsProps {
  cards: InfoCardProps[];
  columns: 1 | 2 | 3;
  sectionNumber?: string;
  sectionTitle?: string;
}

const InfoCards = ({
  cards,
  columns,
  sectionNumber,
  sectionTitle
}: InfoCardsProps) => {
  return (
    <section className="info-cards">
      <div className="container">
        {(sectionNumber || sectionTitle) && (
          <div className="section-header">
            {sectionNumber && <h2 className="section-number">{sectionNumber}</h2>}
            {sectionTitle && <h2 className="section-title">{sectionTitle}</h2>}
          </div>
        )}
        
        <div className={`cards-grid columns-${columns}`}>
          {cards.map((card, index) => (
            <Link 
              href={card.link || '#'} 
              key={index} 
              className={`card ${card.variant || 'dark'}`}
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
                  <div className="card-arrow">
                    <Image 
                      src="/icons/arrow-disabled.svg" 
                      alt="Arrow" 
                      width={24} 
                      height={24}
                      className="arrow-disabled"
                    />
                    <Image 
                      src="/icons/arrow-active.svg" 
                      alt="Arrow" 
                      width={24} 
                      height={24}
                      className="arrow-active"
                    />
                  </div>
                  <p className="card-description">{card.description}</p>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
};

export default InfoCards;