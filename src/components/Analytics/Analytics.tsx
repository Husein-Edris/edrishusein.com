'use client';

import { useEffect } from 'react';
import { CONSENT_CHANGED_EVENT, hasAnalyticsConsent } from '@/src/lib/consent';

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag: (...args: unknown[]) => void;
  }
}

const GA_SCRIPT_ID = 'ga-gtag';

/**
 * Bootstraps Google Analytics 4 imperatively (the same steps the gtag snippet
 * performs) and appends the official loader. Done in plain DOM rather than via
 * <GoogleAnalytics> from @next/third-parties because that component's inline
 * init script does not execute when it is mounted after consent (post-hydration
 * React injection), which is exactly the consent-gated flow we need.
 */
function loadGoogleAnalytics(gaId: string): void {
  if (document.getElementById(GA_SCRIPT_ID)) return; // already initialized

  window.dataLayer = window.dataLayer || [];
  function gtag() {
    // GA expects the raw arguments object pushed onto the dataLayer.
    // eslint-disable-next-line prefer-rest-params
    window.dataLayer.push(arguments);
  }
  window.gtag = gtag;

  window.gtag('js', new Date());
  window.gtag('config', gaId);

  const script = document.createElement('script');
  script.id = GA_SCRIPT_ID;
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${gaId}`;
  document.head.appendChild(script);
}

/**
 * Consent-gated GA4 loader. Renders nothing; GA is loaded imperatively and only
 * once the visitor has explicitly granted analytics consent via the cookie
 * banner / preferences. No Google request is made before opt-in, which keeps the
 * site GDPR-compliant for the EU audience. When NEXT_PUBLIC_GA_ID is unset,
 * nothing ever loads.
 */
const Analytics = () => {
  const gaId = process.env.NEXT_PUBLIC_GA_ID;

  useEffect(() => {
    if (!gaId) return;

    const maybeLoad = () => {
      if (hasAnalyticsConsent()) loadGoogleAnalytics(gaId);
    };

    maybeLoad(); // visitors who already consented in a previous session

    // Same-tab consent updates (banner / preferences) dispatch this event.
    window.addEventListener(CONSENT_CHANGED_EVENT, maybeLoad);
    // Cross-tab consent updates fire the native storage event.
    window.addEventListener('storage', maybeLoad);

    return () => {
      window.removeEventListener(CONSENT_CHANGED_EVENT, maybeLoad);
      window.removeEventListener('storage', maybeLoad);
    };
  }, [gaId]);

  return null;
};

export default Analytics;
