'use client';

import { useState, useEffect } from 'react';

export interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
  timestamp?: string;
}

const defaultConsent: CookieConsent = {
  essential: true,
  analytics: false,
  marketing: false,
  functional: false,
};

export const useCookieConsent = () => {
  const [consent, setConsent] = useState<CookieConsent | null>(null);
  const [hasConsent, setHasConsent] = useState<boolean>(false);

  useEffect(() => {
    // Check if running in browser
    if (typeof window === 'undefined') return;

    try {
      const storedConsent = localStorage.getItem('cookieConsent');
      if (storedConsent) {
        const parsedConsent = JSON.parse(storedConsent);
        setConsent(parsedConsent);
        setHasConsent(true);
      } else {
        setConsent(defaultConsent);
        setHasConsent(false);
      }
    } catch (error) {
      console.error('Error reading cookie consent:', error);
      setConsent(defaultConsent);
      setHasConsent(false);
    }
  }, []);

  const updateConsent = (newConsent: CookieConsent) => {
    try {
      const consentWithTimestamp = {
        ...newConsent,
        timestamp: new Date().toISOString(),
      };
      
      localStorage.setItem('cookieConsent', JSON.stringify(consentWithTimestamp));
      setConsent(consentWithTimestamp);
      setHasConsent(true);
      
      // Trigger analytics initialization if analytics consent is given
      if (newConsent.analytics && !consent?.analytics) {
        initializeAnalytics();
      }
    } catch (error) {
      console.error('Error saving cookie consent:', error);
    }
  };

  const clearConsent = () => {
    try {
      localStorage.removeItem('cookieConsent');
      setConsent(defaultConsent);
      setHasConsent(false);
    } catch (error) {
      console.error('Error clearing cookie consent:', error);
    }
  };

  const initializeAnalytics = () => {
    // Initialize Google Analytics or other analytics services
    // This is where you would add your analytics initialization code
    console.log('🍪 Analytics cookies accepted - initializing tracking services');
    
    // Example: Google Analytics 4
    /*
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('consent', 'update', {
        analytics_storage: 'granted'
      });
    }
    */
  };

  // Helper functions for checking specific consent types
  const canUseAnalytics = () => consent?.analytics === true;
  const canUseMarketing = () => consent?.marketing === true;
  const canUseFunctional = () => consent?.functional === true;

  return {
    consent,
    hasConsent,
    updateConsent,
    clearConsent,
    canUseAnalytics,
    canUseMarketing,
    canUseFunctional,
  };
};