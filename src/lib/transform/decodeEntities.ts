/**
 * Decode HTML entities in plain-text fields coming from WordPress.
 *
 * WordPress returns titles/labels with entity-encoded punctuation (e.g.
 * `Man&#8217;s Search`, `Angels &#038; Demons`, `Research &amp; analysis`).
 * When those values are rendered as React text (not via `dangerouslySetInnerHTML`)
 * they show up literally. Decode them once so the text reads correctly.
 *
 * IMPORTANT: only use this for plain-text fields (titles, labels). Never run it
 * on raw HTML `content` that is injected with `dangerouslySetInnerHTML` — that
 * would turn intentionally-escaped markup (e.g. `&lt;script&gt;`) into live tags.
 */
const NAMED_ENTITIES: Readonly<Record<string, string>> = {
  amp: '&',
  lt: '<',
  gt: '>',
  quot: '"',
  apos: "'",
  nbsp: ' ',
  hellip: '…',
  mdash: '—',
  ndash: '–',
  lsquo: '‘',
  rsquo: '’',
  ldquo: '“',
  rdquo: '”',
};

const ENTITY_PATTERN = /&(#x[0-9a-fA-F]+|#\d+|[a-zA-Z][a-zA-Z0-9]*);/g;
const MAX_PASSES = 3;

function decodeOnce(input: string): string {
  return input.replace(ENTITY_PATTERN, (match, body: string) => {
    if (body[0] === '#') {
      const isHex = body[1] === 'x' || body[1] === 'X';
      const code = isHex ? parseInt(body.slice(2), 16) : parseInt(body.slice(1), 10);
      if (!Number.isFinite(code) || code <= 0) return match;
      try {
        return String.fromCodePoint(code);
      } catch {
        return match;
      }
    }
    return NAMED_ENTITIES[body] ?? NAMED_ENTITIES[body.toLowerCase()] ?? match;
  });
}

/** Decode HTML entities, tolerating double-encoding (e.g. `&amp;#038;`). */
export function decodeEntities(input: string): string {
  if (!input || input.indexOf('&') === -1) return input;
  let current = input;
  for (let pass = 0; pass < MAX_PASSES; pass += 1) {
    const next = decodeOnce(current);
    if (next === current) break;
    current = next;
  }
  return current;
}
