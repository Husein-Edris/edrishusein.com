'use client';

import Link from 'next/link';
import './CookieSettingsLink.scss';

interface CookieSettingsLinkProps {
  children: React.ReactNode;
  className?: string;
}

const CookieSettingsLink = ({ children, className }: CookieSettingsLinkProps) => {
  return (
    <Link
      href="/cookie-settings"
      className={`cookie-settings-link ${className || ''}`}
    >
      {children}
    </Link>
  );
};

export default CookieSettingsLink;