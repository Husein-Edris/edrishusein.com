import type { CSSProperties } from 'react';
import ServiceIcon from './ServiceIcon';
import type { ServiceDeliverable } from '@/src/lib/transform/transformService';

interface ServiceDeliverablesProps {
  heading: string;
  items: ServiceDeliverable[];
}

// "What you get": a plain list on hairlines, not a card grid. Each icon draws
// its stroke when the item scrolls in.
export default function ServiceDeliverables({ heading, items }: ServiceDeliverablesProps) {
  if (items.length === 0) return null;
  return (
    <section className="service-block service-deliverables" aria-labelledby="service-deliverables-heading">
      <div className="service-wrap service-split">
        <h2 id="service-deliverables-heading" className="service-heading">
          {heading}
        </h2>
        <ul className="service-deliverables__list">
          {items.map((item, index) => (
            <li
              key={`${item.title}-${index}`}
              className="service-deliverables__item"
              data-reveal="draw"
              style={{ '--i': index } as CSSProperties}
            >
              <ServiceIcon name={item.icon} className="service-deliverables__icon" />
              {item.title && <h3 className="service-deliverables__title">{item.title}</h3>}
              {item.text && <p className="service-deliverables__text">{item.text}</p>}
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
