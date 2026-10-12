'use client';

import { useEffect, useRef, useState } from 'react';
import type { TocItem } from '@/src/lib/article-toc';
import './ArticleToc.scss';

interface ArticleTocProps {
  items: readonly TocItem[];
  /** CMS Site Content > Article template > Contents heading. */
  heading: string;
  /** 'de' for German articles, so the heading texts are read in German. */
  lang?: string;
}

/** A heading counts as current once its top passes this line (px from the viewport top). */
const ACTIVE_LINE = 120;

/**
 * Contents list of an article (design C1): a sticky side column on desktop,
 * a collapsed <details> above the text on phones and tablets. Both lists are
 * plain anchor links rendered on the server; the scroll spy only adds
 * aria-current to the section being read.
 */
export default function ArticleToc({ items, heading, lang }: ArticleTocProps) {
  const [activeId, setActiveId] = useState<string | null>(null);
  const detailsRef = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    const headings = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    if (headings.length === 0 || typeof IntersectionObserver === 'undefined') return;

    const update = () => {
      let current: string | null = null;
      for (const element of headings) {
        if (element.getBoundingClientRect().top - ACTIVE_LINE <= 0) current = element.id;
      }
      setActiveId(current);
    };

    // Fires whenever a heading crosses the active line in either direction.
    const observer = new IntersectionObserver(update, {
      rootMargin: `-${ACTIVE_LINE}px 0px 0px 0px`,
      threshold: [0, 1],
    });
    headings.forEach((element) => observer.observe(element));
    update();
    return () => observer.disconnect();
  }, [items]);

  const list = (closeOnClick: boolean) => (
    <ol className="article-toc__list" lang={lang}>
      {items.map((item) => (
        <li key={item.id}>
          <a
            href={`#${item.id}`}
            className="article-toc__link"
            aria-current={item.id === activeId ? 'location' : undefined}
            onClick={closeOnClick ? () => detailsRef.current?.removeAttribute('open') : undefined}
          >
            {item.text}
          </a>
        </li>
      ))}
    </ol>
  );

  return (
    <nav className="article-toc" aria-label={heading}>
      <div className="article-toc__side">
        <p className="article-toc__heading">{heading}</p>
        {list(false)}
      </div>
      <details className="article-toc__collapsed" ref={detailsRef}>
        <summary className="article-toc__summary">{heading}</summary>
        {list(true)}
      </details>
    </nav>
  );
}
