import Image from 'next/image';
import Link from 'next/link';
import CookieSettingsLink from '@/src/components/CookieSettingsLink/CookieSettingsLink';
import { getSiteContentOrDefaults } from '@/src/lib/site-content';
import { localePath } from '@/src/lib/i18n/paths';
import { DEFAULT_LANG, type Lang } from '@/src/lib/i18n/lang';
import { dictionary } from '@/src/lib/i18n/dictionary';
import './Footer.scss';

// Server component. Link labels come from Site Content (page names and legal
// links) in the page language; the fetch never throws (getSiteContentOrDefaults)
// because every page renders it.
const Footer = async ({ lang = DEFAULT_LANG }: { lang?: Lang }) => {
    const siteContent = await getSiteContentOrDefaults(lang);
    const copy = siteContent.footer;
    const nav = siteContent.nav;
    const text = dictionary(lang);
    const currentYear = new Date().getFullYear();
    const href = (path: string) => localePath(path, lang);
    const mainLinks = [
        { href: href('/projects'), label: nav.projects },
        { href: href('/about'), label: nav.about },
    ];

    const secondaryLinks = [
        { href: href('/bookshelf'), label: nav.bookshelf },
        { href: href('/notebook'), label: nav.notebook },
        { href: href('/contact'), label: nav.contact },
    ];

    const legalLinks = [
        { href: href('/imprint'), label: copy.imprintLabel },
        { href: href('/privacy-policy'), label: copy.privacyPolicyLabel },
    ];

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-left">
                        <Link href={href('/')} className="logo">
                            <Image
                                src="/edrishusein-logo.svg"
                                alt={text.logoAlt}
                                width={120}
                                height={120}
                                priority
                            />
                        </Link>
                        <p className="copyright">©{currentYear} Edris Husein</p>
                    </div>

                    <nav className="footer-nav" aria-label={text.footerNavLabel}>
                        <ul className="nav-list main-links">
                            {mainLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                        <ul className="nav-list secondary-links">
                            {secondaryLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}>{link.label}</Link>
                                </li>
                            ))}
                        </ul>
                        <ul className="nav-list legal-links">
                            {legalLinks.map((link) => (
                                <li key={link.href}>
                                    <Link href={link.href}>{link.label}</Link>
                                </li>
                            ))}
                            <li>
                                <CookieSettingsLink>{copy.cookieSettingsLabel}</CookieSettingsLink>
                            </li>
                        </ul>
                    </nav>
                </div>
            </div>
        </footer>
    );
};

export default Footer;