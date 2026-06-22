import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { transformProjects, transformProjectListItem } from './transformProjects';

const list = JSON.parse(
  readFileSync(resolve(__dirname, '__fixtures__/project-list.json'), 'utf-8'),
);

describe('transformProjects', () => {
  it('maps the REST project array into ProjectsResponse, preserving order', () => {
    const result = transformProjects(list);
    expect(result.projects.nodes.length).toBe(list.length);
    // fixture was fetched orderby=menu_order asc — order is preserved 1:1
    expect(result.projects.nodes[0].slug).toBe(list[0].slug);
  });

  it('maps title/excerpt/slug, featured image, and project links', () => {
    const node = transformProjectListItem(list[0]);
    expect(typeof node.title).toBe('string');
    expect(node.title.length).toBeGreaterThan(0);
    expect(node.slug).toBe(list[0].slug);
    expect(node.caseStudy?.projectLinks).toBeDefined();
    // featured image, when present, is normalized to the {node:{sourceUrl}} shape
    if (list[0]._embedded?.['wp:featuredmedia']?.[0]) {
      expect(node.featuredImage?.node.sourceUrl).toContain('http');
    }
  });

  it('handles an empty array', () => {
    expect(transformProjects([]).projects.nodes).toEqual([]);
  });
});
