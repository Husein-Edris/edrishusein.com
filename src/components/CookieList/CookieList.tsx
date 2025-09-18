'use client';

import { type CookieInfo } from '@/src/data/cookies';
import './CookieList.scss';

interface CookieListProps {
  cookies: CookieInfo[];
  activeCookies?: CookieInfo[];
  showOnlyActive?: boolean;
  categoryId: string;
}

const CookieList: React.FC<CookieListProps> = ({ 
  cookies, 
  activeCookies = [], 
  showOnlyActive = false,
  categoryId 
}) => {
  const displayCookies = showOnlyActive && activeCookies.length > 0 ? activeCookies : cookies;
  
  if (displayCookies.length === 0) {
    return (
      <div className="cookie-list empty">
        <p className="no-cookies">
          {showOnlyActive 
            ? 'No cookies from this category are currently active.' 
            : 'No cookies defined for this category.'
          }
        </p>
      </div>
    );
  }

  return (
    <div className="cookie-list">
      <div className="cookie-list-header">
        <h5 className="cookie-list-title">
          {showOnlyActive ? 'Active cookies:' : 'Cookies used:'}
        </h5>
        {showOnlyActive && activeCookies.length > 0 && (
          <span className="active-count">{activeCookies.length} active</span>
        )}
      </div>
      
      <div className="cookie-items">
        {displayCookies.map((cookie, index) => {
          const isActive = activeCookies.some(active => 
            active.name === cookie.name || 
            (cookie.name.includes('*') && active.name.startsWith(cookie.name.replace('*', '')))
          );
          
          return (
            <div key={`${categoryId}-${cookie.name}-${index}`} className={`cookie-item ${isActive ? 'active' : ''}`}>
              <div className="cookie-header">
                <span className="cookie-name">
                  <strong>{cookie.name}</strong>
                  {isActive && <span className="active-indicator">●</span>}
                </span>
                {cookie.expiry && (
                  <span className="cookie-expiry">{cookie.expiry}</span>
                )}
              </div>
              
              <p className="cookie-description">{cookie.description}</p>
              
              {cookie.purpose && (
                <p className="cookie-purpose">
                  <em>Purpose: {cookie.purpose}</em>
                </p>
              )}
              
              {cookie.domain && (
                <p className="cookie-domain">
                  <small>Domain: {cookie.domain}</small>
                </p>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default CookieList;