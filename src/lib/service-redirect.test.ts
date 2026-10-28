import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  createServiceRedirects,
  SERVICE_SLUGS_FAILURE_RETRY_MS,
  SERVICE_SLUGS_REST_PATH,
  SERVICE_SLUGS_TTL_MS,
} from './service-redirect';
import { REST_BASE } from './config';

const slugs = [
  { slug: 'website-redesign', acf_fields: { slug_de: 'website-relaunch' } },
  { slug: 'headless-wordpress-nextjs', acf_fields: false },
];

const ok = (body: unknown) => ({ ok: true, status: 200, json: () => Promise.resolve(body) });
const status = (code: number) => ({ ok: false, status: code, json: () => Promise.resolve({}) });

let clock = 0;
const now = () => clock;
const mockFetch = vi.fn();

function lookup() {
  return createServiceRedirects({ fetch: mockFetch as unknown as typeof fetch, now });
}

beforeEach(() => {
  clock = 1_000_000;
  mockFetch.mockReset();
  vi.spyOn(console, 'error').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

describe('createServiceRedirects', () => {
  it('reads the slug pairs from the CMS REST service endpoint', async () => {
    mockFetch.mockResolvedValue(ok(slugs));

    await lookup()('/services/website-redesign');

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(mockFetch.mock.calls[0][0]).toBe(`${REST_BASE}${SERVICE_SLUGS_REST_PATH}`);
  });

  it('maps a crossed slug to the canonical path in both directions', async () => {
    mockFetch.mockResolvedValue(ok(slugs));
    const redirectFor = lookup();

    await expect(redirectFor('/de/services/website-redesign')).resolves.toBe('/de/services/website-relaunch');
    await expect(redirectFor('/services/website-relaunch')).resolves.toBe('/services/website-redesign');
  });

  it('returns null for canonical slugs, a service without a German slug and unknown slugs', async () => {
    mockFetch.mockResolvedValue(ok(slugs));
    const redirectFor = lookup();

    await expect(redirectFor('/services/website-redesign')).resolves.toBeNull();
    await expect(redirectFor('/de/services/website-relaunch')).resolves.toBeNull();
    await expect(redirectFor('/de/services/headless-wordpress-nextjs')).resolves.toBeNull();
    await expect(redirectFor('/services/nope')).resolves.toBeNull();
  });

  it('does not touch the CMS for paths outside /services/<slug>', async () => {
    const redirectFor = lookup();

    for (const path of ['/', '/de', '/services', '/de/services', '/projects/x', '/services/a/b', '/en/services/website-relaunch']) {
      await expect(redirectFor(path)).resolves.toBeNull();
    }
    expect(mockFetch).not.toHaveBeenCalled();
  });

  it('serves repeat lookups from memory within the 60 s TTL and refetches after it', async () => {
    mockFetch.mockResolvedValue(ok(slugs));
    const redirectFor = lookup();

    await redirectFor('/services/website-relaunch');
    clock += SERVICE_SLUGS_TTL_MS - 1;
    await redirectFor('/de/services/website-redesign');
    expect(mockFetch).toHaveBeenCalledTimes(1);

    clock += 1;
    await redirectFor('/services/website-relaunch');
    expect(mockFetch).toHaveBeenCalledTimes(2);
  });

  it('shares one CMS request between concurrent lookups', async () => {
    mockFetch.mockResolvedValue(ok(slugs));
    const redirectFor = lookup();

    await Promise.all([redirectFor('/services/website-relaunch'), redirectFor('/de/services/website-redesign')]);

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('fails open on a network error and logs once with context', async () => {
    mockFetch.mockRejectedValue(new Error('connect ECONNREFUSED'));
    const redirectFor = lookup();

    await expect(redirectFor('/services/website-relaunch')).resolves.toBeNull();
    clock += SERVICE_SLUGS_FAILURE_RETRY_MS;
    await expect(redirectFor('/services/website-relaunch')).resolves.toBeNull();

    expect(mockFetch).toHaveBeenCalledTimes(2);
    expect(console.error).toHaveBeenCalledTimes(1);
    expect(String(vi.mocked(console.error).mock.calls[0].join(' '))).toMatch(/service slug.*ECONNREFUSED/i);
  });

  it('fails open on a CMS 5xx and waits before asking again', async () => {
    mockFetch.mockResolvedValue(status(500));
    const redirectFor = lookup();

    await expect(redirectFor('/services/website-relaunch')).resolves.toBeNull();
    await expect(redirectFor('/services/website-relaunch')).resolves.toBeNull();

    expect(mockFetch).toHaveBeenCalledTimes(1);
  });

  it('logs again after a recovery and a new failure', async () => {
    const redirectFor = lookup();

    mockFetch.mockResolvedValueOnce(status(503));
    await redirectFor('/services/website-relaunch');
    clock += SERVICE_SLUGS_FAILURE_RETRY_MS;
    mockFetch.mockResolvedValueOnce(ok(slugs));
    await expect(redirectFor('/services/website-relaunch')).resolves.toBe('/services/website-redesign');
    clock += SERVICE_SLUGS_TTL_MS;
    mockFetch.mockResolvedValueOnce(status(503));
    await redirectFor('/services/website-relaunch');

    expect(console.error).toHaveBeenCalledTimes(2);
  });

  it('keeps the last good map when a refresh fails', async () => {
    const redirectFor = lookup();

    mockFetch.mockResolvedValueOnce(ok(slugs));
    await redirectFor('/services/website-relaunch');
    clock += SERVICE_SLUGS_TTL_MS;
    mockFetch.mockRejectedValueOnce(new Error('timeout'));

    await expect(redirectFor('/services/website-relaunch')).resolves.toBe('/services/website-redesign');
  });

  it('treats a 404 (post type not registered) as no services, cached for the TTL', async () => {
    mockFetch.mockResolvedValue(status(404));
    const redirectFor = lookup();

    await expect(redirectFor('/services/website-relaunch')).resolves.toBeNull();
    await expect(redirectFor('/services/website-relaunch')).resolves.toBeNull();

    expect(mockFetch).toHaveBeenCalledTimes(1);
    expect(console.error).not.toHaveBeenCalled();
  });
});
