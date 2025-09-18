'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import './CookieBanner.scss';

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

const CookieBanner = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Check if user has already given consent
    const existingConsent = localStorage.getItem('cookieConsent');
    if (!existingConsent) {
      // Small delay to avoid flash on page load
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
    localStorage.setItem('cookieConsent', JSON.stringify({
      ...consentData,
      timestamp: new Date().toISOString(),
    }));
    setIsVisible(false);

    // Trigger analytics initialization if consented
    if (consentData.analytics) {
      // Initialize Google Analytics or other analytics here
      console.log('Analytics consent given - initialize tracking');
    }
  };


  if (!isVisible) return null;

  return (
    <div className="cookie-banner">
      <div className="cookie-banner-content">
        <div className="cookie-banner-main">
          <h3 className="cookie-title">We use cookies</h3>
          <p className="cookie-description">
            We use cookies to enhance your browsing experience, serve personalized content,
            and analyze our traffic. By clicking "Accept All", you consent to our use of cookies.
          </p>

          <div className="cookie-buttons">
            <button
              className="cookie-btn cookie-btn-accept"
              onClick={handleAcceptAll}
            >
              Accept All
            </button>
            <button
              className="cookie-btn cookie-btn-reject"
              onClick={handleRejectAll}
            >
              Reject All
            </button>
            <Link
              href="/cookie-settings"
              className="cookie-btn cookie-btn-settings"
            >
              Cookie Settings
            </Link>
          </div>

          <div className="cookie-links">
            <Link href="/privacy-policy" className="cookie-link">
              Privacy Policy
            </Link>
            <Link href="/imprint" className="cookie-link">
              Imprint
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
};

export default CookieBanner;