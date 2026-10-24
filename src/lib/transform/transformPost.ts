import type { WordPressImage } from '@/src/types/wordpress';
import { transformMedia } from './transformMedia';
import { rendered } from './transformProjects';
import { decodeEntities } from './decodeEntities';
import { asArray } from './asArray';
import { resolveReadingTime } from '../reading-time';
import { detectContentLanguage, type ContentLanguage } from '../detect-language';
import { hasTranslatedContent, localizeRestItem } from '../i18n/localize';
import type { Lang } from '../i18n/lang';

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
  modified?: string;
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
  modified: string;
  featuredImage: WordPressImage | null;
  /** Minutes: the ACF reading_time when plausible, else computed from the content. */
  readingMinutes: number;
  /** The ACF reading_time that was ignored as implausible (see resolveReadingTime), else null. */
  rejectedReadingTime: number | null;
  /** Stopword guess over title, excerpt and the start of the content. */
  language: ContentLanguage;
}

export interface PostDetail extends PostListItem {
  content: string;
  author: { name: string; avatar: { url: string } | null; bio: string } | null;
  categories: Array<{ name: string; slug: string }>;
  tags: Array<{ name: string; slug: string }>;
  customTags: Array<{ tagName: string; tagColor: string }>;
  conclusionSection: { conclusionTitle: string; conclusionPoints: Array<{ pointText: string }> } | null;
}

/** Text the language guess reads: title, excerpt and the first 1000 characters of content. */
export function languageSample(title: string, excerpt: string, content: string): string {
  return `${title} ${excerpt} ${content.slice(0, 1000)}`;
}

/** REST post → list/grid item (notebook list, homepage notebook, "more articles"). */
export function transformPostListItem(post: RestPost): PostListItem {
  const featured = post._embedded?.['wp:featuredmedia']?.[0];
  const title = decodeEntities(rendered(post.title));
  const excerpt = rendered(post.excerpt);
  // List requests may omit content (_fields); the excerpt then stands in for the word count.
  const content = rendered(post.content);
  const readingTime = resolveReadingTime(post.acf?.reading_time, content || excerpt);
  return {
    id: String(post.id),
    title,
    excerpt,
    slug: post.slug,
    date: post.date ?? '',
    modified: post.modified ?? post.date ?? '',
    featuredImage: transformMedia(featured as never),
    readingMinutes: readingTime.minutes,
    rejectedReadingTime: readingTime.rejectedCmsValue,
    language: detectContentLanguage(languageSample(title, excerpt, content)),
  };
}

/** REST post → full article detail (notebook/[slug]). */
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

/**
 * A post in a page language. On German pages a post with a German body
 * (acf_fields.content_de) renders that text and is labelled German; without one
 * it keeps its original text and the language detected from it.
 */
export function localizedPostListItem(post: RestPost, lang: Lang): PostListItem {
  const item = transformPostListItem(localizeRestItem(post, lang));
  return lang === 'de' && hasTranslatedContent(post) ? { ...item, language: 'de' } : item;
}

/** Same as localizedPostListItem, for the article page. */
export function localizedPostDetail(post: RestPost, lang: Lang): PostDetail {
  const detail = transformPostDetail(localizeRestItem(post, lang));
  return lang === 'de' && hasTranslatedContent(post) ? { ...detail, language: 'de' } : detail;
}
