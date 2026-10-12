import { describe, it, expect } from 'vitest';
import { selectFeaturedProjects } from './featured-projects';
import { transformProjectListItem } from './transform/transformProjects';

const project = (slug: string, highlighted?: boolean) => ({ slug, highlighted });

describe('selectFeaturedProjects', () => {
  it('features flagged projects in the incoming menu order', () => {
    const projects = [project('a'), project('b', true), project('c'), project('d', true)];
    const { featured, rest } = selectFeaturedProjects(projects);
    expect(featured.map((p) => p.slug)).toEqual(['b', 'd']);
    expect(rest.map((p) => p.slug)).toEqual(['a', 'c']);
  });

  it('falls back to illwerke then VLKH when nothing is flagged', () => {
    const projects = [
      project('building-my-personal-website'),
      project('geschaftsbericht-fur-vorarlberger-landeskrankenhauser'),
      project('illwerke-vkw-website-relaunch'),
      project('work-os-wordpress-plugin'),
    ];
    const { featured, rest } = selectFeaturedProjects(projects);
    expect(featured.map((p) => p.slug)).toEqual([
      'illwerke-vkw-website-relaunch',
      'geschaftsbericht-fur-vorarlberger-landeskrankenhauser',
    ]);
    expect(rest.map((p) => p.slug)).toEqual(['building-my-personal-website', 'work-os-wordpress-plugin']);
  });

  it('skips fallback slugs that are missing and features nothing for an empty list', () => {
    expect(selectFeaturedProjects([project('illwerke-vkw-website-relaunch')]).featured).toHaveLength(1);
    expect(selectFeaturedProjects([])).toEqual({ featured: [], rest: [] });
  });

  it('coerces the ACF REST values before selecting', () => {
    const raw = [
      { id: 1, slug: 'one', acf_fields: { highlighted: '0' } },
      { id: 2, slug: 'two', acf_fields: { highlighted: '1' } },
      { id: 3, slug: 'three', acf_fields: { highlighted: null } },
      { id: 4, slug: 'four', acf_fields: { highlighted: true } },
      { id: 5, slug: 'five', acf_fields: {} },
    ].map(transformProjectListItem);
    expect(selectFeaturedProjects(raw).featured.map((p) => p.slug)).toEqual(['two', 'four']);
  });
});
