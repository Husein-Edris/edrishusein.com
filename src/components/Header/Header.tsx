import { FC } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import styles from './Header.module.scss';

const Header: FC = () => {
  return (
    <header className={styles.header}>
      <div className={styles.container}>
        <Link href="/" className={styles.logo}>
          <Image 
            src="/logo.svg" 
            alt="EVD Logo" 
            width={80} 
            height={40}
            priority
          />
        </Link>

        <nav className={styles.nav}>
          <ul className={styles.navList}>
            <li className={styles.navItem}>
              <Link href="/projects" className={styles.navLink}>
                <span className={styles.navNumber}>01</span>
                PROJECTS
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/about" className={styles.navLink}>
                <span className={styles.navNumber}>02</span>
                ABOUT
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/blog" className={styles.navLink}>
                <span className={styles.navNumber}>03</span>
                BLOG
              </Link>
            </li>
            <li className={styles.navItem}>
              <Link href="/contact" className={styles.navLink}>
                <span className={styles.navNumber}>04</span>
                CONTACT
              </Link>
            </li>
          </ul>
        </nav>

        <div className={styles.socialLinks}>
          <a 
            href="https://linkedin.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            <Image 
              src="/icons/linkedin.svg" 
              alt="LinkedIn" 
              width={24} 
              height={24}
            />
          </a>
          <a 
            href="https://twitter.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            <Image 
              src="/icons/twitter.svg" 
              alt="Twitter" 
              width={24} 
              height={24}
            />
          </a>
          <a 
            href="https://github.com" 
            target="_blank" 
            rel="noopener noreferrer"
            className={styles.socialLink}
          >
            <Image 
              src="/icons/github.svg" 
              alt="GitHub" 
              width={24} 
              height={24}
            />
          </a>
        </div>
      </div>
    </header>
  );
};

export default Header;