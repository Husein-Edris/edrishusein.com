/**
 * Coerce an ACF-over-REST field to an array.
 *
 * ACF serializes empty repeater / relation / gallery fields as `false`
 * (not `[]` or absent) over the REST API. A bare `value ?? []` does NOT guard
 * against this, because `??` only catches null/undefined — `false`, strings,
 * and objects pass through and then break `.map()`.
 *
 * Returns the value only when it is genuinely an array, otherwise `[]`.
 */
export function asArray<T>(value: unknown): T[] {
  return Array.isArray(value) ? (value as T[]) : [];
}
