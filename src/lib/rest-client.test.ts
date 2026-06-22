import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cmsRest } from './rest-client';
import { CMS_REVALIDATE } from './config';

const mockFetch = vi.fn();

describe('cmsRest', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  it('requests with ISR revalidate and not no-store', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve({ ok: 1 }) });

    await cmsRest('/pages?slug=home');

    const [, init] = mockFetch.mock.calls[0];
    expect(init.next).toEqual({ revalidate: CMS_REVALIDATE });
    expect(init.cache).toBeUndefined();
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('joins relative paths to REST_BASE and passes absolute URLs through', async () => {
    mockFetch.mockResolvedValue({ ok: true, json: () => Promise.resolve([]) });

    await cmsRest('/posts');
    expect(mockFetch.mock.calls[0][0]).toMatch(/\/wp-json\/wp\/v2\/posts$/);

    await cmsRest('https://example.com/custom');
    expect(mockFetch.mock.calls[1][0]).toBe('https://example.com/custom');
  });

  it('returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: () => Promise.resolve([{ id: 1 }]) });
    const data = await cmsRest<Array<{ id: number }>>('/project');
    expect(data).toEqual([{ id: 1 }]);
  });

  it('throws on a non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500, json: () => Promise.resolve({}) });
    await expect(cmsRest('/posts')).rejects.toThrow(/500/);
  });
});
