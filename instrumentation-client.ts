// Client-side Sentry init. Dormant until NEXT_PUBLIC_SENTRY_DSN is set, and even
// then it only sends events once the visitor has opted in via the cookie banner
// (analytics category), consistent with the consent-gated GA4 loader.
import * as Sentry from '@sentry/nextjs';
import { hasAnalyticsConsent } from '@/src/lib/consent';

const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN;

if (dsn) {
  Sentry.init({
    dsn,
    tracesSampleRate: 0.1,
    sendDefaultPii: false,
    environment: process.env.NODE_ENV,
    // Consent gate: drop every event until the visitor accepts analytics cookies.
    beforeSend(event) {
      return hasAnalyticsConsent() ? event : null;
    },
    beforeSendTransaction(event) {
      return hasAnalyticsConsent() ? event : null;
    },
  });
}

// App Router client-navigation instrumentation (safe no-op when DSN is unset).
export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
