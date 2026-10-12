import { describe, it, expect } from 'vitest';
import { buildArticleToc, slugifyHeading } from './article-toc';

describe('slugifyHeading', () => {
  it('transliterates German umlauts and strips punctuation', () => {
    expect(slugifyHeading('Qualität, die Sie vorher prüfen können')).toBe('qualitaet-die-sie-vorher-pruefen-koennen');
    expect(slugifyHeading('Die sieben Fragen für Ihr Erstgespräch')).toBe('die-sieben-fragen-fuer-ihr-erstgespraech');
    expect(slugifyHeading('  What Got Cheap?  ')).toBe('what-got-cheap');
    expect(slugifyHeading('Café & Größe')).toBe('cafe-groesse');
  });
});

describe('buildArticleToc', () => {
  it('adds ids to h2 headings and lists them in order', () => {
    const { html, items } = buildArticleToc('<p>Intro</p><h2>First part</h2><p>a</p><h2 class="x"><strong>Second</strong> &amp; last</h2>');
    expect(html).toBe('<p>Intro</p><h2 id="first-part">First part</h2><p>a</p><h2 id="second-last" class="x"><strong>Second</strong> &amp; last</h2>');
    expect(items).toEqual([
      { id: 'first-part', text: 'First part' },
      { id: 'second-last', text: 'Second & last' },
    ]);
  });

  it('keeps an existing id and de-duplicates repeated headings', () => {
    const { items } = buildArticleToc('<h2 id="faq">FAQ</h2><h2>Notes</h2><h2>Notes</h2><h2>faq</h2>');
    expect(items.map((item) => item.id)).toEqual(['faq', 'notes', 'notes-2', 'faq-2']);
  });

  it('returns no items below two headings but still adds the id', () => {
    const { html, items } = buildArticleToc('<h2>Only one</h2><h3>Sub</h3>');
    expect(items).toEqual([]);
    expect(html).toContain('<h2 id="only-one">');
  });

  it('falls back to a numbered id for headings without letters', () => {
    expect(buildArticleToc('<h2>!!!</h2><h2>2026</h2>').items.map((item) => item.id)).toEqual(['section-1', '2026']);
  });
});
