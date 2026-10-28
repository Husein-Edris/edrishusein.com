import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { transformService, type RestService } from './transformService';

const fixture: RestService = JSON.parse(
  readFileSync(resolve(__dirname, '__fixtures__/service.json'), 'utf-8'),
);

describe('transformService (English)', () => {
  const service = transformService(fixture, 'en');

  it('maps the core fields and both slugs', () => {
    expect(service.id).toBe('412');
    expect(service.slug).toBe('website-redesign');
    expect(service.slugDe).toBe('website-relaunch');
    expect(service.title).toBe('Website redesign');
    expect(service.headline).toBe('Website redesign without starting from zero');
    expect(service.eyebrow).toBe('Services');
    expect(service.seoTitle).toBe('Website Redesign and Relaunch | Edris Husein');
    expect(service.seoDescription).toMatch(/^Redesign or relaunch/);
    expect(service.serviceType).toBe('Website redesign');
    expect(service.modified).toBe('2026-10-28T10:00:00');
  });

  it('keeps the intro and excerpt as HTML with English links', () => {
    expect(service.introHtml).toContain('href="/services/wordpress-maintenance"');
    expect(service.excerpt).toContain('Redesign an outdated website');
  });

  it('maps sections, FAQ, relations and the served areas', () => {
    expect(service.sections).toHaveLength(2);
    expect(service.sections[0]).toEqual({
      heading: 'Redesign or rebuild?',
      bodyHtml: expect.stringContaining('Not every outdated site'),
    });
    expect(service.faq).toEqual([
      { question: 'Will a redesign hurt my SEO?', answerHtml: expect.stringContaining('Not if every old URL') },
    ]);
    expect(service.relatedProjectIds).toEqual([101, 102]);
    expect(service.relatedPostIds).toEqual([201]);
    expect(service.areaServed).toEqual(['vorarlberg', 'austria']);
  });

  it('maps the per-service call to action', () => {
    expect(service.cta).toEqual({
      heading: 'Planning a redesign?',
      text: 'Tell me which site it is and what bothers you about it. Replies within a day.',
      label: 'Start a project',
    });
  });
});

describe('transformService (German)', () => {
  const service = transformService(fixture, 'de');

  it('uses the _de twins for title, headline, SEO and type', () => {
    expect(service.title).toBe('Website-Relaunch');
    expect(service.headline).toBe('Website-Relaunch in Vorarlberg');
    expect(service.eyebrow).toBe('Leistungen');
    expect(service.seoTitle).toBe('Website-Relaunch in Vorarlberg | Edris Husein');
    expect(service.seoDescription).toMatch(/^Relaunch für veraltete Websites/);
    expect(service.serviceType).toBe('Website-Relaunch');
    expect(service.excerpt).toContain('Relaunch für veraltete Websites');
  });

  it('keeps both slugs identical to the English view model', () => {
    expect(service.slug).toBe('website-redesign');
    expect(service.slugDe).toBe('website-relaunch');
  });

  it('uses German sections and FAQ, falling back to English for an empty twin', () => {
    expect(service.sections[0].heading).toBe('Wann sich ein Relaunch lohnt, und wann Überarbeiten reicht');
    expect(service.sections[1].heading).toBe('Keeping your rankings');
    expect(service.sections[1].bodyHtml).toContain('Redirects are planned');
    expect(service.faq[0].question).toBe('Verliere ich bei einem Relaunch mein Google-Ranking?');
  });

  it('uses the German call to action, falling back to English for an empty twin', () => {
    expect(service.cta.heading).toBe('Relaunch geplant?');
    expect(service.cta.text).toMatch(/^Schreiben Sie mir/);
    expect(service.cta.label).toBe('Start a project');
  });

  it('points site links in the German intro and section bodies at /de', () => {
    expect(service.introHtml).toContain('href="/de/services/wordpress-maintenance"');
    expect(service.sections[0].bodyHtml).toContain('href="/de/projects/illwerke-vkw-website-relaunch"');
  });
});

describe('transformService with empty ACF fields', () => {
  const empty: RestService = {
    id: 9,
    slug: 'wordpress-maintenance',
    title: { rendered: 'WordPress maintenance &#8217;24' },
    excerpt: { rendered: '' },
    content: { rendered: '' },
    acf_fields: {
      headline: '',
      sections: false,
      faq: false,
      related_projects: false,
      related_posts: false,
      area_served: false,
      slug_de: '',
    },
  };

  it('turns repeaters and relations serialized as false into empty arrays', () => {
    const service = transformService(empty, 'en');
    expect(service.sections).toEqual([]);
    expect(service.faq).toEqual([]);
    expect(service.relatedProjectIds).toEqual([]);
    expect(service.relatedPostIds).toEqual([]);
    expect(service.areaServed).toEqual([]);
  });

  it('leaves the call to action empty when its fields are missing', () => {
    expect(transformService(empty, 'en').cta).toEqual({ heading: '', text: '', label: '' });
  });

  it('decodes the title and falls back to it for an empty headline', () => {
    const service = transformService(empty, 'en');
    expect(service.title).toBe('WordPress maintenance ’24');
    expect(service.headline).toBe(service.title);
  });

  it('falls back to the English slug when slug_de is empty or invalid', () => {
    expect(transformService(empty, 'de').slugDe).toBe('wordpress-maintenance');
    const invalid = { ...empty, acf_fields: { ...empty.acf_fields, slug_de: 'Wartung und Pflege' } };
    expect(transformService(invalid, 'de').slugDe).toBe('wordpress-maintenance');
  });

  it('survives a missing acf_fields object', () => {
    const service = transformService({ id: 1, slug: 'x' }, 'de');
    expect(service.slugDe).toBe('x');
    expect(service.sections).toEqual([]);
  });

  it('drops FAQ rows without a question or answer and unknown areas', () => {
    const service = transformService(
      {
        id: 2,
        slug: 'y',
        acf_fields: {
          faq: [{ question: 'Q?', answer: '' }, { question: 'Real?', answer: '<p>Yes.</p>' }],
          area_served: ['austria', 'mars', { value: 'germany', label: 'Germany' }],
          related_projects: [5, { ID: 6 }, 'nope'],
        },
      },
      'en',
    );
    expect(service.faq).toEqual([{ question: 'Real?', answerHtml: '<p>Yes.</p>' }]);
    expect(service.areaServed).toEqual(['austria', 'germany']);
    expect(service.relatedProjectIds).toEqual([5, 6]);
  });
});
