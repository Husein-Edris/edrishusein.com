// Shared cookie-consent helpers.
//
// Consent is persisted as JSON under the `cookieConsent` key (localStorage,
// with a sessionStorage fallback) by the cookie banner and the cookie
// preferences screen. Analytics must stay dark until the visitor explicitly
// opts in, so anything that depends on consent reads it through here.

export const CONSENT_STORAGE_KEY = 'cookieConsent';

// Dispatched on `window` whenever consent is saved in the current tab, so
// listeners (e.g. the analytics loader) can react without a page reload.
// Cross-tab updates are covered by the native `storage` event instead.
export const CONSENT_CHANGED_EVENT = 'cookieConsentChanged';

interface StoredConsent {
  analytics?: boolean;
}

export function hasAnalyticsConsent(): boolean {
  if (typeof window === 'undefined') return false;

  try {
    const raw =
      window.localStorage?.getItem(CONSENT_STORAGE_KEY) ??
      window.sessionStorage?.getItem(CONSENT_STORAGE_KEY);

    if (!raw) return false;

    const parsed = JSON.parse(raw) as StoredConsent;
    return parsed.analytics === true;
  } catch {
    return false;
  }
}

export function notifyConsentChange(): void {
  if (typeof window === 'undefined') return;
  window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
}
