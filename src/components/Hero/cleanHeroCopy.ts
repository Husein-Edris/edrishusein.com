// CMS copy arrives with Windows line breaks, doubled spaces, a trailing "..."
// and sometimes emoji. Normalise it so the rendered sentence reads cleanly.
export const EMOJI_PATTERN = /[\p{Extended_Pictographic}\u{1F3FB}-\u{1F3FF}\u{FE0F}\u{200D}]/gu;

export function cleanHeroCopy(raw: string | undefined): string {
  if (!raw) return '';
  return raw
    .replace(EMOJI_PATTERN, '')
    .replace(/\s+/g, ' ')
    .replace(/\s*(\.{3}|…)\s*$/, '.')
    .trim();
}
