// "Data margin" article layout: a paragraph that cites a reference ([1], [2]) gets that
// reference as a sidenote in the margin, plus the paragraph's first percentage as a big
// figure. Back-to-back cited paragraphs share one note that spans them, so a note never
// slides next to the wrong paragraph. Works on the CMS body HTML for every post that ends
// with a reference list.

const REFERENCE_LIST = /<h2[^>]*>\s*(?:References|Sources|Quellen)\s*<\/h2>\s*<ol[^>]*>([\s\S]*?)<\/ol>/i;
const LIST_ITEM = /<li[^>]*>([\s\S]*?)<\/li>/gi;
const PARAGRAPH = /<p(?:\s[^>]*)?>([\s\S]*?)<\/p>/gi;
const CITATION = /\[(\d+)\]/g;
// The figure plus the next few words, to read its direction ("19 percent slower").
const PERCENTAGE = /(\d+(?:[.,]\d+)?)\s?(?:%|percent|Prozent)([^.;:]{0,40})/i;
const UP = /\b(faster|more|higher|schneller|mehr|höher)\b/i;
const DOWN = /\b(slower|fewer|less|lower|drop|langsamer|weniger|niedriger)\b/i;
const MINUS = '−';

interface CitedParagraph {
  start: number;
  end: number;
  html: string;
  text: string;
  cited: number[];
}

const plainText = (html: string): string => html.replace(/<[^>]+>/g, '');

function references(html: string): string[] {
  const list = html.match(REFERENCE_LIST)?.[1] ?? '';
  return [...list.matchAll(LIST_ITEM)].map((item) => item[1].trim());
}

function figure(text: string): string {
  const match = text.match(PERCENTAGE);
  if (!match) return '';
  const [, value, after] = match;
  if (DOWN.test(after)) return `<span class="sidenote__figure sidenote__figure--down">${MINUS}${value}%</span>`;
  const sign = UP.test(after) ? '+' : '';
  return `<span class="sidenote__figure">${sign}${value}%</span>`;
}

function citedParagraphs(html: string, refs: readonly string[]): CitedParagraph[] {
  return [...html.matchAll(PARAGRAPH)].flatMap((m) => {
    const cited = [...new Set([...m[1].matchAll(CITATION)].map((c) => Number(c[1])))].filter((n) => refs[n - 1]);
    if (cited.length === 0) return [];
    const start = m.index ?? 0;
    return [{ start, end: start + m[0].length, html: m[0], text: plainText(m[1]), cited }];
  });
}

/** Paragraphs separated only by whitespace form one run that shares a note. */
function runs(paragraphs: CitedParagraph[], html: string): CitedParagraph[][] {
  return paragraphs.reduce<CitedParagraph[][]>((acc, p) => {
    const last = acc[acc.length - 1];
    const prev = last?.[last.length - 1];
    if (prev && html.slice(prev.end, p.start).trim() === '') return [...acc.slice(0, -1), [...last, p]];
    return [...acc, [p]];
  }, []);
}

function sidenote(run: CitedParagraph[], refs: readonly string[]): string {
  const figures = run.map((p) => figure(p.text)).join('');
  const cited = [...new Set(run.flatMap((p) => p.cited))];
  const sources = cited.map((n) => `<span class="sidenote__source">[${n}] ${refs[n - 1]}</span>`).join('');
  return `<aside class="sidenote">${figures}${sources}</aside>`;
}

export function withSidenotes(html: string): string {
  const refs = references(html);
  if (refs.length === 0) return html;

  let out = '';
  let cursor = 0;
  for (const run of runs(citedParagraphs(html, refs), html)) {
    const start = run[0].start;
    const end = run[run.length - 1].end;
    out += html.slice(cursor, start);
    out += `<div class="sidenote-row">${html.slice(start, end)}${sidenote(run, refs)}</div>`;
    cursor = end;
  }
  return out + html.slice(cursor);
}

/** Intro (everything before the first h2) and the rest, so the takeaways box can sit between them. */
export function splitLead(html: string): { lead: string; rest: string } {
  const at = html.search(/<h2[\s>]/i);
  if (at <= 0) return { lead: '', rest: html };
  return { lead: html.slice(0, at), rest: html.slice(at) };
}
