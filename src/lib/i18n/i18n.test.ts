import { describe, it, expect } from 'vitest';
import {
  DATE_LOCALE,
  LANGS,
  OG_LOCALE,
  absoluteUrl,
  alternatesFor,
  hasTranslatedContent,
  isLang,
  localePath,
  localizeAcf,
  localizeRestItem,
  localizeSiteContent,
  stripLocale,
} from './index';

describe('isLang', () => {
  it('accepts the two site languages only', () => {
    expect(LANGS).toEqual(['en', 'de']);
    expect(isLang('en')).toBe(true);
    expect(isLang('de')).toBe(true);
    expect(isLang('fr')).toBe(false);
    expect(isLang('DE')).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });

  it('maps each language to its OG and date locale', () => {
    expect(OG_LOCALE).toEqual({ en: 'en_US', de: 'de_AT' });
    expect(DATE_LOCALE).toEqual({ en: 'en-US', de: 'de-AT' });
  });
});

describe('localePath', () => {
  it('leaves English paths unprefixed', () => {
    expect(localePath('/', 'en')).toBe('/');
    expect(localePath('/about', 'en')).toBe('/about');
  });

  it('prefixes German paths with /de', () => {
    expect(localePath('/', 'de')).toBe('/de');
    expect(localePath('/about', 'de')).toBe('/de/about');
    expect(localePath('/projects/some-slug', 'de')).toBe('/de/projects/some-slug');
  });

  it('keeps the query string and hash', () => {
    expect(localePath('/notebook#top', 'de')).toBe('/de/notebook#top');
    expect(localePath('/?q=1', 'de')).toBe('/de?q=1');
  });

  it('never double-prefixes and converts between languages', () => {
    expect(localePath('/de/about', 'de')).toBe('/de/about');
    expect(localePath('/de', 'de')).toBe('/de');
    expect(localePath('/de/about', 'en')).toBe('/about');
    expect(localePath('/de', 'en')).toBe('/');
    expect(localePath('/en/about', 'de')).toBe('/de/about');
  });

  it('leaves external, mailto, anchor and protocol-relative links alone', () => {
    expect(localePath('https://example.com/about', 'de')).toBe('https://example.com/about');
    expect(localePath('mailto:kontakt@edrishusein.com', 'de')).toBe('mailto:kontakt@edrishusein.com');
    expect(localePath('#main', 'de')).toBe('#main');
    expect(localePath('//cdn.example.com/x', 'de')).toBe('//cdn.example.com/x');
    expect(localePath('', 'de')).toBe('');
  });
});

describe('stripLocale', () => {
  it('splits a public or internal path into language and English path', () => {
    expect(stripLocale('/')).toEqual({ lang: 'en', path: '/' });
    expect(stripLocale('/about')).toEqual({ lang: 'en', path: '/about' });
    expect(stripLocale('/de')).toEqual({ lang: 'de', path: '/' });
    expect(stripLocale('/de/notebook/x')).toEqual({ lang: 'de', path: '/notebook/x' });
    expect(stripLocale('/en/about')).toEqual({ lang: 'en', path: '/about' });
    expect(stripLocale('/en')).toEqual({ lang: 'en', path: '/' });
  });

  it('does not mistake a path that only starts with "de" for German', () => {
    expect(stripLocale('/denver')).toEqual({ lang: 'en', path: '/denver' });
    expect(stripLocale('/english')).toEqual({ lang: 'en', path: '/english' });
  });

  it('treats an empty or missing path as the homepage', () => {
    expect(stripLocale('')).toEqual({ lang: 'en', path: '/' });
    expect(stripLocale(null)).toEqual({ lang: 'en', path: '/' });
  });
});

describe('alternatesFor', () => {
  it('names both languages and x-default (English) with a per-language canonical', () => {
    expect(alternatesFor('/about', 'en')).toEqual({
      canonical: '/about',
      languages: { en: '/about', de: '/de/about', 'x-default': '/about' },
    });
    expect(alternatesFor('/about', 'de')).toEqual({
      canonical: '/de/about',
      languages: { en: '/about', de: '/de/about', 'x-default': '/about' },
    });
  });

  it('pairs the homepage with /de', () => {
    expect(alternatesFor('/', 'de')).toEqual({
      canonical: '/de',
      languages: { en: '/', de: '/de', 'x-default': '/' },
    });
  });

  it('accepts an already prefixed path', () => {
    expect(alternatesFor('/de/projects/x', 'en').canonical).toBe('/projects/x');
  });

  it('defaults to English', () => {
    expect(alternatesFor('/contact').canonical).toBe('/contact');
  });
});

describe('absoluteUrl', () => {
  it('builds the public URL of a page in a language', () => {
    expect(absoluteUrl('/', 'en')).toBe('https://edrishusein.com');
    expect(absoluteUrl('/', 'de')).toBe('https://edrishusein.com/de');
    expect(absoluteUrl('/about', 'de')).toBe('https://edrishusein.com/de/about');
    expect(absoluteUrl('/about', 'en')).toBe('https://edrishusein.com/about');
  });
});

