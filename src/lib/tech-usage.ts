import type { WordPressImage } from '@/src/types/wordpress';
import { asArray } from './transform/asArray';
import { decodeEntities } from './transform/decodeEntities';
import { transformMedia } from './transform/transformMedia';
import { rendered } from './transform/transformProjects';
import { type SiteContent } from './transform/transformSiteContent';

// Tech stack logo grid (design A4): one tile per tech post with its short
// description (the post excerpt), ordered by how many case studies list it in
// project_overview.tech_stack, filterable by the tech_category taxonomy.

/** Filter key of the "All" tab. */
export const ALL_KEY = 'all';
/** Filter key of the tab for tools without a tech_category term. */
export const OTHER_KEY = 'other';

export interface TechGridItem {
  readonly id: string;
  readonly title: string;
  /** Case studies that use it; only orders the tiles, not shown. */
  readonly count: number;
  /** Short description from the post excerpt, '' when empty. */
  readonly description: string;
  /** Optional ACF usage_note, '' when empty. */
  readonly usageNote: string;
  readonly logo: WordPressImage | null;
  /** Filter keys this tile belongs to: `cat-<term id>` per category, or OTHER_KEY. */
  readonly filterKeys: readonly string[];
}

export interface TechFilterTab {
  readonly key: string;
  readonly label: string;
  readonly count: number;
}

export interface TechGrid {
  readonly items: readonly TechGridItem[];
  /** All tab first, then categories by name, Other last. Empty when there is nothing to filter. */
  readonly tabs: readonly TechFilterTab[];
}

export type TechGridLabels = Pick<SiteContent['techStackPage'], 'allLabel' | 'otherLabel'>;

function record(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

/**
 * Number of case studies per tech ID. A project that lists the same tech twice
 * counts once.
 */
export function caseStudyCountsByTech(projects: readonly unknown[]): Map<number, number> {
  const counts = new Map<number, number>();
  for (const project of projects.map(record)) {
    const overview = record(record(project.acf_fields).project_overview);
    const ids = new Set(
      asArray<{ ID?: unknown; id?: unknown }>(overview.tech_stack as never)
        .map((tech) => Number(tech?.ID ?? tech?.id))
        .filter((id) => Number.isFinite(id)),
    );
    for (const id of ids) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return counts;
}

/** Plain text of a rendered excerpt: tags stripped, entities decoded, whitespace collapsed. */
function plainText(html: string): string {
  return decodeEntities(html.replace(/<[^>]*>/g, ' ')).replace(/\s+/g, ' ').trim();
}

function categoryNames(categories: readonly unknown[]): Map<number, string> {
  const names = new Map<number, string>();
  for (const term of categories.map(record)) {
    const id = Number(term.id);
    const name = typeof term.name === 'string' ? decodeEntities(term.name).trim() : '';
    if (Number.isFinite(id) && name) names.set(id, name);
  }
  return names;
}

function byName(a: string, b: string): number {
  return a.localeCompare(b, 'en', { sensitivity: 'base' });
}

/**
 * Tiles sorted by case study count (most first), then by name, plus the filter
 * tabs with their counts. Tabs stay empty unless at least one tool has a real
 * category: an "All" and "Other" pair holding the same tiles filters nothing.
 */
export function buildTechGrid(
  techs: readonly unknown[],
  projects: readonly unknown[],
  categories: readonly unknown[],
  labels: TechGridLabels,
): TechGrid {
  const counts = caseStudyCountsByTech(projects);
  const names = categoryNames(categories);

  const items: TechGridItem[] = techs
    .map(record)
    .map((tech) => {
      const id = Number(tech.id);
      const note = record(tech.acf_fields).usage_note;
      const termIds = asArray<unknown>(tech.tech_category as never)
        .map(Number)
        .filter((termId) => names.has(termId));
      const featured = asArray<unknown>(record(tech._embedded)['wp:featuredmedia'] as never)[0];
      return {
        id: String(tech.id),
        title: decodeEntities(rendered(tech.title as never)).trim(),
        count: counts.get(id) ?? 0,
        description: plainText(rendered(tech.excerpt as never)),
        usageNote: typeof note === 'string' ? note.trim() : '',
        logo: transformMedia(featured as never),
        filterKeys: termIds.length > 0 ? [...new Set(termIds)].map((termId) => `cat-${termId}`) : [OTHER_KEY],
      };
    })
    .filter((item) => item.title)
    .sort((a, b) => b.count - a.count || byName(a.title, b.title));

  const tally = new Map<string, number>();
  for (const item of items) {
    for (const key of item.filterKeys) tally.set(key, (tally.get(key) ?? 0) + 1);
  }

  const categoryTabs = [...names]
    .map(([termId, name]) => ({ key: `cat-${termId}`, label: name, count: tally.get(`cat-${termId}`) ?? 0 }))
    .filter((tab) => tab.count > 0)
    .sort((a, b) => byName(a.label, b.label));

  if (categoryTabs.length === 0) return { items, tabs: [] };

  const otherCount = tally.get(OTHER_KEY) ?? 0;
  return {
    items,
    tabs: [
      { key: ALL_KEY, label: labels.allLabel, count: items.length },
      ...categoryTabs,
      ...(otherCount > 0 ? [{ key: OTHER_KEY, label: labels.otherLabel, count: otherCount }] : []),
    ],
  };
}

/** True when the tile shows under the chosen filter tab. */
export function isInFilter(item: Pick<TechGridItem, 'filterKeys'>, key: string): boolean {
  return key === ALL_KEY || item.filterKeys.includes(key);
}
