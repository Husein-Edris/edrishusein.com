import { describe, it, expect } from 'vitest';
import { PORTRAIT_FALLBACK, resolvePortrait } from './portrait';

const image = (sourceUrl: string, altText = '', width = 800, height = 800) => ({
  node: { sourceUrl, altText, mediaDetails: { width, height } },
});

describe('resolvePortrait', () => {
  it('uses the first usable candidate in the given order', () => {
    const about = image('https://cms.example/about.png', 'Edris');
    const hero = image('https://cms.example/hero.jpeg');
    expect(resolvePortrait(about, hero)).toEqual({ src: about.node.sourceUrl, alt: 'Edris', width: 800, height: 800 });
  });

  it('falls through empty and SVG candidates to the next one', () => {
    const hero = image('https://cms.example/edris-husein.jpeg', '', 512, 512);
    expect(resolvePortrait(undefined, image('https://cms.example/Preview.svg'), hero)).toEqual({
      src: hero.node.sourceUrl,
      alt: PORTRAIT_FALLBACK.alt,
      width: 512,
      height: 512,
    });
  });

  it('returns the static portrait when nothing is set', () => {
    expect(resolvePortrait(null, undefined, image('  '))).toEqual(PORTRAIT_FALLBACK);
  });
});
