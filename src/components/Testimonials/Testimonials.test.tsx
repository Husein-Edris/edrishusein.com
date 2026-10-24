import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { renderToString } from 'react-dom/server';
import Testimonials, { attributionLabel, hostOf } from './Testimonials';
import type { Testimonial } from '@/src/lib/transform/transformTestimonials';
import LangProvider from '@/src/components/LangProvider/LangProvider';
import { DICTIONARY } from '@/src/lib/i18n/dictionary';
import { SITE_CONTENT_DEFAULTS_DE } from '@/src/lib/transform/transformSiteContent';

const base: Testimonial = {
  quote: 'Ok.',
  name: '',
  context: '',
  lang: 'en',
  logo: null,
  websiteUrl: '',
};

const visibleQuotes = (container: HTMLElement) =>
  [...container.querySelectorAll('figure:not(.testimonial--off) blockquote')].map((q) => q.textContent);

describe('Testimonials rotation', () => {
  it('shows only the first default quote and a 1 / 7 counter', () => {
    const { container } = render(<Testimonials />);

    expect(screen.getByRole('heading', { name: 'What clients say' })).toBeTruthy();
    expect(container.querySelectorAll('blockquote')).toHaveLength(7);
    expect(visibleQuotes(container)).toHaveLength(1);
    expect(visibleQuotes(container)[0]).toContain('best WordPress developer');
    expect(container.querySelector('.testimonials__count')?.textContent).toBe('Quote 1 /  of 7');
    expect(container.querySelector('[aria-live="polite"]')).toBeTruthy();
  });

  it('server HTML shows the first quote and hides the controls for visitors without JS', () => {
    const html = renderToString(<Testimonials />);
    expect(html).toMatch(/class="testimonials__nav"[^>]*hidden/);
    expect(html.match(/<figure class="testimonial"/g) ?? []).toHaveLength(1);
    expect(html.match(/<figure class="testimonial testimonial--off"/g) ?? []).toHaveLength(6);
    expect(html).toContain('best WordPress developer');
  });

  it('Next and Prev move through the shown quotes and wrap around', () => {
    const { container } = render(<Testimonials />);
    const next = screen.getByRole('button', { name: 'Next quote' });
    const prev = screen.getByRole('button', { name: 'Prev quote' });

    fireEvent.click(next);
    expect(visibleQuotes(container)[0]).toContain('online shop');
    fireEvent.click(next);
    fireEvent.click(next);
    expect(visibleQuotes(container)[0]).toContain('book him again');
    fireEvent.click(next);
    fireEvent.click(next);
    expect(visibleQuotes(container)[0]).toContain('constructive ideas');
    fireEvent.click(next);
    expect(visibleQuotes(container)[0]).toContain('heavy workload');
    fireEvent.click(next);
    expect(visibleQuotes(container)[0]).toContain('best WordPress developer');
    fireEvent.click(prev);
    expect(visibleQuotes(container)[0]).toContain('heavy workload');
    expect(container.querySelector('.testimonials__count')?.textContent).toContain('7');
  });

  it('renders no controls for a single quote and nothing when the list is empty', () => {
    const { container, rerender } = render(<Testimonials data={{ title: 'T', prevLabel: 'P', nextLabel: 'N', items: [base] }} />);
    expect(screen.queryByRole('button')).toBeNull();
    expect(screen.getByText('Ok.')).toBeTruthy();

    rerender(<Testimonials data={{ title: 'T', prevLabel: 'P', nextLabel: 'N', items: [] }} />);
    expect(container.innerHTML).toBe('');
  });

  it('keeps the given order and uses CMS button labels', () => {
    const { container } = render(
      <Testimonials
        data={{
          title: 'Kind words',
          prevLabel: 'Back',
          nextLabel: 'Forward',
          items: [
            { ...base, quote: 'One.' },
            { ...base, quote: 'Zwei.', lang: 'de' },
          ],
        }}
      />
    );
    expect(container.querySelectorAll('blockquote')).toHaveLength(2);
    fireEvent.click(screen.getByRole('button', { name: 'Forward quote' }));
    expect(visibleQuotes(container)).toEqual(['Zwei.']);
    expect(container.querySelector('figure:not(.testimonial--off) blockquote')?.getAttribute('lang')).toBe('de');
    expect(screen.getByRole('button', { name: 'Back quote' })).toBeTruthy();
  });
});

