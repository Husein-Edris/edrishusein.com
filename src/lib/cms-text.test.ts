import { describe, it, expect } from 'vitest';
import { cmsText } from './cms-text';

describe('cmsText', () => {
  it('returns the trimmed CMS value when it has text', () => {
    expect(cmsText('  Hello  ', 'Default')).toBe('Hello');
  });

  it('returns the fallback for empty, blank, null or missing values', () => {
    expect(cmsText('', 'Default')).toBe('Default');
    expect(cmsText('   ', 'Default')).toBe('Default');
    expect(cmsText(null, 'Default')).toBe('Default');
    expect(cmsText(undefined, 'Default')).toBe('Default');
  });
});
