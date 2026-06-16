import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;

// ISR window (seconds) for cached CMS reads. Pages that opt into caching
// (i.e. not `force-dynamic`) reuse a render for this long instead of blocking
// on a live WordPress fetch on every visit — this is what keeps the homepage
// loading screen from waiting on the CMS round-trip each time.
export const CMS_REVALIDATE = 60;

// Wrap fetch so every GraphQL request participates in Next.js's Data Cache.
// graphql-request forwards its own AbortSignal via `init`, which we preserve.
const cachingFetch: typeof fetch = (input, init) =>
  fetch(input, { ...init, next: { revalidate: CMS_REVALIDATE } } as RequestInit);

export const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 8000, // fail fast so a slow/hung CMS can't hold the loading screen
  fetch: cachingFetch,
});