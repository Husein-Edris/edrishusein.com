import { describe, it, expect } from 'vitest';
import {
  transformTestimonials,
  selectedTestimonialIds,
  DEFAULT_TESTIMONIALS_SECTION,
  type RestTestimonialPost,
} from './transformTestimonials';

const EM_DASH = String.fromCharCode(0x2014);

const post = (id: number, title: string, acf: RestTestimonialPost['acf_fields'] = {}): RestTestimonialPost => ({
  id,
  title: { rendered: title },
  acf_fields: acf,
});

const home = (testimonials: unknown, extra: Record<string, unknown> = {}) => ({
  testimonials_section: { testimonials, ...extra },
});

describe('transformTestimonials', () => {
  it('returns the code defaults when acf_fields is missing', () => {
    expect(transformTestimonials(undefined)).toEqual(DEFAULT_TESTIMONIALS_SECTION);
    expect(transformTestimonials(null)).toEqual(DEFAULT_TESTIMONIALS_SECTION);
    expect(transformTestimonials({})).toEqual(DEFAULT_TESTIMONIALS_SECTION);
    expect(transformTestimonials({ testimonials_section: false })).toEqual(DEFAULT_TESTIMONIALS_SECTION);
  });

  it('ships the seven homepage quotes as defaults, in order', () => {
    const { items } = DEFAULT_TESTIMONIALS_SECTION;
    expect(items.map((item) => item.name)).toEqual([
      'Leon Heuser',
      'Chloé Kuhlow',
      'Guntram Bechtold',
      'Martina Velmeden',
      'Christoph Santner',
      'Thomas Rohner and Tom Glitzner',
      'bobdo',
    ]);
    expect(items.map((item) => item.context)).toEqual([
      'Managing Director, ReviewForest',
      'Owner, Campzilla',
      'Founder and Managing Director, Stars Media',
      'Interior architect, Velmeden Atelier',
      'Founder, Alles KI',
      'Employer reference, Baschnegger Ammann Partner',
      'Employer reference, bobdo',
    ]);
    expect(items.slice(0, 3).every((item) => item.logo && item.websiteUrl)).toBe(true);
  });

  it('keeps defaults free of dates, platform names, tool names and em dashes', () => {
    const text = JSON.stringify(DEFAULT_TESTIMONIALS_SECTION);
    expect(text).not.toMatch(/upwork|elementor|page builder|woocommerce|figma|\.\.\.|…/i);
    expect(text).not.toMatch(/\b(19|20)\d{2}\b/);
    expect(text).not.toContain(EM_DASH);
  });

  it('orders items as picked on the Home page, not as the posts arrive', () => {
    const posts = [post(3, 'C', { quote: 'Three.' }), post(1, 'A', { quote: 'One.' }), post(2, 'B', { quote: 'Two.' })];
    const result = transformTestimonials(home([2, 3, 1]), posts);
    expect(result.items.map((item) => item.quote)).toEqual(['Two.', 'Three.', 'One.']);
  });

  it('skips picked posts that did not arrive or have no quote, and posts that were not picked', () => {
    const posts = [post(1, 'A', { quote: 'One.' }), post(2, 'B', { quote: '  ' }), post(9, 'Z', { quote: 'Not picked.' })];
    const result = transformTestimonials(home([1, 2, 5]), posts);
    expect(result.items.map((item) => item.quote)).toEqual(['One.']);
  });

  it('falls back to the default quotes when nothing is picked (ACF sends false)', () => {
    const result = transformTestimonials(home(false, { section_title: 'Kind words' }), [post(1, 'A', { quote: 'x' })]);
    expect(result.title).toBe('Kind words');
    expect(result.items).toEqual(DEFAULT_TESTIMONIALS_SECTION.items);
  });

  it('falls back to the default quotes when the picked posts could not be loaded', () => {
    expect(transformTestimonials(home([1, 2]), []).items).toEqual(DEFAULT_TESTIMONIALS_SECTION.items);
  });

  it('ignores the old repeater rows', () => {
    const result = transformTestimonials({
      testimonials_section: { items: [{ quote: 'Old row.', name: 'Old', show: true }] },
    });
    expect(result.items).toEqual(DEFAULT_TESTIMONIALS_SECTION.items);
  });

  it('maps a post: trims text, company to context, name falls back to the decoded title', () => {
    const posts = [
      post(1, 'Ana K.', { quote: '  Great work.  ', name: ' ', company: ' Owner, Shop ', lang: 'de' }),
      post(2, 'Jo &amp; Co', { quote: 'Fine.' }),
    ];
    expect(transformTestimonials(home([1, 2]), posts).items).toEqual([
      { quote: 'Great work.', name: 'Ana K.', context: 'Owner, Shop', lang: 'de', logo: null, websiteUrl: '' },
      { quote: 'Fine.', name: 'Jo & Co', context: '', lang: 'en', logo: null, websiteUrl: '' },
    ]);
  });

  it('prefers the name field over the title and defaults lang to en', () => {
    const posts = [post(1, 'Title', { quote: 'a', name: 'Shown Name', lang: 'fr' }), post(2, 'T2', { quote: 'b', lang: 'DE' })];
    const items = transformTestimonials(home([1, 2]), posts).items;
    expect(items.map((item) => item.name)).toEqual(['Shown Name', 'T2']);
    expect(items.map((item) => item.lang)).toEqual(['en', 'de']);
  });

  it('never shows an "Anonymous client (...)" admin title as the public name', () => {
    const posts = [post(1, 'Anonymous client (website redesign)', { quote: 'a' })];
    const items = transformTestimonials(home([1]), posts).items;
    expect(items[0].name).toBe('');
  });

  it('maps an ACF logo array and an http(s) website, rejects other schemes', () => {
    const posts = [
      post(1, 'A', {
        quote: 'a',
        logo: { url: 'https://cms.example.com/wp-content/uploads/logo.png', alt: 'Acme', width: 240, height: 80 },
        website_url: ' https://acme.example ',
      }),
      post(2, 'B', { quote: 'b', logo: false, website_url: 'javascript:alert(1)' }),
    ];
    const items = transformTestimonials(home([1, 2]), posts).items;
    expect(items[0].logo).toEqual({
      url: 'https://cms.example.com/wp-content/uploads/logo.png',
      alt: 'Acme',
      width: 240,
      height: 80,
    });
    expect(items[0].websiteUrl).toBe('https://acme.example');
    expect(items[1].logo).toBeNull();
    expect(items[1].websiteUrl).toBe('');
  });

  it('reuses the bundled company, logo and website for a known client name', () => {
    const posts = [
      post(1, 'Leon Heuser', { quote: 'x' }),
      post(2, 'Chloé Kuhlow', { quote: 'y', name: 'Chloé Kuhlow', website_url: 'https://other.example' }),
      post(3, 'Someone E.', { quote: 'z' }),
      post(4, 'Leon Heuser', { quote: 'w', company: 'RF Labs' }),
    ];
    const items = transformTestimonials(home([1, 2, 3, 4]), posts).items;
    expect(items[0].logo?.url).toBe('/images/clients/reviewforest.svg');
    expect(items[0].websiteUrl).toBe('https://reviewforest.org/');
    expect(items[0].context).toBe('Managing Director, ReviewForest');
    expect(items[1].logo?.url).toBe('/images/clients/campzilla-wordmark.png');
    expect(items[1].websiteUrl).toBe('https://other.example');
    expect(items[2].logo).toBeNull();
    expect(items[2].context).toBe('');
    expect(items[3].context).toBe('RF Labs');
  });

  it('maps the button labels and falls back to Prev and Next when blank', () => {
    expect(
      transformTestimonials({ testimonials_section: { prev_label: 'Back', next_label: ' Forward ' } })
    ).toMatchObject({ prevLabel: 'Back', nextLabel: 'Forward' });
    expect(
      transformTestimonials({ testimonials_section: { prev_label: ' ', next_label: null } })
    ).toMatchObject({ prevLabel: 'Prev', nextLabel: 'Next' });
  });

  it('uses the default title when the title is blank', () => {
    const result = transformTestimonials({ testimonials_section: { section_title: '  ' } });
    expect(result.title).toBe(DEFAULT_TESTIMONIALS_SECTION.title);
  });
});

describe('selectedTestimonialIds', () => {
  it('reads IDs in order, accepts numeric strings and post objects, drops junk and duplicates', () => {
    expect(selectedTestimonialIds(home([5, '7', { ID: 9 }, { id: 11 }, 0, -1, 'x', null, 5]))).toEqual([5, 7, 9, 11]);
  });

  it('returns no IDs for a missing group, false or the old repeater', () => {
    expect(selectedTestimonialIds(undefined)).toEqual([]);
    expect(selectedTestimonialIds(home(false))).toEqual([]);
    expect(selectedTestimonialIds({ testimonials_section: { items: [{ quote: 'x' }] } })).toEqual([]);
  });
});
