// Central CMS configuration shared by the REST data layer.

// The env var is historically named for the (now-removed) GraphQL endpoint and
// may still carry a trailing `/graphql`. Strip only a trailing occurrence so a
// REST-base value (no `/graphql`) is left untouched.
// Exported so every consumer (REST client, image rewriting) derives the base the
// same way instead of each re-implementing the strip.
export const CMS_BASE_URL = (
  process.env.NEXT_PUBLIC_WORDPRESS_API_URL || 'https://cms.edrishusein.com'
).replace(/\/graphql\/?$/, '');

// ISR window (seconds) for cached CMS reads. Pages that opt into caching
// (i.e. not `force-dynamic`) reuse a render for this long instead of blocking
// on a live WordPress fetch on every visit.
export const CMS_REVALIDATE = 60;

// Base URL for the WordPress REST API (derived from the configured CMS URL by
// swapping the GraphQL endpoint for the REST namespace).
export const REST_BASE = `${CMS_BASE_URL}/wp-json/wp/v2`;
