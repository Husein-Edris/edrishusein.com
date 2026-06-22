import { CMS_REVALIDATE, REST_BASE } from './config';

// Fail fast so a slow/hung CMS can't hold a render hostage.
const REQUEST_TIMEOUT_MS = 8000;

/**
 * Fetch JSON from the WordPress REST API.
 *
 * Every call participates in Next.js's Data Cache via `next.revalidate`
 * (NOT `cache: 'no-store'`) so ISR is preserved. Throws on timeout or any
 * non-2xx response; callers wrap this in their static-fallback handling.
 *
 * @param path Either a REST path beginning with `/` (joined to REST_BASE) or
 *             an absolute URL.
 */
export async function cmsRest<T>(path: string): Promise<T> {
  const url = path.startsWith('http') ? path : `${REST_BASE}${path}`;

  const response = await fetch(url, {
    next: { revalidate: CMS_REVALIDATE },
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  } as RequestInit);

  if (!response.ok) {
    throw new Error(`CMS REST request failed (${response.status}) for ${path}`);
  }

  return response.json() as Promise<T>;
}
