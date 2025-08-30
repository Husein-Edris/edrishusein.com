// Updated Contact component to use data from WordPress
import Image from 'next/image';
import './Contact.scss';

interface ContactProps {
  data?: {
    subTitle?: string;
    title?: string;
    email?: string;
  }
}

const Contact = ({ data }: ContactProps) => {
  // Use data from props if available, otherwise use fallbacks
  const subtitle = data?.subTitle || "WANT TO WORK TOGETHER?";
  const title = data?.title || "SAY HI!";
  const email = data?.email || "kontakt@edrishusein.com";

  return (
    <section className="contact">
      <div className="container">
        <div className="contact-content">
          <h3 className="subtitle">{subtitle}</h3>
          <h2 className="title">{title}</h2>
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