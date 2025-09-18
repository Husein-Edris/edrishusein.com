'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { cookieDatabase, getCookiesByCategory, getActiveCookies, type CookieInfo } from '@/src/data/cookies';
import CookieList from '@/src/components/CookieList/CookieList';
import './CookiePreferences.scss';

interface CookieConsent {
  essential: boolean;
  analytics: boolean;
  marketing: boolean;
  functional: boolean;
}

interface CookiePreferencesProps {
  isStandalone?: boolean;
  onSave?: () => void;
  onCancel?: () => void;
}

const CookiePreferences: React.FC<CookiePreferencesProps> = ({ 
  isStandalone = false, 
  onSave, 
  onCancel 
}) => {
  const router = useRouter();
  const [consent, setConsent] = useState<CookieConsent>({
    essential: true, // Always true, can't be disabled
    analytics: false,
    marketing: false,
    functional: false,
  });
  
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeCookies, setActiveCookies] = useState<{ [key: string]: CookieInfo[] }>({});
  const [showOnlyActive, setShowOnlyActive] = useState(false);

  useEffect(() => {
    // Load existing consent preferences
    const existingConsent = localStorage.getItem('cookieConsent');
    if (existingConsent) {
      try {
        const parsed = JSON.parse(existingConsent);
        setConsent({
          essential: true, // Always true
          analytics: parsed.analytics || false,
          marketing: parsed.marketing || false,
          functional: parsed.functional || false,
        });
      } catch (error) {
        console.error('Error parsing existing consent:', error);
      }
    }
    
    // Detect active cookies
    setActiveCookies(getActiveCookies());
    setIsLoaded(true);
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

    // Trigger analytics initialization if consented
    if (consentData.analytics) {
      // Initialize Google Analytics or other analytics here
      console.log('Analytics consent given - initialize tracking');
    }

    if (onSave) {
      onSave();
    } else if (isStandalone) {
      // Show success message and redirect or stay on page
      alert('Your cookie preferences have been saved.');
      router.push('/');
    }
  };

  const toggleConsent = (type: keyof CookieConsent) => {
    if (type === 'essential') return; // Essential cookies can't be disabled

    setConsent(prev => ({
      ...prev,
      [type]: !prev[type]
    }));
  };

  if (!isLoaded) {
    return <div className="cookie-preferences-loading">Loading preferences...</div>;
  }

  return (
    <div className={`cookie-preferences ${isStandalone ? 'standalone' : ''}`}>
      <div className="cookie-preferences-content">
        <div className="cookie-preferences-header">
          <h3 className="cookie-preferences-title">Cookie Preferences</h3>
          <p className="cookie-preferences-description">
            Choose which cookies you want to accept. You can change these settings at any time.
            Essential cookies are required for the website to function and cannot be disabled.
          </p>
          
{/* Toggle temporarily hidden */}
          {/* <div className="cookie-display-options">
            <label className="toggle-option">
              <input
                type="checkbox"
                checked={showOnlyActive}
                onChange={() => setShowOnlyActive(!showOnlyActive)}
              />
              <span className="toggle-slider"></span>
              <span className="toggle-label">Show only active cookies</span>
            </label>
          </div> */}
        </div>

        <div className="cookie-categories">
          {cookieDatabase.map((category) => {
            const categoryConsent = consent[category.id as keyof CookieConsent];
            const categoryCookies = getCookiesByCategory(category.id);
            const categoryActiveCookies = activeCookies[category.id] || [];
            
            return (
              <div key={category.id} className="cookie-category">
                <div className="cookie-category-header">
                  <label className="cookie-toggle">
                    <input
                      type="checkbox"
                      checked={categoryConsent}
                      disabled={category.id === 'essential'}
                      onChange={() => toggleConsent(category.id as keyof CookieConsent)}
                    />
                    <span className="cookie-toggle-slider"></span>
                    <span className="cookie-toggle-label">{category.title}</span>
                  </label>
                  <span className={`cookie-status ${
                    category.id === 'essential' 
                      ? 'required' 
                      : categoryConsent ? 'enabled' : 'disabled'
                  }`}>
                    {category.id === 'essential' 
                      ? 'Required' 
                      : categoryConsent ? 'Enabled' : 'Disabled'
                    }
                  </span>
                </div>
                <p className="cookie-category-description">
                  {category.description}
                </p>
                
{/* Cookie list temporarily hidden */}
                {/* <CookieList
                  cookies={categoryCookies}
                  activeCookies={categoryActiveCookies}
                  showOnlyActive={showOnlyActive}
                  categoryId={category.id}
                /> */}
              </div>
            );
          })}
        </div>

        <div className="cookie-preferences-actions">
          <div className="quick-actions">
            <button
              className="cookie-btn cookie-btn-accept-all"
              onClick={handleAcceptAll}
            >
              Accept All Cookies
            </button>
            <button
              className="cookie-btn cookie-btn-reject-all"
              onClick={handleRejectAll}
            >
              Reject All Optional
            </button>
          </div>
          
          <div className="save-actions">
            <button
              className="cookie-btn cookie-btn-save primary"
              onClick={handleAcceptSelected}
            >
              Save My Preferences
            </button>
            {!isStandalone && onCancel && (
              <button
                className="cookie-btn cookie-btn-cancel"
                onClick={onCancel}
              >
                Cancel
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CookiePreferences;