'use client';

import { useState } from 'react';
import Image from 'next/image';
import { ALL_KEY, isInFilter, type TechFilterTab, type TechGridItem } from '@/src/lib/tech-usage';
import { fillLabel, type SiteContent } from '@/src/lib/transform/transformSiteContent';
import './TechGrid.scss';

export type TechGridLabels = Pick<
  SiteContent['techStackPage'],
  'filterLabel' | 'statusFormat'
>;

interface TechGridProps {
  items: readonly TechGridItem[];
  /** Empty when no tool has a category: the grid then shows without filter buttons. */
  tabs: readonly TechFilterTab[];
  /** CMS Site Content > Tech stack page. */
  labels: TechGridLabels;
}

/**
 * Logo grid of tools with category filter buttons (design A4). The server
 * renders every tile visible, so the full list works without JavaScript; the
 * buttons then hide the tiles outside the chosen category.
 */
export default function TechGrid({ items, tabs, labels }: TechGridProps) {
  const [activeKey, setActiveKey] = useState<string>(ALL_KEY);
  const [status, setStatus] = useState('');

  function choose(tab: TechFilterTab) {
    setActiveKey(tab.key);
    setStatus(fillLabel(labels.statusFormat, { count: tab.count }));
  }

  return (
    <div className="tech-grid">
      {tabs.length > 0 && (
        <div className="tech-grid__tabs" role="group" aria-label={labels.filterLabel}>
          {tabs.map((tab) => (
            <button
              key={tab.key}
              type="button"
              className="tech-grid__tab"
              aria-pressed={tab.key === activeKey}
              onClick={() => choose(tab)}
            >
              {tab.label} <span className="tech-grid__tab-count">{tab.count}</span>
            </button>
          ))}
        </div>
      )}
      <p className="tech-grid__status" aria-live="polite">
        {status}
      </p>

      <ul className="tech-grid__list">
        {items.map((item) => (
          <li key={item.id} className="tech-grid__tile" hidden={!isInFilter(item, activeKey)}>
            <div className="tech-grid__logo">
              {item.logo ? (
                <Image src={item.logo.node.sourceUrl} alt="" width={56} height={56} unoptimized />
              ) : (
                <span className="tech-grid__initial" aria-hidden="true">
                  {item.title.charAt(0)}
                </span>
              )}
            </div>
            <p className="tech-grid__name">{item.title}</p>
            {item.description && <p className="tech-grid__desc">{item.description}</p>}
            {item.usageNote && <p className="tech-grid__note">{item.usageNote}</p>}
          </li>
        ))}
      </ul>
    </div>
  );
}
