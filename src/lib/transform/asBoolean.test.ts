import { describe, it, expect } from 'vitest';
import { asBoolean } from './asBoolean';

describe('asBoolean', () => {
  it.each([true, 1, '1', 'true', ' TRUE '])('treats %p as true', (value) => {
    expect(asBoolean(value)).toBe(true);
  });

  it.each([false, 0, '0', '', 'false', null, undefined, {}, []])('treats %p as false', (value) => {
    expect(asBoolean(value)).toBe(false);
  });
});
