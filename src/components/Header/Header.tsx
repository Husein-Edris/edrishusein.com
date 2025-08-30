'use client';

import { FC, useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import './Header.scss';

const Header: FC = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
    document.body.style.overflow = !isMenuOpen ? 'hidden' : 'auto';
  };

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
          />
        </Link>

        <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
          <nav className="main-nav">
            <ul className="navList">
              <li className="navItem">
                <Link href="/" className="navLink" onClick={toggleMenu}>
                  <span className="navNumber">01</span>
                  <span className="navText">HOME</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/projects" className="navLink" onClick={toggleMenu}>
                  <span className="navNumber">02</span>
                  <span className="navText">PROJECTS</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/about" className="navLink" onClick={toggleMenu}>
                  <span className="navNumber">03</span>
                  <span className="navText">ABOUT</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/bookshelf" className="navLink" onClick={toggleMenu}>
                  <span className="navNumber">04</span>
                  <span className="navText">BOOKSHELF</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/notebook" className="navLink" onClick={toggleMenu}>
                  <span className="navNumber">05</span>
                  <span className="navText">NOTEBOOK</span>
                </Link>
              </li>
              <li className="navItem">
                <Link href="/contact" className="navLink" onClick={toggleMenu}>
                  <span className="navNumber">06</span>
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
              src="/icons/linkedin.svg"
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
              src="/icons/github.svg"
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