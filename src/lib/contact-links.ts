// One-tap contact from a service page: an email and a WhatsApp chat, both with
// the service's message already typed in, so nobody has to open /contact first.

// E.164 allows up to 15 digits; anything under 7 is not a phone number.
const MIN_DIGITS = 7;
const MAX_DIGITS = 15;
// The number is the site owner's own; one written the Austrian way (0676 ...)
// gets the Austrian country code, which wa.me requires.
const NATIONAL_COUNTRY_CODE = '43';

/** A phone number as wa.me expects it (country code, digits only); '' when unusable. */
export function whatsappDigits(raw: string): string {
  const all = raw.replace(/\D/g, '');
  // Two or more leading zeros are the international prefix (0043 ...); a
  // single one is the national trunk prefix (0676 ...).
  const international = /^00/.test(all)
    ? all.replace(/^0+/, '')
    : all.replace(/^0/, NATIONAL_COUNTRY_CODE);
  // "+43 (0)676 ..." keeps the trunk 0 after the country code; wa.me must not.
  const digits = international.replace(new RegExp(`^${NATIONAL_COUNTRY_CODE}0`), NATIONAL_COUNTRY_CODE);
  return digits.length >= MIN_DIGITS && digits.length <= MAX_DIGITS ? digits : '';
}

export interface DirectContactInput {
  email: string;
  /** +43 676 ..., 0043 ... or Austrian 0676 ..., any spacing; '' hides WhatsApp. */
  whatsapp: string;
  subject: string;
  /** Prefilled message text; '' sends an empty one. */
  message: string;
}

export interface DirectContactLinks {
  emailHref: string | null;
  whatsappHref: string | null;
}

function query(params: Record<string, string>): string {
  const pairs = Object.entries(params)
    .filter(([, value]) => value !== '')
    .map(([key, value]) => `${key}=${encodeURIComponent(value)}`);
  return pairs.length > 0 ? `?${pairs.join('&')}` : '';
}

export function directContactLinks({ email, whatsapp, subject, message }: DirectContactInput): DirectContactLinks {
  const address = email.trim();
  const digits = whatsappDigits(whatsapp);
  return {
    emailHref: address ? `mailto:${address}${query({ subject, body: message })}` : null,
    whatsappHref: digits ? `https://wa.me/${digits}${query({ text: message })}` : null,
  };
}
