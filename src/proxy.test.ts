// @vitest-environment node
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { NextRequest } from 'next/server';
import { proxy } from '@/proxy';

const slugs = [{ slug: 'website-redesign', acf_fields: { slug_de: 'website-relaunch' } }];

const mockFetch = vi.fn();

function request(path: string, headers: Record<string, string> = {}) {
  return new NextRequest(`http://localhost:3000${path}`, {
    headers: { host: 'edrishusein.com', 'x-forwarded-proto': 'https', ...headers },
  });
}

beforeEach(() => {
  mockFetch.mockReset();
  mockFetch.mockResolvedValue({ ok: true, status: 200, json: () => Promise.resolve(slugs) });
  global.fetch = mockFetch as unknown as typeof fetch;
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('proxy: crossed service slugs', () => {
  it('308s the English slug under /de to the German canonical path', async () => {
    const res = await proxy(request('/de/services/website-redesign'));

    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('https://edrishusein.com/de/services/website-relaunch');
  });

  it('308s the German slug on the English site to the English canonical path', async () => {
    const res = await proxy(request('/services/website-relaunch'));

    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('https://edrishusein.com/services/website-redesign');
  });

  it('keeps the query string', async () => {
    const res = await proxy(request('/services/website-relaunch?utm_source=x&b=2'));

    expect(res.headers.get('location')).toBe('https://edrishusein.com/services/website-redesign?utm_source=x&b=2');
  });

  it('passes canonical German slugs through', async () => {
    const res = await proxy(request('/de/services/website-relaunch'));

    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });

  it('rewrites canonical and unknown English slugs to /en as before', async () => {
    for (const path of ['/services/website-redesign', '/services/nope']) {
      const res = await proxy(request(path));

      expect(res.headers.get('location')).toBeNull();
      expect(res.headers.get('x-middleware-rewrite')).toBe(`http://localhost:3000/en${path}`);
    }
  });

  it('fails open when the CMS cannot be reached', async () => {
    vi.resetModules();
    vi.spyOn(console, 'error').mockImplementation(() => {});
    mockFetch.mockRejectedValue(new Error('connect ECONNREFUSED'));
    const { proxy: freshProxy } = await import('@/proxy');

    const res = await freshProxy(request('/services/website-relaunch'));

    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-rewrite')).toBe('http://localhost:3000/en/services/website-relaunch');
  });
});

describe('proxy: existing behavior', () => {
  it('sends www to the apex with a 301 before any service lookup', async () => {
    const res = await proxy(request('/services/website-relaunch', { host: 'www.edrishusein.com' }));

    expect(res.status).toBe(301);
    expect(res.headers.get('location')).toBe('https://edrishusein.com/services/website-relaunch');
  });

  it('308s a public /en URL to the unprefixed one', async () => {
    const res = await proxy(request('/en/about?x=1'));

    expect(res.status).toBe(308);
    expect(res.headers.get('location')).toBe('https://edrishusein.com/about?x=1');
  });

  it('passes the internal /en rewrite through', async () => {
    const res = await proxy(request('/en/services/website-relaunch', { 'x-lang-rewrite': '1' }));

    expect(res.headers.get('location')).toBeNull();
    expect(res.headers.get('x-middleware-next')).toBe('1');
  });
});
