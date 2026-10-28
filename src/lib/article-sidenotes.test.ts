import { describe, it, expect } from 'vitest';
import { withSidenotes, splitLead } from './article-sidenotes';

const REFS = '<h2 id="references">References</h2><ol><li>Peng et al. (2023). Copilot trial.</li><li>METR (2025). Randomized trial.</li></ol>';

describe('withSidenotes', () => {
  it('pairs a paragraph citing [n] with that reference and its first percentage', () => {
    const html = withSidenotes(`<p>They were 55.8 percent faster [1].</p>${REFS}`);
    expect(html).toContain('<div class="sidenote-row"><p>They were 55.8 percent faster [1].</p><aside class="sidenote">');
    expect(html).toContain('<span class="sidenote__source">[1] Peng et al. (2023). Copilot trial.</span>');
  });

  it('signs a figure by the direction word after it: faster is +, slower is minus', () => {
    const html = withSidenotes(`<p>55.8 percent faster [1].</p><p>Mid.</p><p>19 percent slower [2].</p>${REFS}`);
    expect(html).toContain('<span class="sidenote__figure">+55.8%</span>');
    expect(html).toContain('<span class="sidenote__figure sidenote__figure--down">−19%</span>');
  });

  it('reads German percentages, direction words and the Quellen heading', () => {
    const html = withSidenotes('<p>19 Prozent langsamer [1].</p><h2>Quellen</h2><ol><li>METR (2025).</li></ol>');
    expect(html).toContain('<span class="sidenote__figure sidenote__figure--down">−19%</span>');
    expect(html).toContain('[1] METR (2025).');
  });

  it('shows an unsigned figure when no direction word follows', () => {
    const html = withSidenotes(`<p>WordPress runs 43 percent of the web [1].</p>${REFS}`);
    expect(html).toContain('<span class="sidenote__figure">43%</span>');
  });

  it('merges back-to-back cited paragraphs into one note spanning them', () => {
    const html = withSidenotes(`<p>A 14 percent drop [1].</p>\n<p>And 32 percent more bounces [2].</p><p>Plain.</p>${REFS}`);
    expect(html).toContain('<div class="sidenote-row"><p>A 14 percent drop [1].</p>\n<p>And 32 percent more bounces [2].</p><aside class="sidenote">');
    expect(html.match(/class="sidenote"/g)).toHaveLength(1);
    expect(html).toContain('[1] Peng');
    expect(html).toContain('[2] METR');
    expect(html).toContain('<p>Plain.</p>');
  });

  it('adds a source-only note when the paragraph has no percentage', () => {
    const html = withSidenotes(`<p>See the trial [2].</p>${REFS}`);
    expect(html).not.toContain('sidenote__figure');
    expect(html).toContain('[2] METR (2025). Randomized trial.');
  });

  it('leaves paragraphs without a matching reference untouched', () => {
    const input = '<p>No citation here.</p><p>Unknown [7].</p>';
    expect(withSidenotes(input)).toBe(input);
  });
});

describe('splitLead', () => {
  it('splits the intro paragraphs from the first h2 onwards', () => {
    expect(splitLead('<p>a</p><p>b</p><h2 id="x">X</h2><p>c</p>')).toEqual({ lead: '<p>a</p><p>b</p>', rest: '<h2 id="x">X</h2><p>c</p>' });
  });

  it('returns everything as rest when there is no h2', () => {
    expect(splitLead('<p>a</p>')).toEqual({ lead: '', rest: '<p>a</p>' });
  });
});
