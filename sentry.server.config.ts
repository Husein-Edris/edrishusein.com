// Server-side Sentry init (Node.js runtime). Loaded from instrumentation.ts.
// Dormant until NEXT_PUBLIC_SENTRY_DSN is set (e.g. in .env.production on the
// server), so this is safe to ship before a DSN exists.
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    // Sample a small slice of performance traces; capture all errors.
    tracesSampleRate: 0.1,
    // Never attach IP/cookies/headers that could identify a visitor (GDPR).
    sendDefaultPii: false,
    environment: process.env.NODE_ENV,
  });
}
