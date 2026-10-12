/**
 * Returns the CMS value when it carries visible text, otherwise the code default.
 * ACF serializes an untouched text field as '' or null, and a field added after
 * the page was saved is missing entirely; all three mean "use the default".
 */
export function cmsText(value: string | null | undefined, fallback: string): string {
  const trimmed = typeof value === 'string' ? value.trim() : '';
  return trimmed || fallback;
}
