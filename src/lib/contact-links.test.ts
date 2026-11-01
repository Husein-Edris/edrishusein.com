import { describe, it, expect } from 'vitest';
import { directContactLinks, whatsappDigits } from './contact-links';

describe('whatsappDigits', () => {
  it('keeps the digits of an international number', () => {
    expect(whatsappDigits('+43 660 123 45 67')).toBe('436601234567');
    expect(whatsappDigits('0043 (660) 123-4567')).toBe('436601234567');
  });

  it('reads a national number without country code as Austrian (+43)', () => {
    expect(whatsappDigits('0676 3910128')).toBe('436763910128');
    expect(whatsappDigits('06763910128')).toBe('436763910128');
  });

  it('drops a trunk 0 written after the country code', () => {
    expect(whatsappDigits('+43 0676 3910128')).toBe('436763910128');
    expect(whatsappDigits('+43 (0)676 3910128')).toBe('436763910128');
    expect(whatsappDigits('0043 0676 3910128')).toBe('436763910128');
  });

  it('treats any run of leading zeros before a country code as the international prefix', () => {
    expect(whatsappDigits('000436763910128')).toBe('436763910128');
  });

  it('returns empty for no number or one too short or long to be real', () => {
    expect(whatsappDigits('')).toBe('');
    expect(whatsappDigits('12345')).toBe('');
    expect(whatsappDigits('1234567890123456')).toBe('');
  });
});

describe('directContactLinks', () => {
  const base = { email: 'kontakt@edrishusein.com', whatsapp: '+43 660 1234567', subject: 'Website redesign' };

  it('prefills subject and body of the email and the WhatsApp text', () => {
    const links = directContactLinks({ ...base, message: 'Hi Edris, my site is: …\nWhat happened: …' });

    expect(links.emailHref).toBe(
      'mailto:kontakt@edrishusein.com?subject=Website%20redesign&body=Hi%20Edris%2C%20my%20site%20is%3A%20%E2%80%A6%0AWhat%20happened%3A%20%E2%80%A6',
    );
    expect(links.whatsappHref).toBe(
      'https://wa.me/436601234567?text=Hi%20Edris%2C%20my%20site%20is%3A%20%E2%80%A6%0AWhat%20happened%3A%20%E2%80%A6',
    );
  });

  it('leaves out empty parameters', () => {
    const links = directContactLinks({ ...base, subject: '', message: '' });

    expect(links.emailHref).toBe('mailto:kontakt@edrishusein.com');
    expect(links.whatsappHref).toBe('https://wa.me/436601234567');
  });

  it('has no WhatsApp link until a valid number is set', () => {
    expect(directContactLinks({ ...base, whatsapp: '', message: 'x' }).whatsappHref).toBeNull();
    expect(directContactLinks({ ...base, whatsapp: 'call me', message: 'x' }).whatsappHref).toBeNull();
  });

  it('has no email link without an address', () => {
    expect(directContactLinks({ ...base, email: ' ', message: 'x' }).emailHref).toBeNull();
  });
});
