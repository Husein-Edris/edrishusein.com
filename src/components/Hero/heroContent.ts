import type { HeroSection } from '@/src/types/wordpress';
import { cmsText } from '@/src/lib/cms-text';

// Code defaults for the hero copy. Each one renders until its ACF field in the
// homepage `hero_section` group is filled (theme inc/acf-fields/homepage.php).
export const HERO_DEFAULTS = {
  eyebrow: 'Edris Husein, Dornbirn, Austria',
  heading: 'Servus. I build websites, fix them and help you plan what comes next.',
  primaryCtaLabel: 'Email me',
  primaryCtaUrl: 'mailto:kontakt@edrishusein.com',
  secondaryCtaLabel: 'See all projects',
  secondaryCtaUrl: '/projects',
} as const;

export interface HeroContent {
  eyebrow: string;
  heading: string;
  primaryCta: { label: string; url: string };
  secondaryCta: { label: string; url: string };
}

export function resolveHeroContent(data?: HeroSection | null): HeroContent {
  return {
    eyebrow: cmsText(data?.eyebrow, HERO_DEFAULTS.eyebrow),
    heading: cmsText(data?.heading, HERO_DEFAULTS.heading),
    primaryCta: {
      label: cmsText(data?.primaryCtaLabel, HERO_DEFAULTS.primaryCtaLabel),
      url: cmsText(data?.primaryCtaUrl, HERO_DEFAULTS.primaryCtaUrl),
    },
    secondaryCta: {
      label: cmsText(data?.secondaryCtaLabel, HERO_DEFAULTS.secondaryCtaLabel),
      url: cmsText(data?.secondaryCtaUrl, HERO_DEFAULTS.secondaryCtaUrl),
    },
  };
}

/** Site paths go through next/link; mailto:, tel: and absolute URLs stay plain anchors. */
export function isInternalPath(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}
