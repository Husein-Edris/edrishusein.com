import { describe, it, expect } from 'vitest';
import {
  ALL_KEY,
  OTHER_KEY,
  buildTechGrid,
  caseStudyCountsByTech,
  isInFilter,
} from './tech-usage';
import { SITE_CONTENT_DEFAULTS } from './transform/transformSiteContent';

const labels = SITE_CONTENT_DEFAULTS.techStackPage;

function project(techIds: number[] | false) {
  return {
    acf_fields: { project_overview: { tech_stack: techIds === false ? false : techIds.map((ID) => ({ ID })) } },
  };
}

function tech(id: number, title: string, extra: Record<string, unknown> = {}) {
  return { id, title: { rendered: title }, ...extra };
}

describe('caseStudyCountsByTech', () => {
  it('counts each project once per tech and tolerates ACF false', () => {
    const counts = caseStudyCountsByTech([project([1, 2, 2]), project([2]), project(false)]);
    expect(counts.get(1)).toBe(1);
    expect(counts.get(2)).toBe(2);
    expect(counts.has(3)).toBe(false);
  });
});

describe('buildTechGrid', () => {
  const projects = [project([1, 2]), project([1]), project([1, 3])];
  const categories = [
    { id: 10, name: 'Frontend' },
    { id: 11, name: 'DevOps &amp; Hosting' },
    { id: 12, name: 'Empty' },
  ];
  const techs = [
    tech(3, 'Zed', { tech_category: [10] }),
    tech(2, 'alpha', {
      tech_category: [10, 11],
      excerpt: { rendered: '<p>Fast &amp; small\n  build tool</p>\n' },
      acf_fields: { usage_note: '  Written by hand.  ' },
    }),
    tech(1, 'PHP', {
      tech_category: [],
      acf_fields: [],
      _embedded: { 'wp:featuredmedia': [{ source_url: 'https://cms/php.svg', mime_type: 'image/svg+xml', alt_text: '' }] },
    }),
    tech(4, 'Unused', { tech_category: [99] }),
    tech(5, ''),
  ];

  it('sorts by case study count, then name, and drops untitled entries', () => {
    const { items } = buildTechGrid(techs, projects, categories, labels);
    expect(items.map((t) => t.title)).toEqual(['PHP', 'alpha', 'Zed', 'Unused']);
  });

  it('computes count, description, note, logo and filter keys; unknown terms fall back to Other', () => {
    const [php, alpha, zed, unused] = buildTechGrid(techs, projects, categories, labels).items;
    expect(php).toMatchObject({ count: 3, description: '', usageNote: '', filterKeys: [OTHER_KEY] });
    expect(php.logo?.node.sourceUrl).toBe('https://cms/php.svg');
    expect(alpha).toMatchObject({ count: 1, description: 'Fast & small build tool', usageNote: 'Written by hand.', filterKeys: ['cat-10', 'cat-11'], logo: null });
    expect(zed).toMatchObject({ count: 1, filterKeys: ['cat-10'] });
    expect(unused).toMatchObject({ count: 0, filterKeys: [OTHER_KEY] });
  });

  it('builds All, categories by name with counts, then Other; skips empty categories', () => {
    const { tabs } = buildTechGrid(techs, projects, categories, labels);
    expect(tabs).toEqual([
      { key: ALL_KEY, label: 'All', count: 4 },
      { key: 'cat-11', label: 'DevOps & Hosting', count: 1 },
      { key: 'cat-10', label: 'Frontend', count: 2 },
      { key: OTHER_KEY, label: 'Other', count: 2 },
    ]);
  });

  it('returns no tabs when no tool has a category', () => {
    const { items, tabs } = buildTechGrid([tech(1, 'PHP'), tech(2, 'Git')], [], [], labels);
    expect(items).toHaveLength(2);
    expect(tabs).toEqual([]);
  });
});

describe('isInFilter', () => {
  it('matches every tile on All and only members otherwise', () => {
    const item = { filterKeys: ['cat-10'] };
    expect(isInFilter(item, ALL_KEY)).toBe(true);
    expect(isInFilter(item, 'cat-10')).toBe(true);
    expect(isInFilter(item, OTHER_KEY)).toBe(false);
  });
});
