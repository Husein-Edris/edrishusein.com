import { describe, it, expect } from 'vitest';
import { autoLinkHeroCopy, parseHeroCopy, safeHref, type HeroCopyNode } from './heroCopy';

const text = (t: string): HeroCopyNode => ({ kind: 'text', text: t });
const link = (href: string, t: string): HeroCopyNode => ({ kind: 'a', href, children: [text(t)] });

const LIVE_COPY =
  'I build and look after websites and web solutions for businesses and agencies. During my time with an Austrian agency I built the illwerke vkw apprentice campaign, the annual report site for the Vorarlberg state hospitals and the FHE Gastro relaunch. Today I also maintain more than 200 client sites for a Swiss agency.';

const LINKS = [
  { phrase: 'illwerke vkw', href: 'https://lehre.illwerkevkw.at/' },
  { phrase: 'Vorarlberg state hospitals', href: 'https://geschaeftsbericht2022.landeskrankenhaus.at/' },
  { phrase: 'FHE Gastro', href: 'https://www.fhe.at/' },
];

describe('parseHeroCopy', () => {
  it('renders plain text as one cleaned text node', () => {
    expect(parseHeroCopy('Hi  there 👋🏻\r\nfriend...')).toEqual([text('Hi there friend.')]);
    expect(parseHeroCopy('')).toEqual([]);
    expect(parseHeroCopy(undefined)).toEqual([]);
  });

  it('keeps links, strong, em and br from WYSIWYG HTML and unwraps paragraphs', () => {
    const html = '<p>I built <a href="https://www.fhe.at/">FHE <strong>Gastro</strong></a> &amp; <em>more</em>.<br />Next line</p>\n<p>Second paragraph</p>\n';
    expect(parseHeroCopy(html)).toEqual([
      text('I built '),
      { kind: 'a', href: 'https://www.fhe.at/', children: [text('FHE '), { kind: 'strong', children: [text('Gastro')] }] },
      text(' & '),
      { kind: 'em', children: [text('more')] },
      text('.'),
      { kind: 'br' },
      text('Next line'),
      { kind: 'br' },
      text('Second paragraph'),
    ]);
  });

  it('drops scripts, styles, event handlers and unknown tags but keeps their text', () => {
    const html = '<p onclick="x()">Safe <script>alert(1)</script><style>p{}</style><span class="x">text</span> <img src=x onerror=alert(1)></p>';
    expect(parseHeroCopy(html)).toEqual([text('Safe text')]);
  });

  it('unwraps links with unsafe or protocol-relative hrefs', () => {
    const html = 'A <a href="javascript:alert(1)">bad</a> <a href="//evil.example">rel</a> <a href=\'/projects\'>ok</a>';
    expect(parseHeroCopy(html)).toEqual([text('A bad rel '), link('/projects', 'ok')]);
  });
});

describe('safeHref', () => {
  it('accepts http, https and site paths only', () => {
    expect(safeHref('https://a.at/x?y=1&amp;z=2')).toBe('https://a.at/x?y=1&z=2');
    expect(safeHref('/projects/x')).toBe('/projects/x');
    expect(safeHref('mailto:a@b.c')).toBeNull();
    expect(safeHref(' JavaScript:alert(1)')).toBeNull();
    expect(safeHref('data:text/html,x')).toBeNull();
    expect(safeHref('//evil.example')).toBeNull();
  });
});

describe('autoLinkHeroCopy', () => {
  it('links the first exact occurrence of each project name in plain copy', () => {
    const nodes = autoLinkHeroCopy(parseHeroCopy(LIVE_COPY), LINKS);
    const links = nodes.filter((n) => n.kind === 'a');
    expect(links).toEqual([
      link('https://lehre.illwerkevkw.at/', 'illwerke vkw'),
      link('https://geschaeftsbericht2022.landeskrankenhaus.at/', 'Vorarlberg state hospitals'),
      link('https://www.fhe.at/', 'FHE Gastro'),
    ]);
    expect(nodes.map((n) => (n.kind === 'text' ? n.text : n.kind === 'a' ? (n.children[0] as { text: string }).text : '')).join('')).toBe(
      LIVE_COPY,
    );
  });

  it('leaves copy alone when the editor already added a link', () => {
    const nodes = parseHeroCopy('<p>See <a href="/projects">illwerke vkw</a> and FHE Gastro.</p>');
    expect(autoLinkHeroCopy(nodes, LINKS)).toBe(nodes);
  });

  it('skips phrases that are missing from the copy or from the link list', () => {
    const nodes = parseHeroCopy('Only FHE Gastro here.');
    expect(autoLinkHeroCopy(nodes, [])).toEqual(nodes);
    expect(autoLinkHeroCopy(nodes, LINKS.slice(0, 1))).toEqual(nodes);
  });
});
