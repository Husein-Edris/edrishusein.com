import { REST_BASE } from './config';
import { resolveServiceSlug } from './services';
import { transformService, type RestService, type Service } from './transform/transformService';
import type { Lang } from './i18n/lang';

// Crossed service slugs for the proxy: /de/services/<English slug> and
// /services/<German slug> 308 to the canonical URL of the requested language.
// The page itself never redirects: an ISR render that redirects is cached, and
// one such cache entry was measured as a 308 without a Location header that
// every later hit replayed. The proxy runs before the cache, so nothing
// redirect-shaped is ever stored.

const SERVICE_PATH = /^\/(de\/)?services\/([^/]+)$/;

// Only the two slugs per service. slug_de is a nested ACF key under the theme's
// acf_fields REST field.
export const SERVICE_SLUGS_REST_PATH = '/service?per_page=100&_fields=slug,acf_fields.slug_de';

/** How long a fetched slug map is reused (same window as the ISR pages). */
export const SERVICE_SLUGS_TTL_MS = 60_000;

/** After a failed fetch, requests pass through for this long before the next try. */
export const SERVICE_SLUGS_FAILURE_RETRY_MS = 10_000;

// The proxy sits in front of every service page request; a hung CMS must not
// hold those up for the 8 s the render-side client allows.
const FETCH_TIMEOUT_MS = 3000;

export interface ServiceRedirectOptions {
  fetch?: typeof fetch;
  now?: () => number;
}

class SlugMapError extends Error {}

/**
 * A lookup from a request path to the canonical path of a crossed service slug,
 * or null (not a service path, canonical slug, unknown slug, or the slug map is
 * unavailable). Keeps the slug map in module memory for SERVICE_SLUGS_TTL_MS and
 * fails open: when the CMS cannot answer, the request passes through and the
 * page 404s a crossed slug instead of redirecting it.
 */
export function createServiceRedirects(options: ServiceRedirectOptions = {}) {
  const fetchImpl = options.fetch ?? ((input: RequestInfo | URL, init?: RequestInit) => globalThis.fetch(input, init));
  const now = options.now ?? Date.now;

  let services: Service[] | null = null;
  let freshUntil = 0;
  let retryAt = 0;
  let inFlight: Promise<void> | null = null;
  let failureLogged = false;

  async function fetchServices(): Promise<Service[]> {
    let response: Response;
    try {
      response = await fetchImpl(`${REST_BASE}${SERVICE_SLUGS_REST_PATH}`, {
        cache: 'no-store',
        signal: AbortSignal.timeout(FETCH_TIMEOUT_MS),
      });
    } catch (error: unknown) {
      throw new SlugMapError(error instanceof Error ? error.message : String(error));
    }
    // A 4xx is the CMS answering "no services" (e.g. the post type is not
    // registered yet); only a 5xx or 429 is a failure.
    if (!response.ok && (response.status >= 500 || response.status === 429)) {
      throw new SlugMapError(`HTTP ${response.status}`);
    }
    if (!response.ok) return [];
    const items: unknown = await response.json();
    return Array.isArray(items) ? items.map((item) => transformService(item as RestService, 'en')) : [];
  }

  async function refresh(): Promise<void> {
    try {
      services = await fetchServices();
      freshUntil = now() + SERVICE_SLUGS_TTL_MS;
      failureLogged = false;
    } catch (error: unknown) {
      // Keep any earlier map: slugs change rarely, a stale map beats none.
      retryAt = now() + SERVICE_SLUGS_FAILURE_RETRY_MS;
      if (!failureLogged) {
        failureLogged = true;
        console.error(
          `Service slug map unavailable, crossed service slugs pass through to the page (${REST_BASE}${SERVICE_SLUGS_REST_PATH}):`,
          error instanceof Error ? error.message : error
        );
      }
    }
  }

  async function currentServices(): Promise<Service[] | null> {
    const time = now();
    if (time >= freshUntil && time >= retryAt) {
      inFlight ??= refresh().finally(() => {
        inFlight = null;
      });
      await inFlight;
    }
    return services;
  }

  return async function serviceRedirectFor(pathname: string): Promise<string | null> {
    const match = SERVICE_PATH.exec(pathname);
    if (!match) return null;

    const known = await currentServices();
    if (!known) return null;

    const lang: Lang = match[1] ? 'de' : 'en';
    return resolveServiceSlug(lang, match[2], known)?.redirectTo ?? null;
  };
}

/** The proxy's lookup; one slug map per server process. */
export const serviceRedirectFor = createServiceRedirects();
