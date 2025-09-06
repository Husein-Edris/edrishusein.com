'use client';

import './CookieSettingsLink.scss';

interface CookieSettingsLinkProps {
  children: React.ReactNode;
  className?: string;
}

const CookieSettingsLink = ({ children, className }: CookieSettingsLinkProps) => {
  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    
    // Dispatch custom event to show cookie settings
    const event = new CustomEvent('showCookieSettings');
    window.dispatchEvent(event);
  };

  return (
    <button
      onClick={handleClick}
      className={`cookie-settings-link ${className || ''}`}
    >
      {children}
    </button>
  );
};

export default CookieSettingsLink;