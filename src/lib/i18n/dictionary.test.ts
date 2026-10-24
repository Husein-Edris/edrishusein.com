import { describe, it, expect } from 'vitest';
import { DICTIONARY, LANG_SWITCH, dictionary } from './dictionary';

function leaves(value: unknown, path = ''): Array<[string, string]> {
  if (typeof value === 'string') return [[path, value]];
  return Object.entries(value as Record<string, unknown>).flatMap(([key, entry]) =>
    leaves(entry, path ? `${path}.${key}` : key)
  );
}

describe('dictionary', () => {
  it('has the same keys in English and German', () => {
    const en = leaves(DICTIONARY.en).map(([key]) => key);
    const de = leaves(DICTIONARY.de).map(([key]) => key);
    expect(de).toEqual(en);
  });

  it('has no empty entry and no em dash', () => {
    for (const lang of ['en', 'de'] as const) {
      for (const [key, text] of leaves(DICTIONARY[lang])) {
        expect(text.trim(), `${lang}.${key}`).not.toBe('');
        expect(text, `${lang}.${key}`).not.toContain('—');
      }
    }
  });

  it('keeps the placeholders of each entry in both languages', () => {
    const placeholders = (text: string) => (text.match(/\{\w+\}/g) ?? []).sort();
    const de = Object.fromEntries(leaves(DICTIONARY.de));
    for (const [key, text] of leaves(DICTIONARY.en)) {
      expect(placeholders(de[key]), key).toEqual(placeholders(text));
    }
  });

  it('returns the dictionary of a language', () => {
    expect(dictionary('de').openMenu).toBe('Menü öffnen');
    expect(dictionary('en').openMenu).toBe('Open menu');
  });

  it('labels the switch with the language it leads to', () => {
    expect(LANG_SWITCH.de).toEqual({ label: 'DE', title: 'Deutsche Version' });
    expect(LANG_SWITCH.en).toEqual({ label: 'EN', title: 'English version' });
  });
});
