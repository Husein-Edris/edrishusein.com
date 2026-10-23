'use client';

import { FC, useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { GERMAN_LANDING_PATH } from '@/src/lib/german-landing';
import './Header.scss';

// Keep in sync with $nav-collapse in Header.scss.
const NAV_COLLAPSE_MAX = 1279;

const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  // Language switch: the German landing page links back to the English
  // homepage, every other page links to the German landing page.
  const isGerman = usePathname() === GERMAN_LANDING_PATH;
  const langSwitch = isGerman
    ? { href: '/', label: 'EN', hrefLang: 'en', title: 'English version' }
    : { href: GERMAN_LANDING_PATH, label: 'DE', hrefLang: 'de', title: 'Deutsche Version' };
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
        <Link href="/" className="logo">
          <Image
            src="/edrishusein-logo.svg"
            alt="Edris Husein Logo"
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
            aria-label="Primary"
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()} // Allow navigation area to be touchable
          >
            <ul className="navList">
              <li className="navItem">
                <Link href="/projects" className="navLink" onClick={closeMenu}>
                  <span className="navText">PROJECTS</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/about" className="navLink" onClick={closeMenu}>
                  <span className="navText">ABOUT</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/bookshelf" className="navLink" onClick={closeMenu}>
                  <span className="navText">BOOKSHELF</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/notebook" className="navLink" onClick={closeMenu}>
                  <span className="navText">NOTEBOOK</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/tech-stack" className="navLink" onClick={closeMenu}>
                  <span className="navText">TECH STACK</span>
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
                <Link href="/contact" className="navLink navLink--cta" onClick={closeMenu}>
                  <span className="navText">CONTACT</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <button
          ref={toggleRef}
          className="menu-toggle"
          onClick={toggleMenu}
          aria-label={isMenuOpen ? 'Close menu' : 'Open menu'}
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