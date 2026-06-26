import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import Analytics from './Analytics';
import { CONSENT_CHANGED_EVENT, CONSENT_STORAGE_KEY } from '@/src/lib/consent';

const GA_ID = 'G-TEST123';
const GA_SCRIPT_SELECTOR = '#ga-gtag';

// The global test setup replaces localStorage with no-op mocks; the loader
// depends on real read/write behavior, so use an in-memory store.
const createMemoryStorage = (): Storage => {
  const store = new Map<string, string>();
  return {
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => void store.set(key, String(value)),
    removeItem: (key) => void store.delete(key),
    clear: () => store.clear(),
    key: (index) => Array.from(store.keys())[index] ?? null,
    get length() {
      return store.size;
    },
  };
};

const storeConsent = (analytics: boolean) => {
  localStorage.setItem(
    CONSENT_STORAGE_KEY,
    JSON.stringify({ essential: true, analytics, marketing: false, functional: false })
  );
};

const gaScript = () =>
  document.querySelector<HTMLScriptElement>(GA_SCRIPT_SELECTOR);

describe('Analytics (consent-gated GA4)', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', createMemoryStorage());
    vi.stubEnv('NEXT_PUBLIC_GA_ID', GA_ID);
  });

  afterEach(() => {
    gaScript()?.remove();
    // @ts-expect-error - reset injected globals between tests
    delete window.gtag;
    // @ts-expect-error - reset injected globals between tests
    delete window.dataLayer;
    vi.unstubAllGlobals();
    vi.unstubAllEnvs();
  });

  it('loads no GA script and defines no gtag before consent', () => {
    render(<Analytics />);
    expect(gaScript()).toBeNull();
    expect(window.gtag).toBeUndefined();
  });

  it('does not load GA when analytics consent is denied', () => {
    storeConsent(false);
    render(<Analytics />);
    expect(gaScript()).toBeNull();
  });

  it('loads GA with the correct measurement ID once consent is granted', () => {
    storeConsent(true);
    render(<Analytics />);

    const script = gaScript();
    expect(script).not.toBeNull();
    expect(script?.src).toContain(`id=${GA_ID}`);
    expect(typeof window.gtag).toBe('function');
    expect(Array.isArray(window.dataLayer)).toBe(true);
  });

  it('does not load GA when NEXT_PUBLIC_GA_ID is unset, even with consent', () => {
    vi.stubEnv('NEXT_PUBLIC_GA_ID', '');
    storeConsent(true);
    render(<Analytics />);
    expect(gaScript()).toBeNull();
  });

  it('loads GA after a same-tab consent change without a reload', () => {
    render(<Analytics />);
    expect(gaScript()).toBeNull();

    act(() => {
      storeConsent(true);
      window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
    });

    expect(gaScript()?.src).toContain(`id=${GA_ID}`);
  });

  it('does not inject the loader twice on repeated consent events', () => {
    storeConsent(true);
    render(<Analytics />);

    act(() => {
      window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
      window.dispatchEvent(new Event(CONSENT_CHANGED_EVENT));
    });

    expect(document.querySelectorAll(GA_SCRIPT_SELECTOR).length).toBe(1);
  });
});
