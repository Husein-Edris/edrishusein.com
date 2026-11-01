import Link from 'next/link';
import type { DirectContactLinks } from '@/src/lib/contact-links';

interface ServiceContactProps {
  links: DirectContactLinks;
  emailLabel: string;
  whatsappLabel: string;
  /** Used only when no email address is set: the /contact page. */
  fallbackHref: string;
  fallbackLabel: string;
}

// Email and WhatsApp open with the service's message already typed in: one
// tap from the page to a written enquiry, no form in between.
export default function ServiceContact({ links, emailLabel, whatsappLabel, fallbackHref, fallbackLabel }: ServiceContactProps) {
  return (
    <div className="service-contact">
      {links.emailHref ? (
        <a href={links.emailHref} className="service-button">
          <svg className="service-button__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <rect x="3" y="5" width="18" height="14" rx="2" />
            <path d="m4 7 8 6 8-6" />
          </svg>
          {emailLabel}
        </a>
      ) : (
        <Link href={fallbackHref} className="service-button">
          {fallbackLabel}
        </Link>
      )}
      {links.whatsappHref && (
        <a
          href={links.whatsappHref}
          className="service-button service-button--outline"
          target="_blank"
          rel="noopener noreferrer"
        >
          <svg className="service-button__icon" viewBox="0 0 24 24" aria-hidden="true" focusable="false">
            <path d="M4.5 19.5 5.6 16A8 8 0 1 1 8.4 18.6Z" />
            <path d="M9.2 8.6c.3-.6.9-.6 1.1 0l.6 1.4c.1.3 0 .6-.2.8l-.5.5c.6 1.2 1.5 2.1 2.7 2.7l.5-.5c.2-.2.5-.3.8-.2l1.4.6c.6.2.6.8 0 1.1-.9.6-2 .8-3 .3a8.6 8.6 0 0 1-4-4c-.5-1-.3-2.1.6-2.7Z" />
          </svg>
          {whatsappLabel}
        </a>
      )}
    </div>
  );
}
