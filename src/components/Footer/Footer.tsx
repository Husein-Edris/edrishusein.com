import Image from 'next/image';
import Link from 'next/link';
import CookieSettingsLink from '@/src/components/CookieSettingsLink/CookieSettingsLink';
import { getSiteContentOrDefaults } from '@/src/lib/site-content';
import './Footer.scss';

// Server component. Legal link labels come from Site Content > Global; the
// fetch never throws (getSiteContentOrDefaults) because every page renders it.
// Main and secondary link labels are page names and stay in code, like Header.
const Footer = async () => {
    const copy = (await getSiteContentOrDefaults()).footer;
    const currentYear = new Date().getFullYear();
    const mainLinks = [
        { href: '/projects', label: 'Projects' },
        { href: '/about', label: 'About' },
    ];

    const secondaryLinks = [
        { href: '/bookshelf', label: 'Bookshelf' },
        { href: '/notebook', label: 'Notebook' },
        { href: '/contact', label: 'Contact' },
    ];

    const legalLinks = [
        { href: '/imprint', label: copy.imprintLabel },
        { href: '/privacy-policy', label: copy.privacyPolicyLabel },
    ];

    return (
        <footer className="footer">
            <div className="container">
                <div className="footer-content">
                    <div className="footer-left">
                        <Link href="/" className="logo">
                            <Image
                                src="/edrishusein-logo.svg"
                                alt="Edris Husein Logo"
                                width={120}
                                height={120}
                                priority
                            />
                        </Link>
                        <p className="copyright">©{currentYear} Edris Husein</p>
                    </div>

                    <nav className="footer-nav" aria-label="Footer">
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