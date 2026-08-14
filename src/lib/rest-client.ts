import { CMS_REVALIDATE, REST_BASE } from './config';

// Fail fast so a slow/hung CMS can't hold a render hostage.
const REQUEST_TIMEOUT_MS = 8000;

// The CMS is a shared WordPress host. A production build renders every project
// and post page at once, and that burst reliably pushes it past its database
// connection limit: measured 18 of 38 concurrent REST calls came back as an
// HTTP 500 "Database Error" page. Those failures are transient and a retry a
// few hundred milliseconds later succeeds.
const DEFAULT_RETRIES = 2;
const DEFAULT_RETRY_DELAY_MS = 300;

// Upper bound on the whole call including retries, so a user-facing dynamic
// render can't stack three 8s timeouts back to back.
const DEFAULT_DEADLINE_MS = 15000;

export interface CmsRestOptions {
  /** Extra attempts after the first one. Defaults to 2 (3 attempts total). */
  retries?: number;
  /** Base backoff in ms; doubles each attempt. Defaults to 300. */
  retryDelayMs?: number;
  /** Total time budget across all attempts. Defaults to 15000. */
  deadlineMs?: number;
}

/**
 * A failed CMS read.
 *
 * `isTransient` separates "the CMS is struggling" (timeout, 5xx, 429) from
 * "the CMS answered, and the answer was no" (4xx). Callers must not turn a
 * transient failure into a 404 page: during a build that bakes an empty shell
 * into the static output for a URL that really does have content.
 */
export class CmsRequestError extends Error {
  readonly status?: number;
  readonly isTransient: boolean;

  constructor(message: string, options: { status?: number; isTransient: boolean; cause?: unknown }) {
    super(message, { cause: options.cause });
    this.name = 'CmsRequestError';
    this.status = options.status;
    this.isTransient = options.isTransient;
  }
}

function isTransientStatus(status: number): boolean {
  return status >= 500 || status === 429;
}

function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function attempt<T>(url: string, path: string): Promise<T> {
  let response: Response;

  try {
    response = await fetch(url, {
      next: { revalidate: CMS_REVALIDATE },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
    } as RequestInit);
  } catch (error: unknown) {
    // A rejected fetch is a network fault or the abort timeout firing. Both are
    // worth another try.
    const reason = error instanceof Error ? error.message : String(error);
    throw new CmsRequestError(`CMS REST request failed (${reason}) for ${path}`, {
      isTransient: true,
      cause: error,
    });
  }

  if (!response.ok) {
    throw new CmsRequestError(`CMS REST request failed (${response.status}) for ${path}`, {
      status: response.status,
      isTransient: isTransientStatus(response.status),
    });
  }

  return response.json() as Promise<T>;
}

/**
 * Fetch JSON from the WordPress REST API.
 *
 * Every call participates in Next.js's Data Cache via `next.revalidate`
 * (NOT `cache: 'no-store'`) so ISR is preserved. Transient failures are retried
 * with exponential backoff; anything still failing throws a `CmsRequestError`
 * and callers wrap this in their static-fallback handling.
 *
 * @param path Either a REST path beginning with `/` (joined to REST_BASE) or
 *             an absolute URL.
 */
export async function cmsRest<T>(path: string, options: CmsRestOptions = {}): Promise<T> {
  const {
    retries = DEFAULT_RETRIES,
    retryDelayMs = DEFAULT_RETRY_DELAY_MS,
    deadlineMs = DEFAULT_DEADLINE_MS,
  } = options;

  const url = path.startsWith('http') ? path : `${REST_BASE}${path}`;
  const startedAt = Date.now();

  for (let retry = 0; ; retry += 1) {
    try {
      return await attempt<T>(url, path);
    } catch (error: unknown) {
      const isLastAttempt = retry >= retries;
      const isRetryable = error instanceof CmsRequestError && error.isTransient;
      const budgetLeft = deadlineMs - (Date.now() - startedAt);

      if (isLastAttempt || !isRetryable || budgetLeft <= 0) {
        throw error;
      }

      await wait(Math.min(retryDelayMs * 2 ** retry, Math.max(budgetLeft, 0)));
    }
  }
}
