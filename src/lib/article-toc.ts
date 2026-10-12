import { decodeEntities } from './transform/decodeEntities';

// Table of contents for notebook articles (design C1), built on the server from
// the H2 headings of the CMS HTML.

/** Fewer H2 headings than this and the article gets no contents list. */
export const MIN_TOC_ITEMS = 2;

export interface TocItem {
  readonly id: string;
  readonly text: string;
}

export interface ArticleToc {
  /** The content HTML with an id on every H2 (existing ids are kept). */
  readonly html: string;
  /** Empty when the article has fewer than MIN_TOC_ITEMS headings. */
  readonly items: readonly TocItem[];
}

const TRANSLITERATION: Readonly<Record<string, string>> = { ä: 'ae', ö: 'oe', ü: 'ue', ß: 'ss' };

/** URL-safe anchor from heading text: "Qualität, die Sie prüfen" -> "qualitaet-die-sie-pruefen". */
export function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[äöüß]/g, (char) => TRANSLITERATION[char] ?? char)
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function plainText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

const H2_PATTERN = /<h2(\s[^>]*)?>([\s\S]*?)<\/h2>/gi;
const ID_ATTRIBUTE = /\sid\s*=\s*(["'])(.*?)\1/i;

/**
 * Give every H2 a stable, unique id and list them. Only the opening tag is
 * touched; the heading's inner HTML and every other element stay as the CMS
 * sent them.
 */
export function buildArticleToc(html: string): ArticleToc {
  const used = new Set<string>();
  const items: TocItem[] = [];

  const unique = (base: string): string => {
    let candidate = base;
    for (let n = 2; used.has(candidate); n += 1) candidate = `${base}-${n}`;
    used.add(candidate);
    return candidate;
  };

  const withIds = html.replace(H2_PATTERN, (match, attributes: string | undefined, inner: string) => {
    const text = plainText(inner);
    const existing = attributes?.match(ID_ATTRIBUTE)?.[2];
    if (existing) {
      used.add(existing);
      if (text) items.push({ id: existing, text });
      return match;
    }
    const id = unique(slugifyHeading(text) || `section-${items.length + 1}`);
    if (text) items.push({ id, text });
    return `<h2 id="${id}"${attributes ?? ''}>${inner}</h2>`;
  });

  return { html: withIds, items: items.length >= MIN_TOC_ITEMS ? items : [] };
}