describe('Testimonials attribution', () => {
  it('links name and company to the client site with a descriptive label', () => {
    render(<Testimonials />);
    const link = screen.getByRole('link', { name: 'Leon Heuser, Managing Director, ReviewForest, opens reviewforest.org in a new tab' });
    expect(link.getAttribute('href')).toBe('https://reviewforest.org/');
    expect(link.getAttribute('target')).toBe('_blank');
    expect(link.getAttribute('rel')).toContain('noopener');
    expect(link.textContent).toBe('Leon HeuserManaging Director, ReviewForest');
    expect(link.querySelector('img')?.getAttribute('alt')).toBe('');
  });

  it('shows no raw domain, dates, ratings or platform names', () => {
    const { container } = render(<Testimonials />);
    expect(container.textContent).not.toMatch(/\.(org|com)\b/);
    expect(container.textContent).not.toMatch(/upwork|\b20\d{2}\b|5\.0|ratings?/i);
  });

  it('renders no attribution for an unnamed quote without company or logo', () => {
    const { container } = render(<Testimonials data={{ title: 'T', prevLabel: 'P', nextLabel: 'N', items: [base] }} />);
    expect(container.querySelector('figcaption')).toBeNull();
  });

  it('renders an unlinked line when there is no website', () => {
    const { container } = render(
      <Testimonials data={{ title: 'T', prevLabel: 'P', nextLabel: 'N', items: [{ ...base, name: 'Ana K.', context: 'Acme' }] }} />
    );
    expect(screen.queryByRole('link')).toBeNull();
    expect(container.querySelector('.testimonial__who')).toBeTruthy();
    expect(screen.getByText('Acme')).toBeTruthy();
  });

  it('builds the host and label helpers', () => {
    expect(hostOf('https://www.starsmedia.com/')).toBe('starsmedia.com');
    expect(hostOf('not a url')).toBe('');
    expect(attributionLabel({ ...base, name: 'Chloé Kuhlow', context: 'Owner, Campzilla', websiteUrl: 'https://campzilla-shop.com/' })).toBe(
      'Chloé Kuhlow, Owner, Campzilla, opens campzilla-shop.com in a new tab'
    );
  });
});

describe('Testimonials on German pages', () => {
  it('translates the screen-reader text of the controls', () => {
    const items = [
      { quote: 'One.', name: 'A', context: '', lang: 'en' as const, logo: null, websiteUrl: '' },
      { quote: 'Zwei.', name: 'B', context: '', lang: 'de' as const, logo: null, websiteUrl: '' },
    ];
    const { container } = render(
      <LangProvider lang="de" nav={SITE_CONTENT_DEFAULTS_DE.nav}>
        <Testimonials data={{ title: 'Das sagen Kunden', prevLabel: 'Zurück', nextLabel: 'Weiter', items }} />
      </LangProvider>
    );
    const srText = Array.from(container.querySelectorAll('.sr-only')).map((node) => node.textContent?.trim());
    expect(srText).toContain('Zitat');
    expect(srText).toContain('von');
    expect(container.textContent).not.toContain('quote');
  });

  it('names the new tab in German in the attribution label', () => {
    const item = { quote: 'Q', name: 'Leon', context: 'CEO', lang: 'en' as const, logo: null, websiteUrl: 'https://www.example.org/' };
    expect(attributionLabel(item, DICTIONARY.de)).toBe('Leon, CEO, öffnet example.org in einem neuen Tab');
    expect(attributionLabel(item)).toBe('Leon, CEO, opens example.org in a new tab');
  });
});
