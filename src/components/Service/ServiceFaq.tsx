import type { ServiceFaqEntry } from '@/src/lib/transform/transformService';

interface ServiceFaqProps {
  heading: string;
  entries: ServiceFaqEntry[];
}

// Native <details>: the answers stay in the HTML (the FAQPage JSON-LD describes
// them and search engines read collapsed content). The first one starts open.
export default function ServiceFaq({ heading, entries }: ServiceFaqProps) {
  if (entries.length === 0) return null;
  return (
    <section className="service-block service-faq" aria-labelledby="service-faq-heading">
      <div className="service-wrap service-split">
        <h2 id="service-faq-heading" className="service-heading">
          {heading}
        </h2>
        <div className="service-faq__list">
          {entries.map((entry, index) => (
            <details key={`${entry.question}-${index}`} className="service-faq__item" open={index === 0}>
              <summary className="service-faq__question">
                <h3>{entry.question}</h3>
                <svg className="service-faq__chevron" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
                  <path d="M6 9.5 12 15.5 18 9.5" />
                </svg>
              </summary>
              <div className="service-faq__answer service-prose" dangerouslySetInnerHTML={{ __html: entry.answerHtml }} />
            </details>
          ))}
        </div>
      </div>
    </section>
  );
}
