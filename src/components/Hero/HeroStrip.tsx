'use client';

// The hero frame strip. On phones it is a horizontal swipe row (Hero.scss), and
// Chrome does not scroll a partly visible focused link into view inside it, so
// keyboard focus could land on a frame that is mostly off screen. Scrolling the
// focused frame into view here keeps keyboard users on the visible frame.
import type { FocusEvent, ReactNode } from 'react';
import { useLang } from '@/src/components/LangProvider/LangProvider';
import { dictionary } from '@/src/lib/i18n/dictionary';

export default function HeroStrip({ children }: { children: ReactNode }) {
  const label = dictionary(useLang()).selectedProjects;
  const handleFocus = (event: FocusEvent<HTMLUListElement>) => {
    const strip = event.currentTarget;
    if (strip.scrollWidth <= strip.clientWidth) return;
    const frame = (event.target as HTMLElement).closest('li');
    frame?.scrollIntoView({ block: 'nearest', inline: 'start' });
  };

  return (
    <ul className="hero__strip" aria-label={label} onFocus={handleFocus}>
      {children}
    </ul>
  );
}
