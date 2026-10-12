import { decodeEntities } from '@/src/lib/transform/decodeEntities';
import { cleanHeroCopy, EMOJI_PATTERN } from './cleanHeroCopy';

// Home > Hero > Hero Copy is a basic WYSIWYG field. Its HTML is never injected:
// it is parsed into a small tree that allows only links (http, https or a site
// path), <strong>, <em> and <br>. Every other tag is dropped and its text kept;
// <script>/<style> are dropped with their content. Plain text still works.

export type HeroCopyNode =
  | { kind: 'text'; text: string }
  | { kind: 'br' }
  | { kind: 'a'; href: string; children: HeroCopyNode[] }
  | { kind: 'strong' | 'em'; children: HeroCopyNode[] };

type Container = { kind: 'root' | 'a' | 'strong' | 'em'; href?: string; children: HeroCopyNode[] };

const TAG_PATTERN = /<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/g;
const DROP_WITH_CONTENT = /<(script|style)\b[^>]*>[\s\S]*?<\/\1\s*>/gi;
const HREF_PATTERN = /\bhref\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/i;
const INLINE = new Set(['strong', 'em', 'b', 'i']);
const BLOCK = new Set(['p', 'div', 'li', 'ul', 'ol', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote']);

/** Only absolute http(s) URLs and site paths (not protocol-relative) are kept. */
export function safeHref(raw: string): string | null {
  const href = decodeEntities(raw).trim();
  if (/^https?:\/\/[^\s]+$/i.test(href)) return href;
  if (/^\/(?!\/)[^\s]*$/.test(href)) return href;
  return null;
}

function normalizeText(text: string): string {
  return decodeEntities(text).replace(EMOJI_PATTERN, '').replace(/\s+/g, ' ');
}

function mergeText(nodes: HeroCopyNode[]): HeroCopyNode[] {
  return nodes.reduce<HeroCopyNode[]>((out, node) => {
    const previous = out[out.length - 1];
    if (node.kind === 'text' && previous?.kind === 'text') {
      return [...out.slice(0, -1), { kind: 'text', text: (previous.text + node.text).replace(/\s+/g, ' ') }];
    }
    return [...out, node];
  }, []);
}

function trimEdges(nodes: HeroCopyNode[]): HeroCopyNode[] {
  const out = mergeText(nodes);
  while (out[0]?.kind === 'br') out.shift();
  while (out[out.length - 1]?.kind === 'br') out.pop();
  const first = out[0];
  if (first?.kind === 'text') out[0] = { kind: 'text', text: first.text.trimStart() };
  const lastIndex = out.length - 1;
  const last = out[lastIndex];
  if (last?.kind === 'text') {
    out[lastIndex] = { kind: 'text', text: last.text.trimEnd().replace(/\s*(\.{3}|…)$/, '.') };
  }
  return out.filter((node) => node.kind !== 'text' || node.text !== '');
}

export function parseHeroCopy(raw: string | undefined): HeroCopyNode[] {
  if (!raw || !raw.trim()) return [];
  if (!raw.includes('<')) {
    const text = cleanHeroCopy(decodeEntities(raw));
    return text ? [{ kind: 'text', text }] : [];
  }

  const root: Container = { kind: 'root', children: [] };
  const stack: Container[] = [root];
  const top = () => stack[stack.length - 1];
  let pendingBreak = false;

  const pushText = (text: string) => {
    const value = normalizeText(text);
    if (!value) return;
    if (pendingBreak) {
      // Whitespace between two paragraphs is dropped; real text starts a new line.
      if (!value.trim()) return;
      top().children.push({ kind: 'br' });
      pendingBreak = false;
      top().children.push({ kind: 'text', text: value.trimStart() });
      return;
    }
    top().children.push({ kind: 'text', text: value });
  };

  const close = (kind: Container['kind']) => {
    const index = stack.map((c) => c.kind).lastIndexOf(kind);
    if (index <= 0) return;
    while (stack.length > index) {
      const node = stack.pop() as Container;
      const children = mergeText(node.children);
      if (node.kind === 'a') {
        if (node.href) top().children.push({ kind: 'a', href: node.href, children });
        else top().children.push(...children);
      } else if (node.kind === 'strong' || node.kind === 'em') {
        top().children.push({ kind: node.kind, children });
      }
    }
  };

  const html = raw.replace(DROP_WITH_CONTENT, '');
  let cursor = 0;
  for (const match of html.matchAll(TAG_PATTERN)) {
    pushText(html.slice(cursor, match.index));
    cursor = (match.index ?? 0) + match[0].length;
    const closing = match[1] === '/';
    const tag = match[2].toLowerCase();

    if (tag === 'br') {
      top().children.push({ kind: 'br' });
      pendingBreak = false;
    } else if (BLOCK.has(tag)) {
      if (closing) pendingBreak = stack.length === 1 && root.children.length > 0;
    } else if (tag === 'a') {
      if (closing) close('a');
      else if (!stack.some((c) => c.kind === 'a')) {
        const href = HREF_PATTERN.exec(match[3]);
        stack.push({ kind: 'a', href: safeHref(href?.[1] ?? href?.[2] ?? href?.[3] ?? '') ?? undefined, children: [] });
      }
    } else if (INLINE.has(tag)) {
      const kind = tag === 'strong' || tag === 'b' ? 'strong' : 'em';
      if (closing) close(kind);
      else stack.push({ kind, children: [] });
    }
  }
  pushText(html.slice(cursor));
  while (stack.length > 1) close(top().kind);

  return trimEdges(root.children);
}

export interface HeroCopyLink {
  phrase: string;
  href: string;
}

function hasLink(nodes: HeroCopyNode[]): boolean {
  return nodes.some((node) => node.kind === 'a' || ((node.kind === 'strong' || node.kind === 'em') && hasLink(node.children)));
}

function linkPhrase(nodes: HeroCopyNode[], { phrase, href }: HeroCopyLink): { nodes: HeroCopyNode[]; done: boolean } {
  const out: HeroCopyNode[] = [];
  let done = false;
  for (const node of nodes) {
    if (done) {
      out.push(node);
    } else if (node.kind === 'text' && node.text.includes(phrase)) {
      const at = node.text.indexOf(phrase);
      const before = node.text.slice(0, at);
      const after = node.text.slice(at + phrase.length);
      if (before) out.push({ kind: 'text', text: before });
      out.push({ kind: 'a', href, children: [{ kind: 'text', text: phrase }] });
      if (after) out.push({ kind: 'text', text: after });
      done = true;
    } else if (node.kind === 'strong' || node.kind === 'em') {
      const inner = linkPhrase(node.children, { phrase, href });
      out.push({ kind: node.kind, children: inner.nodes });
      done = inner.done;
    } else {
      out.push(node);
    }
  }
  return { nodes: out, done };
}

/**
 * Fallback while the CMS copy has no links of its own: the first exact
 * occurrence of each phrase links to its URL. Copy that already contains a
 * link is left as the editor wrote it.
 */
export function autoLinkHeroCopy(nodes: HeroCopyNode[], links: readonly HeroCopyLink[]): HeroCopyNode[] {
  if (hasLink(nodes)) return nodes;
  return links.reduce((current, link) => linkPhrase(current, link).nodes, nodes);
}
