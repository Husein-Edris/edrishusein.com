'use client';

import Link from 'next/link';
import { useLang } from '@/src/components/LangProvider/LangProvider';
import { localePath } from '@/src/lib/i18n/paths';
import './CookieSettingsLink.scss';

interface CookieSettingsLinkProps {
  children: React.ReactNode;
  className?: string;
}

const CookieSettingsLink = ({ children, className }: CookieSettingsLinkProps) => {
  const lang = useLang();
  return (
    <Link
      href={localePath('/cookie-settings', lang)}
      className={`cookie-settings-link ${className || ''}`}
    >
      {children}
    </Link>
  );
};

export default CookieSettingsLink;