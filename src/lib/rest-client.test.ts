import { describe, it, expect, vi, beforeEach } from 'vitest';
import { cmsRest, CmsRequestError } from './rest-client';
import { CMS_REVALIDATE } from './config';

const mockFetch = vi.fn();

// Retries are exercised with a zero delay so the suite stays fast; production
// callers use the exponential default.
const noWait = { retryDelayMs: 0 };

const ok = (body: unknown) => ({ ok: true, status: 200, json: () => Promise.resolve(body) });
const fail = (status: number) => ({ ok: false, status, json: () => Promise.resolve({}) });

describe('cmsRest', () => {
  beforeEach(() => {
    mockFetch.mockReset();
    global.fetch = mockFetch as unknown as typeof fetch;
  });

  it('requests with ISR revalidate and not no-store', async () => {
    mockFetch.mockResolvedValueOnce(ok({ ok: 1 }));

    await cmsRest('/pages?slug=home');

    const [, init] = mockFetch.mock.calls[0];
    expect(init.next).toEqual({ revalidate: CMS_REVALIDATE });
    expect(init.cache).toBeUndefined();
    expect(init.signal).toBeInstanceOf(AbortSignal);
  });

  it('joins relative paths to REST_BASE and passes absolute URLs through', async () => {
    mockFetch.mockResolvedValue(ok([]));

    await cmsRest('/posts');
    expect(mockFetch.mock.calls[0][0]).toMatch(/\/wp-json\/wp\/v2\/posts$/);

    await cmsRest('https://example.com/custom');
    expect(mockFetch.mock.calls[1][0]).toBe('https://example.com/custom');
  });

  it('returns parsed JSON on success', async () => {
    mockFetch.mockResolvedValueOnce(ok([{ id: 1 }]));
    const data = await cmsRest<Array<{ id: number }>>('/project');
    expect(data).toEqual([{ id: 1 }]);
  });

  it('does not retry a successful response', async () => {
    mockFetch.mockResolvedValueOnce(ok([{ id: 1 }]));
    await cmsRest('/project', noWait);
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  describe('transient failures', () => {
    // The shared WordPress host answers a build-time burst with HTTP 500
    // "Database Error" for roughly half the requests. Without a retry these
    // surface as a missing page and get baked into the static output.
    it('retries a 5xx response and returns the eventual success', async () => {
      mockFetch.mockResolvedValueOnce(fail(500)).mockResolvedValueOnce(ok([{ id: 7 }]));

      const data = await cmsRest<Array<{ id: number }>>('/project?slug=x', noWait);

      expect(data).toEqual([{ id: 7 }]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('retries a rejected fetch (network error or timeout)', async () => {
      mockFetch
        .mockRejectedValueOnce(new DOMException('The operation timed out.', 'TimeoutError'))
        .mockResolvedValueOnce(ok([{ id: 8 }]));

      const data = await cmsRest<Array<{ id: number }>>('/posts?slug=y', noWait);

      expect(data).toEqual([{ id: 8 }]);
      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('retries a 429 rate-limit response', async () => {
      mockFetch.mockResolvedValueOnce(fail(429)).mockResolvedValueOnce(ok([]));

      await cmsRest('/posts', noWait);

      expect(mockFetch).toHaveBeenCalledTimes(2);
    });

    it('gives up after the configured number of retries', async () => {
      mockFetch.mockResolvedValue(fail(500));

      await expect(cmsRest('/posts', { ...noWait, retries: 2 })).rejects.toThrow(/500/);
      expect(mockFetch).toHaveBeenCalledTimes(3);
    });

    it('marks an exhausted transient failure as transient', async () => {
      mockFetch.mockResolvedValue(fail(503));

      const error = await cmsRest('/posts', noWait).catch((e: unknown) => e);

      expect(error).toBeInstanceOf(CmsRequestError);
      expect((error as CmsRequestError).isTransient).toBe(true);
      expect((error as CmsRequestError).status).toBe(503);
    });
  });

  describe('permanent failures', () => {
    it('does not retry a 4xx response', async () => {
      mockFetch.mockResolvedValue(fail(404));

      const error = await cmsRest('/posts?slug=missing', noWait).catch((e: unknown) => e);

      expect(mockFetch).toHaveBeenCalledTimes(1);
      expect(error).toBeInstanceOf(CmsRequestError);
      expect((error as CmsRequestError).isTransient).toBe(false);
      expect((error as CmsRequestError).status).toBe(404);
    });

    it('does not retry a 401 response', async () => {
      mockFetch.mockResolvedValue(fail(401));

      await expect(cmsRest('/posts', noWait)).rejects.toThrow(/401/);
      expect(mockFetch).toHaveBeenCalledTimes(1);
    });
  });

  it('stops retrying once the overall deadline is exceeded', async () => {
    mockFetch.mockResolvedValue(fail(500));

    // A zero-millisecond budget means no attempt after the first can start.
    await expect(cmsRest('/posts', { ...noWait, retries: 5, deadlineMs: 0 })).rejects.toThrow(
      /500/
    );
    expect(mockFetch).toHaveBeenCalledTimes(1);
  });
});
