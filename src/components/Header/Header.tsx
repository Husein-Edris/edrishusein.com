'use client';

import { FC, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useLang, useNavLabels } from '@/src/components/LangProvider/LangProvider';
import { localePath, stripLocale } from '@/src/lib/i18n/paths';
import { otherLang } from '@/src/lib/i18n/lang';
import { LANG_SWITCH, dictionary } from '@/src/lib/i18n/dictionary';
import './Header.scss';

// Keep in sync with $nav-collapse in Header.scss.
const NAV_COLLAPSE_MAX = 1279;

const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const lang = useLang();
  const nav = useNavLabels();
  const text = dictionary(lang);
  // Language switch: the same page in the other language (same path, with or
  // without /de). stripLocale also covers the internal /en/... path in case the
  // rewritten pathname reaches this hook during server rendering.
  const targetLang = otherLang(lang);
  const langSwitch = {
    href: localePath(stripLocale(usePathname()).path, targetLang),
    hrefLang: targetLang,
    ...LANG_SWITCH[targetLang],
  };
  const href = (path: string) => localePath(path, lang);
  const toggleRef = useRef<HTMLButtonElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Handle body scroll locking + make the page behind the overlay inert
  // (removes the 30+ background elements from the tab order and the a11y tree
  // while the full-screen menu is open). See WCAG 2.4.3 Focus Order.
  useEffect(() => {
    const background = [
      document.getElementById('main-content'),
      document.querySelector('footer'),
    ];
    const setInert = (on: boolean) => {
      background.forEach((el) => {
        if (!el) return;
        if (on) el.setAttribute('inert', '');
        else el.removeAttribute('inert');
      });
    };

    if (isMenuOpen) {
      // Prevent scrolling on body and html
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
      setInert(true);
    } else {
      // Restore scrolling
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      setInert(false);
    }

    // Cleanup function to reset scroll on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
      setInert(false);
    };
  }, [isMenuOpen]);

  // Close the menu when the window grows past the collapse width
  // ($nav-collapse in Header.scss); the hidden menu would otherwise keep the
  // body scroll lock and the inert page.
  useEffect(() => {
    const desktop = window.matchMedia(`(min-width: ${NAV_COLLAPSE_MAX + 1}px)`);
    const onChange = (e: MediaQueryListEvent) => {
      if (e.matches) setIsMenuOpen(false);
    };
    desktop.addEventListener('change', onChange);
    return () => desktop.removeEventListener('change', onChange);
  }, []);

  // Move focus into the menu on open, and back to the toggle on close, so
  // keyboard and screen-reader users are placed in (and returned from) the overlay.
  useEffect(() => {
    if (isMenuOpen) {
      const firstLink = menuRef.current?.querySelector<HTMLElement>('.navLink');
      firstLink?.focus();
    } else if (menuRef.current?.contains(document.activeElement)) {
      // Closing while focus was still inside the overlay (e.g. via Escape):
      // return focus to the toggle. Skips the initial mount, where focus is elsewhere.
      toggleRef.current?.focus();
    }
  }, [isMenuOpen]);

  // Handle escape key to close menu
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isMenuOpen) {
        closeMenu();
      }
    };

    if (isMenuOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isMenuOpen]);

  return (
    <header className="header">
      <div className="container">
        <Link href={href('/')} className="logo">
          <Image
            src="/edrishusein-logo.svg"
            alt={text.logoAlt}
            width={80}
            height={40}
            priority
            style={{ width: 'auto' }}
          />
        </Link>

        <div
          ref={menuRef}
          id="mobile-menu"
          className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}
          onClick={closeMenu}
          onTouchMove={(e) => e.preventDefault()} // Prevent touch scrolling
        >
          <nav
            className="main-nav"
            aria-label={text.primaryNavLabel}
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()} // Allow navigation area to be touchable
          >
            <ul className="navList">
              <li className="navItem">
                <Link href={href('/projects')} className="navLink" onClick={closeMenu}>
                  <span className="navText">{nav.projects}</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href={href('/about')} className="navLink" onClick={closeMenu}>
                  <span className="navText">{nav.about}</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href={href('/bookshelf')} className="navLink" onClick={closeMenu}>
                  <span className="navText">{nav.bookshelf}</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href={href('/notebook')} className="navLink" onClick={closeMenu}>
                  <span className="navText">{nav.notebook}</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href={href('/tech-stack')} className="navLink" onClick={closeMenu}>
                  <span className="navText">{nav.techStack}</span>
                </Link>
              </li>
              <li className="navItem navItem--lang">
                <Link
                  href={langSwitch.href}
                  hrefLang={langSwitch.hrefLang}
                  lang={langSwitch.hrefLang}
                  aria-label={langSwitch.title}
                  title={langSwitch.title}
                  className="navLink navLink--lang"
                  onClick={closeMenu}
                >
                  <span className="navText">{langSwitch.label}</span>
                </Link>
              </li>
              <li className="navItem navItem--cta">
                <Link href={href('/contact')} className="navLink navLink--cta" onClick={closeMenu}>
                  <span className="navText">{nav.contact}</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <button
          ref={toggleRef}
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? text.closeMenu : text.openMenu}
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <span className="menu-icon"></span>
        </button>

        <div className="socialLinks">
          <a
            href="https://www.linkedin.com/in/edris-husein/"
            target="_blank"
            rel="noopener noreferrer"
            className="socialLink linkedin"
          >
            <Image
              src="/icons/LinkedIn.svg"
              alt="LinkedIn"
              width={32}
              height={32}
            />
          </a>
          <a
            href="https://github.com/Husein-Edris"
            target="_blank"
            rel="noopener noreferrer"
            className="socialLink github"
          >
            <Image
              src="/icons/Github.svg"
              alt="GitHub"
              width={32}
              height={32}
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;