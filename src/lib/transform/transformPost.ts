import type { WordPressImage } from '@/src/types/wordpress';
import { transformMedia } from './transformMedia';
import { rendered } from './transformProjects';
import { asArray } from './asArray';

interface RestTerm { name?: string; slug?: string; taxonomy?: string }

interface PostAcf {
  reading_time?: string | number;
  author_bio_override?: string;
  custom_tags?: Array<{ tag_name?: string; tag_color?: string }> | false;
  conclusion_section?: {
    conclusion_title?: string;
    conclusion_points?: Array<{ point_text?: string }>;
  } | false;
}

export interface RestPost {
  id: number | string;
  slug: string;
  date?: string;
  title?: { rendered?: string } | string;
  excerpt?: { rendered?: string } | string;
  content?: { rendered?: string } | string;
  acf?: PostAcf;
  _embedded?: {
    author?: Array<{ name?: string; description?: string; avatar_urls?: Record<string, string> }>;
    'wp:featuredmedia'?: unknown[];
    'wp:term'?: RestTerm[][];
  };
}

export interface PostListItem {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  date: string;
  featuredImage: WordPressImage | null;
  readingTime: string;
}

export interface PostDetail extends PostListItem {
  content: string;
  author: { name: string; avatar: { url: string } | null; bio: string } | null;
  categories: Array<{ name: string; slug: string }>;
  tags: Array<{ name: string; slug: string }>;
  customTags: Array<{ tagName: string; tagColor: string }>;
  conclusionSection: { conclusionTitle: string; conclusionPoints: Array<{ pointText: string }> } | null;
}

const WORDS_PER_MINUTE = 200;

export function calculateReadingTime(html: string): string {
  const words = html.replace(/<[^>]*>/g, '').split(/\s+/).filter(Boolean).length;
  return `${Math.max(1, Math.ceil(words / WORDS_PER_MINUTE))} min read`;
}

function readingTimeFrom(acf: PostAcf | undefined, content: string): string {
  const rt = acf?.reading_time;
  if (rt !== undefined && rt !== null && `${rt}`.trim() !== '') {
    // ACF stores a bare number of minutes; present it consistently.
    return /^\d+$/.test(`${rt}`.trim()) ? `${rt} min read` : `${rt}`;
  }
  return calculateReadingTime(content);
}

/** REST post → list/grid item (notebook list, homepage notebook, "more articles"). */
export function transformPostListItem(post: RestPost): PostListItem {
  const featured = post._embedded?.['wp:featuredmedia']?.[0];
  return {
    id: String(post.id),
    title: rendered(post.title),
    excerpt: rendered(post.excerpt),
    slug: post.slug,
    date: post.date ?? '',
    featuredImage: transformMedia(featured as never),
    readingTime: readingTimeFrom(post.acf, rendered(post.excerpt)),
  };
}

/** REST post → full article detail (notebook/[slug], api/post?slug). */
export function transformPostDetail(post: RestPost): PostDetail {
  const content = rendered(post.content);
  const termGroups = post._embedded?.['wp:term'] ?? [];
  const terms = termGroups.flat();
  const authorNode = post._embedded?.author?.[0];
  const acf = post.acf;

  const conclusion = acf?.conclusion_section || null;
  const customTags = Array.isArray(acf?.custom_tags) ? acf!.custom_tags : [];

  return {
    ...transformPostListItem(post),
    content,
    readingTime: readingTimeFrom(acf, content || rendered(post.excerpt)),
    author: authorNode
      ? {
          name: authorNode.name ?? 'Edris Husein',
          avatar: authorNode.avatar_urls?.['96'] ? { url: authorNode.avatar_urls['96'] } : null,
          bio: acf?.author_bio_override || authorNode.description || '',
        }
      : null,
    categories: terms
      .filter((t) => t.taxonomy === 'category')
      .map((t) => ({ name: t.name ?? '', slug: t.slug ?? '' })),
    tags: terms
      .filter((t) => t.taxonomy === 'post_tag')
      .map((t) => ({ name: t.name ?? '', slug: t.slug ?? '' })),
    customTags: customTags.map((t) => ({ tagName: t.tag_name ?? '', tagColor: t.tag_color ?? '' })),
    conclusionSection: conclusion
      ? {
          conclusionTitle: conclusion.conclusion_title ?? '',
          conclusionPoints: asArray<{ point_text?: string }>(conclusion.conclusion_points).map((p) => ({ pointText: p.point_text ?? '' })),
        }
      : null,
  };
}
