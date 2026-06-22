import { describe, it, expect } from 'vitest';
import { decodeEntities } from './decodeEntities';

describe('decodeEntities', () => {
  it('decodes numeric entities (curly apostrophe)', () => {
    expect(decodeEntities('Man&#8217;s Search for Meaning')).toBe('Man’s Search for Meaning');
  });

  it('decodes the numeric ampersand WordPress emits (&#038;)', () => {
    expect(decodeEntities('Angels &#038; Demons')).toBe('Angels & Demons');
  });

  it('decodes named entities (&amp;)', () => {
    expect(decodeEntities('Research &amp; analysis')).toBe('Research & analysis');
  });

  it('decodes hex entities', () => {
    expect(decodeEntities('A &#x26; B')).toBe('A & B');
  });

  it('tolerates double-encoding (&amp;#038;)', () => {
    expect(decodeEntities('Angels &amp;#038; Demons')).toBe('Angels & Demons');
  });

  it('leaves plain text untouched', () => {
    expect(decodeEntities('Building My Personal Website')).toBe('Building My Personal Website');
  });

  it('returns empty/undefined-ish input unchanged', () => {
    expect(decodeEntities('')).toBe('');
  });

  it('leaves unknown/malformed entities literal', () => {
    expect(decodeEntities('use &foobar; here')).toBe('use &foobar; here');
  });
});
