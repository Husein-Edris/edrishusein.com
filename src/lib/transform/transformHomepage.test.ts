import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { transformHomepage } from './transformHomepage';

const homeFixture = JSON.parse(
  readFileSync(resolve(__dirname, '__fixtures__/home.json'), 'utf-8'),
)[0];

describe('transformHomepage', () => {
  const result = transformHomepage(homeFixture);

  it('keeps the constant name as hero title (the visible H1 is `heading`)', () => {
    expect(result.heroSection?.title).toBe('Edris Husein');
  });

  it('reads hero copy and the hero image from the CMS', () => {
    expect(result.heroSection?.heroCopy).toContain('web developer');
    // The fixture still holds the old Preview.svg; resolvePortrait() skips it.
    expect(result.heroSection?.heroImage?.node.sourceUrl).toContain('Preview.svg');
  });

  it('maps about / bookshelf / techstack / notebook / contact groups', () => {
    expect(result.aboutSection?.title).toBe('About me');
    expect(result.aboutSection?.aboutMeText).toContain('Edris Husein');
    expect(result.bookshelfSection?.title).toBe('BOOKSHELF');
    expect(result.bookshelfSection?.featuredImage?.node.sourceUrl).toContain('books-bg');
    expect(result.techstackSection?.featuredImage).toBeDefined();
    expect(result.notebookSection?.title).toBe('NOTEBOOK');
    expect(result.contactSection?.email).toBe('kontakt@edrishusein.com');
  });

  it('maps the hero copy and project label ACF fields', () => {
    const page = {
      acf_fields: {
        hero_section: {
          hero_eyebrow: 'Eyebrow',
          hero_title: 'Heading',
          hero_primary_cta_label: 'Email me',
          hero_primary_cta_url: 'mailto:a@b.c',
          hero_secondary_cta_label: 'See projects',
          hero_secondary_cta_url: '/projects',
        },
        projects_section: {
          title: 'Projects',
          view_all_label: 'All work',
          view_all_url: '/work',
        },
      },
    };
    const mapped = transformHomepage(page);
    expect(mapped.heroSection).toMatchObject({
      eyebrow: 'Eyebrow',
      heading: 'Heading',
      primaryCtaLabel: 'Email me',
      primaryCtaUrl: 'mailto:a@b.c',
      secondaryCtaLabel: 'See projects',
      secondaryCtaUrl: '/projects',
    });
    expect(mapped.projectsSection).toEqual({
      title: 'Projects',
      viewAllLabel: 'All work',
      viewAllUrl: '/work',
    });
  });

  it('leaves new copy fields empty when the CMS has not saved them yet', () => {
    // The live home page predates these fields, so get_fields() omits them.
    expect(result.heroSection?.heading).toBe('');
    expect(result.heroSection?.primaryCtaUrl).toBe('');
    expect(result.projectsSection?.viewAllLabel).toBe('');
    expect(result.notebookSection?.viewAllLabel).toBe('');
    expect(result.aboutSection?.learnMoreLabel).toBe('');
  });

  it('maps the notebook view-all link and the about button', () => {
    const mapped = transformHomepage({
      acf_fields: {
        about_me_section: { title: 'About', learn_more_label: 'More about me', learn_more_url: '/me' },
        notebook_section: { title: 'NOTES', view_all_label: 'ALL NOTES', view_all_url: '/notes' },
      },
    });
    expect(mapped.aboutSection).toMatchObject({ learnMoreLabel: 'More about me', learnMoreUrl: '/me' });
    expect(mapped.notebookSection).toEqual({ title: 'NOTES', viewAllLabel: 'ALL NOTES', viewAllUrl: '/notes' });
  });

  it('maps the services section group, empty while the CMS has no such fields', () => {
    expect(result.servicesSection).toEqual({ title: '', text: '' });
    const mapped = transformHomepage({
      acf_fields: { services_section: { title: 'Services', text: 'What I build and look after.' } },
    });
    expect(mapped.servicesSection).toEqual({ title: 'Services', text: 'What I build and look after.' });
  });

  it('falls back to light defaults when acf_fields is absent', () => {
    const empty = transformHomepage({});
    expect(empty.heroSection?.title).toBe('Edris Husein');
    expect(empty.notebookSection?.title).toBe('NOTEBOOK');
    expect(empty.heroSection?.heroImage).toBeUndefined();
  });
});
