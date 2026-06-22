import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { transformProject, extractTechIds } from './transformProject';
import type { WordPressImage } from '@/src/types/wordpress';

const detail = JSON.parse(
  readFileSync(resolve(__dirname, '__fixtures__/project-detail.json'), 'utf-8'),
)[0];

describe('extractTechIds', () => {
  it('pulls numeric tech post IDs from the tech_stack relation', () => {
    const ids = extractTechIds(detail);
    expect(ids.length).toBeGreaterThan(0);
    expect(ids.every((n) => Number.isFinite(n))).toBe(true);
  });
});

describe('transformProject', () => {
  const result = transformProject(detail);

  it('maps core fields and case study content', () => {
    expect(result.title.length).toBeGreaterThan(0);
    expect(result.slug).toBe(detail.slug);
    expect(result.caseStudy.projectContent.challenge).toContain('<p>');
    expect(result.caseStudy.projectLinks.github).toContain('github.com');
  });

  it('reads key_features from the top of acf_fields as text-only items (C5)', () => {
    const kf = result.caseStudy.projectContent.keyFeatures;
    expect(kf.length).toBeGreaterThan(0);
    expect(kf[0]).toHaveProperty('title');
    expect(kf[0]).toHaveProperty('description');
    expect(kf[0]).not.toHaveProperty('image');
  });

  it('passes through the project gallery with url/alt/dimensions', () => {
    const g = result.caseStudy.projectGallery;
    expect(g.length).toBeGreaterThan(0);
    expect(g[0]).toHaveProperty('url');
  });

  it('FR-8: technologies get images from the supplied techImages map (none → null)', () => {
    const ids = extractTechIds(detail);
    const fakeImg: WordPressImage = {
      node: { sourceUrl: 'https://x/php.svg', altText: 'PHP', mediaDetails: { width: 40, height: 40 } },
    };
    const withImages = transformProject(detail, new Map([[ids[0], fakeImg]]));
    const techs = withImages.caseStudy.projectOverview.technologies;
    expect(techs.length).toBe(ids.length);
    expect(techs.find((t) => t.id === ids[0])?.featuredImage?.node.sourceUrl).toBe('https://x/php.svg');
    // a tech with no entry in the map resolves to null, not undefined
    expect(result.caseStudy.projectOverview.technologies[0].featuredImage).toBeNull();
  });
});
