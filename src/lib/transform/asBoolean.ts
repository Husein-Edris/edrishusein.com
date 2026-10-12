// ACF true_false over REST arrives as true/false, 1/0, "1"/"0", null, or is
// missing entirely when the field was never saved. Only explicit truthy values count.
export function asBoolean(value: unknown): boolean {
  if (value === true || value === 1) return true;
  if (typeof value === 'string') {
    const normalised = value.trim().toLowerCase();
    return normalised === '1' || normalised === 'true';
  }
  return false;
}
