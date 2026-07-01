import { describe, it, expect, vi, beforeEach } from 'vitest';
import { toSitemapEntries, fetchSitemapContent, latestModified } from './sitemap-content';

describe('toSitemapEntries', () => {
  const items = [
    { slug: 'first-post', modified: '2025-06-01T10:00:00', date: '2025-01-01T00:00:00' },
    { slug: 'second-post', date: '2025-02-02T00:00:00' },
  ];

  it('builds URLs under baseUrl/segment/slug', () => {
    const entries = toSitemapEntries(items, 'https://edrishusein.com', 'notebook', 'weekly', 0.7);
    expect(entries[0].url).toBe('https://edrishusein.com/notebook/first-post');
    expect(entries[1].url).toBe('https://edrishusein.com/notebook/second-post');
  });

  it('prefers modified date, falls back to date', () => {
    const entries = toSitemapEntries(items, 'https://x.com', 'projects', 'monthly', 0.8);
    expect(entries[0].lastModified).toEqual(new Date('2025-06-01T10:00:00'));
    expect(entries[1].lastModified).toEqual(new Date('2025-02-02T00:00:00'));
    expect(entries[0].changeFrequency).toBe('monthly');
    expect(entries[0].priority).toBe(0.8);
  });

  it('skips items without a slug', () => {
    const entries = toSitemapEntries([{ slug: '' }, { slug: 'ok' }], 'https://x.com', 'notebook', 'weekly', 0.7);
    expect(entries).toHaveLength(1);
    expect(entries[0].url).toBe('https://x.com/notebook/ok');
  });
});

describe('latestModified', () => {
  it('returns the newest modified date across items', () => {
    const items = [
      { slug: 'a', modified: '2025-01-10T00:00:00Z' },
      { slug: 'b', modified: '2025-06-30T00:00:00Z' },
      { slug: 'c', modified: '2025-03-15T00:00:00Z' },
    ];
    expect(latestModified(items)).toEqual(new Date('2025-06-30T00:00:00Z'));
  });

  it('falls back to date when modified is absent', () => {
    const items = [
      { slug: 'a', date: '2025-02-01T00:00:00Z' },
      { slug: 'b', modified: '2025-05-01T00:00:00Z', date: '2025-01-01T00:00:00Z' },
    ];
    expect(latestModified(items)).toEqual(new Date('2025-05-01T00:00:00Z'));
  });

  it('returns undefined when no item carries a usable date', () => {
    expect(latestModified([{ slug: 'a' }, { slug: 'b' }])).toBeUndefined();
    expect(latestModified([])).toBeUndefined();
  });

  it('ignores unparseable dates', () => {
    const items = [
      { slug: 'a', modified: 'not-a-date' },
      { slug: 'b', modified: '2025-04-04T00:00:00Z' },
    ];
    expect(latestModified(items)).toEqual(new Date('2025-04-04T00:00:00Z'));
  });
});

describe('fetchSitemapContent', () => {
  const mockFetch = vi.fn();
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  it('returns the array on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ slug: 'a' }]) });
    expect(await fetchSitemapContent('/posts')).toEqual([{ slug: 'a' }]);
  });

  it('returns [] on failure (so the sitemap still generates)', async () => {
    mockFetch.mockRejectedValueOnce(new Error('CMS down'));
    expect(await fetchSitemapContent('/posts')).toEqual([]);
  });

  it('returns [] when the response is not an array', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ error: 'x' }) });
    expect(await fetchSitemapContent('/posts')).toEqual([]);
  });
});
