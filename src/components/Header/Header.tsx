'use client';

import { FC, useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './Header.scss';

const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
  };

  // Handle body scroll locking and cleanup
  useEffect(() => {
    if (isMenuOpen) {
      // Prevent scrolling on body and html
      document.body.style.overflow = 'hidden';
      document.body.style.position = 'fixed';
      document.body.style.width = '100%';
      document.documentElement.style.overflow = 'hidden';
    } else {
      // Restore scrolling
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
    }

    // Cleanup function to reset scroll on unmount
    return () => {
      document.body.style.overflow = '';
      document.body.style.position = '';
      document.body.style.width = '';
      document.documentElement.style.overflow = '';
    };
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
            style={{ width: 'auto', height: '90px' }}
          />
        </Link>

        <div 
          className={`mobile-menu ${isMenuOpen ? 'active' : ''}`} 
          onClick={closeMenu}
          onTouchMove={(e) => e.preventDefault()} // Prevent touch scrolling
        >
          <nav 
            className="main-nav" 
            onClick={(e) => e.stopPropagation()}
            onTouchMove={(e) => e.stopPropagation()} // Allow navigation area to be touchable
          >
            <ul className="navList">
              <li className="navItem">
                <Link href="/projects" className="navLink" onClick={closeMenu}>
                  <span className="navNumber">01</span>
                  <span className="navText">PROJECTS</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/about" className="navLink" onClick={closeMenu}>
                  <span className="navNumber">02</span>
                  <span className="navText">ABOUT</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/bookshelf" className="navLink" onClick={closeMenu}>
                  <span className="navNumber">03</span>
                  <span className="navText">BOOKSHELF</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/notebook" className="navLink" onClick={closeMenu}>
                  <span className="navNumber">04</span>
                  <span className="navText">NOTEBOOK</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/contact" className="navLink" onClick={closeMenu}>
                  <span className="navNumber">05</span>
                  <span className="navText">CONTACT</span>
                </Link>
              </li>
            </ul>
          </nav>
        </div>

        <button className="menu-toggle" onClick={toggleMenu} aria-label="Toggle menu">
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