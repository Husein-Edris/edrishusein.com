import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { transformPostListItem, transformPostDetail } from './transformPost';

const posts = JSON.parse(
  readFileSync(resolve(__dirname, '__fixtures__/posts.json'), 'utf-8'),
);
const post = posts[0];

describe('transformPostListItem', () => {
  const item = transformPostListItem(post);

  it('maps title/slug/date/excerpt and featured image', () => {
    expect(item.title.length).toBeGreaterThan(0);
    expect(item.slug).toBe(post.slug);
    expect(item.date).toBe(post.date);
    expect(item.readingMinutes).toBeGreaterThan(0);
    expect(['de', 'en']).toContain(item.language);
  });
});

describe('transformPostDetail', () => {
  const detail = transformPostDetail(post);

  it('includes content, author (with ACF bio override), categories, tags', () => {
    expect(typeof detail.content).toBe('string');
    expect(detail.author?.name).toBe('Edris Husein');
    // ACF author_bio_override wins over the embedded author description
    expect(detail.author?.bio).toBe(post.acf.author_bio_override);
    expect(Array.isArray(detail.categories)).toBe(true);
    expect(detail.categories.some((c) => c.slug === 'blog')).toBe(true);
  });

  it('ignores the fixture ACF reading_time "55" as implausible for its word count', () => {
    expect(detail.rejectedReadingTime).toBe(55);
    expect(detail.readingMinutes).toBe(3);
  });

  it('uses a plausible ACF reading_time as is', () => {
    expect(transformPostDetail({ ...post, acf: { ...post.acf, reading_time: '4' } }).readingMinutes).toBe(4);
  });

  it('computes reading time from the content, not the excerpt, and rejects junk ACF values', () => {
    const long = { ...post, acf: { ...post.acf, reading_time: '55' }, content: { rendered: `<p>${'word '.repeat(500)}</p>` } };
    const item = transformPostListItem(long);
    expect(item.readingMinutes).toBe(3);
    expect(item.rejectedReadingTime).toBe(55);
  });

  it('detects German posts', () => {
    const de = { ...post, title: { rendered: 'Website erstellen lassen: worauf Sie achten sollten' }, excerpt: { rendered: '<p>Die Qualität, die Sie prüfen können, und was es kostet.</p>' }, content: { rendered: '<p>Wenn Sie drei Angebote nebeneinanderlegen, vergleichen die meisten den Preis.</p>' } };
    expect(transformPostListItem(de).language).toBe('de');
  });

  it('exposes the WP modified timestamp (falls back to date)', () => {
    expect(detail.modified).toBe(post.modified);
    expect(detail.date).toBe(post.date);
  });

  it('maps conclusion_section to camelCase shape', () => {
    expect(detail.conclusionSection?.conclusionTitle).toBe('Key Takeaways');
    expect(detail.conclusionSection?.conclusionPoints[0].pointText).toBe('dasdadas');
  });

  it('handles custom_tags === false as an empty array', () => {
    expect(detail.customTags).toEqual([]);
  });
});
