import Image from 'next/image';
import type { FactRow } from '@/src/lib/case-study-facts';

interface CaseStudyFactsProps {
  rows: readonly FactRow[];
  /** Screen-reader heading of the column; CMS Site Content > Case study template. */
  heading: string;
}

function FactValue({ row }: { row: FactRow }) {
  if (row.kind === 'text') return <>{row.text}</>;

  if (row.kind === 'link') {
    return (
      <a href={row.href} target="_blank" rel="noopener noreferrer" className="case-study-facts__link">
        {row.text}
        <span aria-hidden="true">↗</span>
      </a>
    );
  }

  return (
    <ul className="case-study-facts__chips">
      {row.technologies.map((tech) => (
        <li key={tech.id} className="case-study-facts__chip">
          {tech.featuredImage?.node && (
            <Image src={tech.featuredImage.node.sourceUrl} alt="" width={18} height={18} unoptimized />
          )}
          <span>{tech.title}</span>
        </li>
      ))}
    </ul>
  );
}

/** Case study facts column (design 3B). Renders nothing when no fact is filled. */
export default function CaseStudyFacts({ rows, heading }: CaseStudyFactsProps) {
  if (rows.length === 0) return null;

  return (
    <aside className="case-study-facts" aria-labelledby="case-study-facts-heading">
      <h2 id="case-study-facts-heading" className="sr-only">
        {heading}
      </h2>
      <dl className="case-study-facts__list">
        {rows.map((row) => (
          <div key={row.key} className={`case-study-facts__row case-study-facts__row--${row.kind}`}>
            <dt>{row.label}</dt>
            <dd>
              <FactValue row={row} />
            </dd>
          </div>
        ))}
      </dl>
    </aside>
  );
}
