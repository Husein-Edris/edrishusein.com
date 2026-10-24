import { describe, it, expect } from 'vitest';
import type { WordPressProject } from '@/src/types/wordpress';
import { buildHeroCopyLinks, buildHeroFrames, selectHeroProjects, HERO_FRAME_COUNT } from './hero-frames';

const image = (sourceUrl: string) => ({
  node: { sourceUrl, altText: '', mediaDetails: { width: 1600, height: 1000 } },
});

const project = (slug: string, extra: Partial<WordPressProject> = {}): WordPressProject => ({
  id: slug,
  title: slug.toUpperCase(),
  excerpt: '',
  slug,
  featuredImage: image(`https://cms.example/${slug}.jpg`),
  ...extra,
});

const client = (slug: string, liveSite: string, extra: Partial<WordPressProject> = {}) =>
  project(slug, { caseStudy: { projectLinks: { liveSite } }, ...extra });

// Mirrors the production menu order (2026-10-12).
const PROD_ORDER = [
  project('building-my-personal-website'),
  client('geschaftsbericht-fur-vorarlberger-landeskrankenhauser', 'https://geschaeftsbericht2022.landeskrankenhaus.at/'),
  client('illwerke-vkw-website-relaunch', 'https://lehre.illwerkevkw.at/'),
  project('work-os-wordpress-plugin'),
  client('zahnarztpraxis-dr-hamza-website-relaunch', 'https://zahnarztpraxislochau.at/'),
  client('fhe-gastro-website-relaunch', 'https://www.fhe.at/'),
];

describe('selectHeroProjects', () => {
  it('falls back to illwerke, VLKH and FHE Gastro, in that order, when nothing is flagged', () => {
    expect(selectHeroProjects(PROD_ORDER).map((p) => p.slug)).toEqual([
      'illwerke-vkw-website-relaunch',
      'geschaftsbericht-fur-vorarlberger-landeskrankenhauser',
      'fhe-gastro-website-relaunch',
    ]);
  });

  it('never picks a project outside the fallback trio when nothing is flagged', () => {
    const slugs = selectHeroProjects(PROD_ORDER).map((p) => p.slug);
    expect(slugs).not.toContain('zahnarztpraxis-dr-hamza-website-relaunch');
  });

  it('uses highlighted projects in menu order and caps the strip at three', () => {
    const projects = [
      client('a', 'https://a.at', { highlighted: true }),
      client('b', 'https://b.at'),
      client('c', 'https://c.at', { highlighted: true }),
      client('d', 'https://d.at', { highlighted: true }),
      client('e', 'https://e.at', { highlighted: true }),
    ];
    const selected = selectHeroProjects(projects);
    expect(selected).toHaveLength(HERO_FRAME_COUNT);
    expect(selected.map((p) => p.slug)).toEqual(['a', 'c', 'd']);
  });

  it('skips fallback slugs missing from the CMS and returns none for an empty list', () => {
    expect(selectHeroProjects(PROD_ORDER.slice(0, 3)).map((p) => p.slug)).toEqual([
      'illwerke-vkw-website-relaunch',
      'geschaftsbericht-fur-vorarlberger-landeskrankenhauser',
    ]);
    expect(selectHeroProjects([])).toEqual([]);
  });
});

describe('buildHeroFrames', () => {
  it('maps projects to frames, lead first and flagged', () => {
    const frames = buildHeroFrames([
      ...PROD_ORDER.slice(0, 5),
      client('fhe-gastro-website-relaunch', 'https://www.fhe.at/', {
        builtAt: 'Agency work',
        showcaseVideo: 'https://cms.example/clip.mp4',
      }),
    ]);

    expect(frames.map((f) => [f.slug, f.isLead])).toEqual([
      ['illwerke-vkw-website-relaunch', true],
      ['geschaftsbericht-fur-vorarlberger-landeskrankenhauser', false],
      ['fhe-gastro-website-relaunch', false],
    ]);
    expect(frames[0]).toMatchObject({
      href: '/projects/illwerke-vkw-website-relaunch',
      domain: 'lehre.illwerkevkw.at',
      builtAt: '',
      video: '',
    });
    expect(frames[2]).toMatchObject({ domain: 'fhe.at', builtAt: 'Agency work', video: 'https://cms.example/clip.mp4' });
  });

  it('leaves the domain empty when a featured project has no live site', () => {
    const [frame] = buildHeroFrames([project('own', { highlighted: true })]);
    expect(frame.domain).toBe('');
  });
});

describe('buildHeroFrames on German pages', () => {
  it('links each frame to the German case study', () => {
    const [frame] = buildHeroFrames([project('own', { highlighted: true })], 'de');
    expect(frame.href).toBe('/de/projects/own');
  });
});

describe('buildHeroCopyLinks', () => {
  it('maps the three project names to their live sites', () => {
    expect(buildHeroCopyLinks(PROD_ORDER)).toEqual([
      { phrase: 'illwerke vkw', href: 'https://lehre.illwerkevkw.at/' },
      { phrase: 'Vorarlberg state hospitals', href: 'https://geschaeftsbericht2022.landeskrankenhaus.at/' },
      { phrase: 'FHE Gastro', href: 'https://www.fhe.at/' },
    ]);
  });

  it('skips a project that is missing or has no live site', () => {
    const projects = [client('illwerke-vkw-website-relaunch', ''), client('fhe-gastro-website-relaunch', 'https://www.fhe.at/')];
    expect(buildHeroCopyLinks(projects)).toEqual([{ phrase: 'FHE Gastro', href: 'https://www.fhe.at/' }]);
  });
});
