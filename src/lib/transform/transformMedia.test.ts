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

  it('returns null when the media is not an image (e.g. a PDF set as featured media)', () => {
    expect(
      transformMedia({
        source_url: 'https://cms.example.com/wp-content/uploads/doc.pdf',
        mime_type: 'application/pdf',
        media_type: 'file',
      })
    ).toBeNull();
  });

  it('rejects non-image URLs even when mime metadata is absent', () => {
    expect(
      transformMedia({ source_url: 'https://cms.example.com/wp-content/uploads/doc.pdf' })
    ).toBeNull();
  });

  it('keeps an image when media_type says image', () => {
    const result = transformMedia({
      source_url: 'https://cms.example.com/wp-content/uploads/c.jpg',
      media_type: 'image',
    });
    expect(result?.node.sourceUrl).toBe('https://cms.example.com/wp-content/uploads/c.jpg');
  });

  it('falls back to the JPEG preview when the featured media is a PDF', () => {
    const result = transformMedia({
      source_url: 'https://cms.example.com/wp-content/uploads/doc.pdf',
      mime_type: 'application/pdf',
      media_type: 'file',
      media_details: {
        sizes: {
          thumbnail: { source_url: 'https://cms.example.com/wp-content/uploads/doc-pdf-150x84.jpg', width: 150, height: 84, mime_type: 'image/jpeg' },
          large: { source_url: 'https://cms.example.com/wp-content/uploads/doc-pdf-1024x576.jpg', width: 1024, height: 576, mime_type: 'image/jpeg' },
          full: { source_url: 'https://cms.example.com/wp-content/uploads/doc-pdf.jpg', width: 1810, height: 1018, mime_type: 'image/jpeg' },
        },
      },
    });
    expect(result?.node.sourceUrl).toBe('https://cms.example.com/wp-content/uploads/doc-pdf-1024x576.jpg');
    expect(result?.node.mediaDetails).toEqual({ width: 1024, height: 576 });
  });

  it('falls back to a JPEG rendition for a HEIC upload (full size stays HEIC)', () => {
    const result = transformMedia({
      source_url: 'https://cms.example.com/wp-content/uploads/IMG.jpg',
      mime_type: 'image/heic',
      media_type: 'image',
      media_details: {
        sizes: {
          large: { source_url: 'https://cms.example.com/wp-content/uploads/IMG-1024x768.jpg', width: 1024, height: 768, mime_type: 'image/jpeg' },
          full: { source_url: 'https://cms.example.com/wp-content/uploads/IMG.jpg', width: 2560, height: 1920, mime_type: 'image/heic' },
        },
      },
    });
    expect(result?.node.sourceUrl).toBe('https://cms.example.com/wp-content/uploads/IMG-1024x768.jpg');
    expect(result?.node.mediaDetails.width).toBe(1024);
  });

  it('returns null for a PDF with no renderable sizes', () => {
    expect(
      transformMedia({
        source_url: 'https://cms.example.com/wp-content/uploads/doc.pdf',
        mime_type: 'application/pdf',
        media_details: { sizes: {} },
      })
    ).toBeNull();
  });
});
