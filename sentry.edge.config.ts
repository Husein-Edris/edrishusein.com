// Edge-runtime Sentry init. Loaded from instrumentation.ts. Dormant until
// NEXT_PUBLIC_SENTRY_DSN is set. (The www->apex proxy runs on nodejs, but the
// edge config is kept for any future edge routes and the standard register flow.)
import * as Sentry from '@sentry/nextjs';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    environment: process.env.NODE_ENV,
  });
}