describe('localizeAcf', () => {
  it('replaces each field with its non-empty _de sibling, in groups and repeater rows', () => {
    const acf = {
      hero: { hero_title: 'Hello', hero_title_de: 'Hallo', hero_copy: 'Copy', hero_copy_de: '' },
      experience_items: [
        { position: 'Developer', position_de: 'Entwickler', duration: '2020' },
        { position: 'Lead', position_de: '   ' },
      ],
      image: { url: 'https://x/y.png', alt: '' },
      count: 3,
      flag: false,
    };

    const result = localizeAcf(acf);

    expect(result.hero.hero_title).toBe('Hallo');
    expect(result.hero.hero_copy).toBe('Copy');
    expect(result.experience_items[0].position).toBe('Entwickler');
    expect(result.experience_items[0].duration).toBe('2020');
    expect(result.experience_items[1].position).toBe('Lead');
    expect(result.image).toEqual({ url: 'https://x/y.png', alt: '' });
    expect(result.count).toBe(3);
    expect(result.flag).toBe(false);
  });

  it('does not mutate the input', () => {
    const acf = { title: 'A', title_de: 'B', nested: { label: 'C', label_de: 'D' } };
    const copy = JSON.parse(JSON.stringify(acf));
    localizeAcf(acf);
    expect(acf).toEqual(copy);
  });

  it('only replaces fields that exist, so title_de at the top does not add a title key', () => {
    const result = localizeAcf({ title_de: 'Titel', reading_time: '5' }) as Record<string, unknown>;
    expect('title' in result).toBe(false);
  });

  it('passes through non-objects and the empty-array ACF shape', () => {
    expect(localizeAcf([])).toEqual([]);
    expect(localizeAcf(null)).toBeNull();
    expect(localizeAcf(false)).toBe(false);
    expect(localizeAcf('text')).toBe('text');
  });
});

describe('localizeRestItem', () => {
  const post = {
    id: 1,
    slug: 'hello',
    title: { rendered: 'Hello &amp; welcome' },
    excerpt: { rendered: '<p>English excerpt</p>' },
    content: { rendered: '<p>English body</p>' },
    acf_fields: {
      title_de: 'Hallo und willkommen',
      excerpt_de: 'Deutscher Auszug',
      content_de: '<p>Deutscher Text</p>',
      conclusion_section: { conclusion_title: 'Summary', conclusion_title_de: 'Zusammenfassung' },
    },
  };

  it('returns the item unchanged for English', () => {
    expect(localizeRestItem(post, 'en')).toBe(post);
  });

  it('swaps title, excerpt, content and ACF text for German', () => {
    const result = localizeRestItem(post, 'de');
    expect(result.title.rendered).toBe('Hallo und willkommen');
    expect(result.excerpt.rendered).toBe('Deutscher Auszug');
    expect(result.content.rendered).toBe('<p>Deutscher Text</p>');
    expect(result.acf_fields.conclusion_section.conclusion_title).toBe('Zusammenfassung');
    expect(result.slug).toBe('hello');
  });

  it('keeps the English core field when its _de value is empty or missing', () => {
    const result = localizeRestItem(
      { ...post, acf_fields: { title_de: '', excerpt_de: null } },
      'de'
    );
    expect(result.title.rendered).toBe('Hello &amp; welcome');
    expect(result.excerpt.rendered).toBe('<p>English excerpt</p>');
    expect(result.content.rendered).toBe('<p>English body</p>');
  });

  it('handles string core fields and items without acf_fields', () => {
    const plain = { title: 'T', acf_fields: { title_de: 'D' } };
    expect(localizeRestItem(plain, 'de').title).toBe('D');
    const bare = { id: 2, title: { rendered: 'X' } };
    expect(localizeRestItem(bare, 'de')).toEqual(bare);
    const emptyAcf = { id: 3, title: { rendered: 'X' }, acf_fields: [] };
    expect(localizeRestItem(emptyAcf, 'de')).toEqual(emptyAcf);
  });

  it('also localizes the standard acf key', () => {
    const result = localizeRestItem({ acf: { author_bio_override: 'Bio', author_bio_override_de: 'Biografie' } }, 'de');
    expect(result.acf.author_bio_override).toBe('Biografie');
  });

  it('does not mutate the input', () => {
    const copy = JSON.parse(JSON.stringify(post));
    localizeRestItem(post, 'de');
    expect(post).toEqual(copy);
  });

  it('returns non-objects unchanged', () => {
    expect(localizeRestItem(null, 'de')).toBeNull();
  });
});

describe('hasTranslatedContent', () => {
  it('is true when the item carries a non-empty content_de', () => {
    expect(hasTranslatedContent({ acf_fields: { content_de: '<p>Text</p>' } })).toBe(true);
    expect(hasTranslatedContent({ acf_fields: { content_de: ' ' } })).toBe(false);
    expect(hasTranslatedContent({ acf_fields: [] })).toBe(false);
    expect(hasTranslatedContent({})).toBe(false);
    expect(hasTranslatedContent(null)).toBe(false);
  });
});

describe('localizeSiteContent', () => {
  const raw = {
    nav_about: 'About',
    nav_about_de: 'Über mich',
    footer_imprint_label: 'Imprint',
    footer_imprint_label_de: '',
    meta_home_title: '',
    meta_home_title_de: 'Startseite',
  };

  it('returns the object unchanged for English', () => {
    expect(localizeSiteContent(raw, 'en')).toBe(raw);
  });

  it('uses each non-empty _de value and falls back to the English value', () => {
    const result = localizeSiteContent(raw, 'de');
    expect(result.nav_about).toBe('Über mich');
    expect(result.footer_imprint_label).toBe('Imprint');
    expect(result.meta_home_title).toBe('Startseite');
  });

  it('fills a key that only exists as _de', () => {
    expect(localizeSiteContent({ skip_to_content_de: 'Zum Inhalt' }, 'de').skip_to_content).toBe('Zum Inhalt');
  });

  it('treats a non-object response as empty', () => {
    expect(localizeSiteContent(null, 'de')).toEqual({});
    expect(localizeSiteContent([], 'de')).toEqual({});
  });
});
