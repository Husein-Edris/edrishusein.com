// Which projects lead /projects as large features.
// Rule: projects flagged `highlighted` in the CMS, in the order received (the
// REST query sorts by menu_order). Until any project is flagged, fall back to
// the fixed pair below, in this order.
export const FALLBACK_FEATURED_SLUGS = [
  'illwerke-vkw-website-relaunch',
  'geschaftsbericht-fur-vorarlberger-landeskrankenhauser',
] as const;

// The homepage hero strip (design H9) shows three frames. Until any project is
// flagged, these three, in this order; the first is the lead (middle) frame.
// Agreed with Edris 2026-10-12: all three are agency work.
export const HERO_FALLBACK_SLUGS = [
  'illwerke-vkw-website-relaunch',
  'geschaftsbericht-fur-vorarlberger-landeskrankenhauser',
  'fhe-gastro-website-relaunch',
] as const;

export interface FeaturableProject {
  slug: string;
  highlighted?: boolean;
}

export interface FeaturedSplit<T> {
  featured: T[];
  rest: T[];
}

export function selectFeaturedProjects<T extends FeaturableProject>(projects: readonly T[]): FeaturedSplit<T> {
  const flagged = projects.filter((project) => project.highlighted === true);

  const featured =
    flagged.length > 0
      ? flagged
      : FALLBACK_FEATURED_SLUGS.map((slug) => projects.find((project) => project.slug === slug)).filter(
          (project): project is T => project !== undefined,
        );

  const rest = projects.filter((project) => !featured.includes(project));
  return { featured, rest };
}
