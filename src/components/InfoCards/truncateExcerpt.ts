// Shared by InfoCards and MoreProjects. Short excerpts keep their HTML; long
// ones are stripped to text and cut at the last word boundary.
export function truncateExcerpt(html: string | undefined | null, maxLength = 120): string {
  if (!html) return '';

  const text = html.replace(/<\/?[^>]+(>|$)/g, '');
  if (text.length <= maxLength) return html;

  const truncated = text.substring(0, maxLength);
  const lastSpace = truncated.lastIndexOf(' ');
  const truncatedText = truncated.substring(0, lastSpace > 0 ? lastSpace : maxLength);

  return `${truncatedText}...`;
}
