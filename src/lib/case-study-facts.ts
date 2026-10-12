import type { CaseStudyProject } from './transform/transformProject';
import type { SiteContent } from './transform/transformSiteContent';

// Rows of the case study facts column (design 3B). A row exists only when its
// value is filled in the CMS, so an unknown fact is never shown as a placeholder.

export type FactRow =
  | { readonly key: 'client' | 'role' | 'year' | 'builtAt'; readonly kind: 'text'; readonly label: string; readonly text: string }
  | { readonly key: 'stack'; readonly kind: 'stack'; readonly label: string; readonly technologies: CaseStudyProject['caseStudy']['projectOverview']['technologies'] }
  | { readonly key: 'liveSite' | 'github'; readonly kind: 'link'; readonly label: string; readonly href: string; readonly text: string };

/** Short visible text for a link: host without www, plus the path for GitHub repos. */
export function linkText(url: string, withPath = false): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace(/^www\./, '');
    const path = parsed.pathname.replace(/^\/+|\/+$/g, '');
    return withPath && path ? path : host;
  } catch {
    return url;
  }
}

function isHttpUrl(value: string): boolean {
  return /^https?:\/\//i.test(value.trim());
}

export function buildFactRows(project: CaseStudyProject, copy: SiteContent['caseStudy']): FactRow[] {
  const rows: FactRow[] = [];
  const texts = [
    ['client', copy.factsClientLabel, project.facts.client],
    ['role', copy.factsRoleLabel, project.facts.role],
    ['year', copy.factsYearLabel, project.facts.year],
    ['builtAt', copy.factsBuiltAtLabel, project.facts.builtAt],
  ] as const;

  for (const [key, label, text] of texts) {
    if (text) rows.push({ key, kind: 'text', label, text });
  }

  const technologies = project.caseStudy.projectOverview.technologies.filter((tech) => tech.title);
  if (technologies.length > 0) {
    rows.push({ key: 'stack', kind: 'stack', label: copy.factsStackLabel, technologies });
  }

  const { liveSite, github } = project.caseStudy.projectLinks;
  if (isHttpUrl(liveSite)) {
    rows.push({ key: 'liveSite', kind: 'link', label: copy.factsLiveSiteLabel, href: liveSite.trim(), text: linkText(liveSite) });
  }
  if (isHttpUrl(github)) {
    rows.push({ key: 'github', kind: 'link', label: copy.factsGithubLabel, href: github.trim(), text: linkText(github, true) });
  }

  return rows;
}
