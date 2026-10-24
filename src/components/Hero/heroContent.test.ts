import { describe, it, expect } from 'vitest';
import { HERO_DEFAULTS, isInternalPath, resolveHeroContent } from './heroContent';

describe('resolveHeroContent', () => {
  it('renders the code defaults when no CMS data exists', () => {
    expect(resolveHeroContent(undefined)).toEqual({
      eyebrow: 'Edris Husein, Dornbirn, Austria',
      heading: 'Servus. I build websites, fix them and help you plan what comes next.',
      primaryCta: { label: 'Email me', url: 'mailto:kontakt@edrishusein.com' },
      secondaryCta: { label: 'See all projects', url: '/projects' },
    });
  });

  it('falls back per field when ACF returns empty strings', () => {
    const result = resolveHeroContent({ eyebrow: '', heading: 'Custom heading', primaryCtaUrl: '  ' });
    expect(result.eyebrow).toBe(HERO_DEFAULTS.eyebrow);
    expect(result.heading).toBe('Custom heading');
    expect(result.primaryCta.url).toBe(HERO_DEFAULTS.primaryCtaUrl);
  });

  it('uses every filled CMS field', () => {
    const result = resolveHeroContent({
      eyebrow: 'Eyebrow',
      heading: 'Heading',
      primaryCtaLabel: 'Book a call',
      primaryCtaUrl: 'https://cal.com/edris',
      secondaryCtaLabel: 'Read the notebook',
      secondaryCtaUrl: '/notebook',
    });
    expect(result).toEqual({
      eyebrow: 'Eyebrow',
      heading: 'Heading',
      primaryCta: { label: 'Book a call', url: 'https://cal.com/edris' },
      secondaryCta: { label: 'Read the notebook', url: '/notebook' },
    });
  });
});

describe('resolveHeroContent on German pages', () => {
  it('renders German defaults and links site paths to the German pages', () => {
    expect(resolveHeroContent(undefined, 'de')).toEqual({
      eyebrow: 'Edris Husein, Dornbirn, Österreich',
      heading: 'Servus. Ich baue Websites, repariere sie und helfe Ihnen zu planen, was als Nächstes kommt.',
      primaryCta: { label: 'E-Mail schreiben', url: 'mailto:kontakt@edrishusein.com' },
      secondaryCta: { label: 'Alle Projekte ansehen', url: '/de/projects' },
    });
  });

  it('localizes CMS site paths and leaves external links alone', () => {
    const result = resolveHeroContent(
      { heading: 'Überschrift', primaryCtaUrl: 'https://cal.com/edris', secondaryCtaUrl: '/notebook' },
      'de'
    );
    expect(result.heading).toBe('Überschrift');
    expect(result.primaryCta.url).toBe('https://cal.com/edris');
    expect(result.secondaryCta.url).toBe('/de/notebook');
  });
});

describe('isInternalPath', () => {
  it('treats site paths as internal and everything else as external', () => {
    expect(isInternalPath('/projects')).toBe(true);
    expect(isInternalPath('//evil.example')).toBe(false);
    expect(isInternalPath('mailto:kontakt@edrishusein.com')).toBe(false);
    expect(isInternalPath('https://edrishusein.com')).toBe(false);
  });
});
