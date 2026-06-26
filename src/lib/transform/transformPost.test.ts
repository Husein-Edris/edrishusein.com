import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { transformPostListItem, transformPostDetail, calculateReadingTime } from './transformPost';

const posts = JSON.parse(
  readFileSync(resolve(__dirname, '__fixtures__/posts.json'), 'utf-8'),
);
const post = posts[0];

describe('calculateReadingTime', () => {
  it('estimates minutes from word count, min 1', () => {
    expect(calculateReadingTime('<p>one two three</p>')).toBe('1 min read');
    expect(calculateReadingTime('word '.repeat(600))).toBe('3 min read');
  });
});

describe('transformPostListItem', () => {
  const item = transformPostListItem(post);

  it('maps title/slug/date/excerpt and featured image', () => {
    expect(item.title.length).toBeGreaterThan(0);
    expect(item.slug).toBe(post.slug);
    expect(item.date).toBe(post.date);
    expect(item.readingTime).toMatch(/min read|^\d/);
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

  it('uses ACF reading_time formatted as "N min read"', () => {
    expect(detail.readingTime).toBe(`${post.acf.reading_time} min read`);
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
