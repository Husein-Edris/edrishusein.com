'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { notifyConsentChange } from '@/src/lib/consent';
import { SITE_CONTENT_DEFAULTS, type CookieBannerContent } from '@/src/lib/transform/transformSiteContent';
import { useLang } from '@/src/components/LangProvider/LangProvider';
import { localePath } from '@/src/lib/i18n/paths';
import { dictionary } from '@/src/lib/i18n/dictionary';
import './CookieBanner.scss';

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookieBannerProps {
  // Site Content > Cookie banner, passed from the root layout (server side).
  copy?: CookieBannerContent;
}

const CookieBanner = ({ copy = SITE_CONTENT_DEFAULTS.cookieBanner }: CookieBannerProps) => {
  const [isVisible, setIsVisible] = useState(false);
  const lang = useLang();

  useEffect(() => {
    const checkConsent = () => {
      try {
        // Check if user has already given consent
        let existingConsent = null;
        
        // Try localStorage first
        if (typeof Storage !== 'undefined') {
          existingConsent = localStorage.getItem('cookieConsent');
        }
        
        // Fallback to sessionStorage
        if (!existingConsent && typeof sessionStorage !== 'undefined') {
          existingConsent = sessionStorage.getItem('cookieConsent');
        }
        
        // Only hide banner if we found valid consent
        if (!existingConsent || existingConsent === null || existingConsent === 'null') {
          // Small delay to avoid flash on page load
          setTimeout(() => setIsVisible(true), 1000);
        } else {
          // Validate the consent data
          try {
            JSON.parse(existingConsent);
            // Valid consent found, don't show banner
          } catch (parseError) {
            // Invalid consent data, show banner
            setTimeout(() => setIsVisible(true), 1000);
          }
        }
      } catch (error) {
        console.error('Error accessing storage:', error);
        // If storage fails, show banner anyway for consent
        setTimeout(() => setIsVisible(true), 1000);
      }
    };

    // Check if we're in browser environment
    if (typeof window !== 'undefined' && typeof Storage !== 'undefined') {
      checkConsent();
    } else {
      // Fallback for browsers without localStorage or in SSR
      setTimeout(() => setIsVisible(true), 1000);
    }
  }, []);

  const handleAcceptAll = () => {
    const allConsent: CookieConsent = {
      essential: true,
      analytics: true,
      marketing: true,
      functional: true,
    };
    saveConsent(allConsent);
  };


  const handleRejectAll = () => {
    const minimalConsent: CookieConsent = {
      essential: true,
      analytics: false,
      marketing: false,
      functional: false,
    };
    saveConsent(minimalConsent);
  };

  const saveConsent = (consentData: CookieConsent) => {
    try {
      localStorage.setItem('cookieConsent', JSON.stringify({
        ...consentData,
        timestamp: new Date().toISOString(),
      }));
      setIsVisible(false);

      // Let the consent-gated analytics loader react without a page reload.
      notifyConsentChange();
    } catch (error) {
      console.error('Error saving consent to localStorage:', error);
      // Even if saving fails, hide the banner to prevent it from being stuck
      setIsVisible(false);
      
      // Try alternative storage methods
      try {
        // Fallback to sessionStorage
        sessionStorage.setItem('cookieConsent', JSON.stringify({
          ...consentData,
          timestamp: new Date().toISOString(),
        }));
        console.log('Consent saved to sessionStorage as fallback');
      } catch (sessionError) {
        console.error('SessionStorage also failed:', sessionError);
        // Could implement cookie-based fallback here if needed
      }
    }
  };


  if (!isVisible) return null;

  return (
    <div className="cookie-banner" role="region" aria-label={dictionary(lang).cookieConsentRegion}>
      <div className="cookie-banner-content">
        <p className="cookie-description">
          {copy.text}{' '}
          <Link href={localePath('/privacy-policy', lang)} className="cookie-link">
            {copy.privacyLinkLabel}
          </Link>
        </p>
        <div className="cookie-buttons">
          <button type="button" className="cookie-btn cookie-btn-reject" onClick={handleRejectAll}>
            {copy.rejectLabel}
          </button>
          <button type="button" className="cookie-btn cookie-btn-accept" onClick={handleAcceptAll}>
            {copy.acceptLabel}
          </button>
          <Link href={localePath('/cookie-settings', lang)} className="cookie-settings-link">
            {copy.settingsLabel}
          </Link>
        </div>
      </div>
    </div>
  );
};

export default CookieBanner;