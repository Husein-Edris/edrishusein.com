import Image from 'next/image';
import Link from 'next/link';
import './Footer.scss';

const Footer = () => {
    const currentYear = new Date().getFullYear();
    const mainLinks = [
        { href: '/projects', label: 'Projects' },
        { href: '/about', label: 'About' },
        { href: '/blog', label: 'Blog' },
    ];

    const legalLinks = [
        { href: '/impressum', label: 'Impressum' },
        { href: '/datenschutz', label: 'Datenschutz' },
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
                                width={60}
                                height={60}
                                priority
                            />
                        </Link>
                        <p className="copyright">©{currentYear} Edris Husein</p>
                    </div>

                    <nav className="footer-nav">
                        <ul className="nav-list main-links">
                            {mainLinks.map((link) => (
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
                        </ul>
                    </nav>
                </div>
            </div>
        </footer>
    );
};

export default Footer;