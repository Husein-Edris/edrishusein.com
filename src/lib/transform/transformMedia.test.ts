import { describe, it, expect } from 'vitest';
import { transformMedia } from './transformMedia';

describe('transformMedia', () => {
  it('transforms an ACF image object (flat url/alt/width/height)', () => {
    const result = transformMedia({
      url: 'https://cms.example.com/wp-content/uploads/a.png',
      alt: 'Alt text',
      width: 429,
      height: 430,
    });

    expect(result).toEqual({
      node: {
        sourceUrl: 'https://cms.example.com/wp-content/uploads/a.png',
        altText: 'Alt text',
        mediaDetails: { width: 429, height: 430 },
      },
    });
  });

  it('transforms an embedded media object (source_url/alt_text/media_details)', () => {
    const result = transformMedia({
      source_url: 'https://cms.example.com/wp-content/uploads/b.png',
      alt_text: 'Embedded',
      media_details: { width: 800, height: 600 },
    });

    expect(result?.node.sourceUrl).toBe('https://cms.example.com/wp-content/uploads/b.png');
    expect(result?.node.altText).toBe('Embedded');
    expect(result?.node.mediaDetails).toEqual({ width: 800, height: 600 });
  });

  it('defaults missing alt and dimensions', () => {
    const result = transformMedia({ url: 'https://x/y.png' });
    expect(result?.node.altText).toBe('');
    expect(result?.node.mediaDetails).toEqual({ width: 0, height: 0 });
  });

  it('returns null for null/undefined or image without a URL', () => {
    expect(transformMedia(null)).toBeNull();
    expect(transformMedia(undefined)).toBeNull();
    expect(transformMedia({ alt: 'no url' })).toBeNull();
  });
});
