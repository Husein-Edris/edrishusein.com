import { describe, it, expect } from 'vitest';
import { languageSwitchPath } from './language-switch';

const pairs = [{ en: 'website-redesign', de: 'website-relaunch' }];

describe('languageSwitchPath', () => {
  it('keeps the path of an ordinary page and changes the prefix', () => {
    expect(languageSwitchPath('/about', 'de', pairs)).toBe('/de/about');
    expect(languageSwitchPath('/de/about', 'en', pairs)).toBe('/about');
    expect(languageSwitchPath('/', 'de', pairs)).toBe('/de');
  });

  it('links a service page to the slug of the other language', () => {
    expect(languageSwitchPath('/services/website-redesign', 'de', pairs)).toBe('/de/services/website-relaunch');
    expect(languageSwitchPath('/de/services/website-relaunch', 'en', pairs)).toBe('/services/website-redesign');
  });

  it('handles the internal /en path the rewrite can expose', () => {
    expect(languageSwitchPath('/en/services/website-redesign', 'de', pairs)).toBe('/de/services/website-relaunch');
  });

  it('keeps the slug of an unknown service and the services index', () => {
    expect(languageSwitchPath('/services/unknown', 'de', pairs)).toBe('/de/services/unknown');
    expect(languageSwitchPath('/services', 'de', pairs)).toBe('/de/services');
    expect(languageSwitchPath('/services/website-redesign', 'de', [])).toBe('/de/services/website-redesign');
  });
});
