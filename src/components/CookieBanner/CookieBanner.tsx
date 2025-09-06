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
  const [showDetails, setShowDetails] = useState(false);
  const [consent, setConsent] = useState<CookieConsent>({
    essential: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false,
  });

  useEffect(() => {
    // Check if user has already given consent
    const existingConsent = localStorage.getItem('cookieConsent');
    if (!existingConsent) {
      // Small delay to avoid flash on page load
      setTimeout(() => setIsVisible(true), 1000);
    }

    // Listen for custom event to show cookie settings
    const handleShowCookieSettings = () => {
      const existing = localStorage.getItem('cookieConsent');
      if (existing) {
        try {
          const parsed = JSON.parse(existing);
          setConsent(parsed);
        } catch (error) {
          console.error('Error parsing existing consent:', error);
        }
      }
      setShowDetails(true);
      setIsVisible(true);
    };

    window.addEventListener('showCookieSettings', handleShowCookieSettings);
    
    return () => {
      window.removeEventListener('showCookieSettings', handleShowCookieSettings);
    };
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

  const handleAcceptSelected = () => {
    saveConsent(consent);
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

  const toggleConsent = (type: keyof CookieConsent) => {
    if (type === 'essential') return; // Essential cookies can't be disabled
    
    setConsent(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
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
            <button 
              className="cookie-btn cookie-btn-settings"
              onClick={() => setShowDetails(!showDetails)}
            >
              Cookie Settings
            </button>
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

        {showDetails && (
          <div className="cookie-details">
            <h4 className="cookie-details-title">Cookie Preferences</h4>
            <p className="cookie-details-description">
              Choose which cookies you want to accept. You can change these settings at any time.
            </p>

            <div className="cookie-categories">
              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={consent.essential}
                      disabled={true}
                      readOnly
                    />
                    <span className="cookie-toggle-slider"></span>
                    <span className="cookie-toggle-label">Essential Cookies</span>
                  </label>
                </div>
                <p className="cookie-category-description">
                  Required for the website to function. These cannot be disabled.
                </p>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={consent.analytics}
                      onChange={() => toggleConsent('analytics')}
                    />
                    <span className="cookie-toggle-slider"></span>
                    <span className="cookie-toggle-label">Analytics Cookies</span>
                  </label>
                </div>
                <p className="cookie-category-description">
                  Help us understand how visitors interact with our website.
                </p>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={consent.functional}
                      onChange={() => toggleConsent('functional')}
                    />
                    <span className="cookie-toggle-slider"></span>
                    <span className="cookie-toggle-label">Functional Cookies</span>
                  </label>
                </div>
                <p className="cookie-category-description">
                  Enable enhanced functionality and personalization.
                </p>
              </div>

              <div className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={consent.marketing}
                      onChange={() => toggleConsent('marketing')}
                    />
                    <span className="cookie-toggle-slider"></span>
                    <span className="cookie-toggle-label">Marketing Cookies</span>
                  </label>
                </div>
                <p className="cookie-category-description">
                  Used to track visitors for advertising and marketing purposes.
                </p>
              </div>
            </div>

            <div className="cookie-details-buttons">
              <button 
                className="cookie-btn cookie-btn-save"
                onClick={handleAcceptSelected}
              >
                Save Preferences
              </button>
              <button 
                className="cookie-btn cookie-btn-cancel"
                onClick={() => setShowDetails(false)}
              >
                Cancel
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default CookieBanner;