import { describe, it, expect } from 'vitest';
import { buildFactRows, linkText } from './case-study-facts';
import { transformSiteContent } from './transform/transformSiteContent';
import type { CaseStudyProject } from './transform/transformProject';

const copy = transformSiteContent({}).caseStudy;

function project(overrides: Partial<CaseStudyProject['facts']> = {}, links = { liveSite: '', github: '' }, techs: string[] = []): CaseStudyProject {
  return {
    id: '1',
    title: 'Test',
    slug: 'test',
    content: '',
    excerpt: '',
    featuredImage: null,
    caseStudy: {
      projectOverview: { technologies: techs.map((title, i) => ({ id: i + 1, title, featuredImage: null })) },
      projectContent: { challenge: '', solution: '', keyFeatures: [] },
      projectLinks: links,
      projectGallery: [],
    },
    facts: { client: '', role: '', year: '', builtAt: '', ...overrides },
  };
}

describe('buildFactRows', () => {
  it('returns no rows when nothing is filled', () => {
    expect(buildFactRows(project(), copy)).toEqual([]);
  });

  it('shows only the filled facts, in the fixed order, with the Site Content labels', () => {
    const rows = buildFactRows(project({ year: '2025', client: 'illwerke vkw' }), copy);
    expect(rows.map((row) => [row.label, row.kind === 'text' ? row.text : ''])).toEqual([
      ['Client', 'illwerke vkw'],
      ['Year', '2025'],
    ]);
  });

  it('adds stack, live site and GitHub rows from the existing relation and links', () => {
    const rows = buildFactRows(
      project({ builtAt: 'Freelance' }, { liveSite: 'https://www.example.at/', github: 'https://github.com/a/b' }, ['PHP', '']),
      transformSiteContent({ case_study_facts_github_label: 'Source' }).caseStudy,
    );
    expect(rows.map((row) => row.key)).toEqual(['builtAt', 'stack', 'liveSite', 'github']);
    const stack = rows[1];
    expect(stack.kind === 'stack' && stack.technologies.map((t) => t.title)).toEqual(['PHP']);
    expect(rows[2]).toMatchObject({ label: 'Live site', href: 'https://www.example.at/', text: 'example.at' });
    expect(rows[3]).toMatchObject({ label: 'Source', text: 'a/b' });
  });

  it('drops a link that is not an http(s) URL', () => {
    expect(buildFactRows(project({}, { liveSite: '#', github: 'javascript:alert(1)' }), copy)).toEqual([]);
  });
});

describe('linkText', () => {
  it('falls back to the raw value for an unparsable URL', () => {
    expect(linkText('not a url')).toBe('not a url');
  });

  it('uses the host when a GitHub link has no path', () => {
    expect(linkText('https://github.com/', true)).toBe('github.com');
  });
});
