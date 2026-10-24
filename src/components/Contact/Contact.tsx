// Updated Contact component to use data from WordPress
import Image from 'next/image';
import './Contact.scss';
import { DEFAULT_LANG, type Lang } from '@/src/lib/i18n/lang';

const CONTACT_DEFAULTS = {
  en: { subtitle: 'Freelance WordPress and Next.js work', title: 'Start a project' },
  de: { subtitle: 'Freelance-Arbeit mit WordPress und Next.js', title: 'Projekt starten' },
} as const;

interface ContactProps {
  data?: {
    subTitle?: string;
    title?: string;
    email?: string;
  }
  /** Optional short paragraph shown under the email: used to give the standalone /contact page more presence. */
  intro?: string;
  lang?: Lang;
}

const Contact = ({ data, intro, lang = DEFAULT_LANG }: ContactProps) => {
  // Use data from props if available, otherwise use fallbacks
  const defaults = CONTACT_DEFAULTS[lang];
  const subtitle = data?.subTitle || defaults.subtitle;
  const title = data?.title || defaults.title;
  const email = data?.email || "kontakt@edrishusein.com";

  return (
    <section className="contact">
      <div className="container">
        <div className="contact-content">
          <p className="subtitle">{subtitle}</p>
          <h2 className="title">{title}</h2>
          {intro && <p className="contact-intro">{intro}</p>}
          <a href={`mailto:${email}`} className="email">
            {email.toUpperCase()}
          </a>
          <div className="social-links">
            <a
              href="https://www.linkedin.com/in/edris-husein/"
              target="_blank"
              rel="noopener noreferrer"
              className="social-link"
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
              className="social-link"
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
      </div>
    </section>
  );
};

export default Contact;