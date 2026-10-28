import type { HeroSection } from '@/src/types/wordpress';
import { cmsText } from '@/src/lib/cms-text';
import { localePath } from '@/src/lib/i18n/paths';
import { DEFAULT_LANG, type Lang } from '@/src/lib/i18n/lang';

// Code defaults for the hero copy. Each one renders until its ACF field in the
// homepage `hero_section` group is filled (theme inc/acf-fields/homepage.php).
export const HERO_DEFAULTS = {
  eyebrow: 'Servus from Dornbirn 👋 🇦🇹',
  heading: 'Websites built with Gründlichkeit. Fixed properly, planned ahead.',
  primaryCtaLabel: 'Email me',
  primaryCtaUrl: 'mailto:kontakt@edrishusein.com',
  secondaryCtaLabel: 'See all projects',
  secondaryCtaUrl: '/projects',
} as const;

// German code defaults (register: Sie); the URLs stay the same and are
// localized when resolved.
export const HERO_DEFAULTS_DE: { readonly [K in keyof typeof HERO_DEFAULTS]: string } = {
  eyebrow: 'Servus aus Dornbirn 👋 🇦🇹',
  heading: 'Servus. Ich baue Websites, repariere sie und helfe Ihnen zu planen, was als Nächstes kommt.',
  primaryCtaLabel: 'E-Mail schreiben',
  primaryCtaUrl: HERO_DEFAULTS.primaryCtaUrl,
  secondaryCtaLabel: 'Alle Projekte ansehen',
  secondaryCtaUrl: HERO_DEFAULTS.secondaryCtaUrl,
};

/** Hero paragraph shown while Home > Hero > Hero Copy is empty. */
export const HERO_FALLBACK_COPY: Readonly<Record<Lang, string>> = {
  en: 'I build and look after websites and web solutions for businesses and agencies.',
  de: 'Ich baue und betreue Websites und Weblösungen für Unternehmen und Agenturen.',
};

export interface HeroContent {
  eyebrow: string;
  heading: string;
  primaryCta: { label: string; url: string };
  secondaryCta: { label: string; url: string };
}

export function resolveHeroContent(data?: HeroSection | null, lang: Lang = DEFAULT_LANG): HeroContent {
  const defaults = lang === 'de' ? HERO_DEFAULTS_DE : HERO_DEFAULTS;
  return {
    eyebrow: cmsText(data?.eyebrow, defaults.eyebrow),
    heading: cmsText(data?.heading, defaults.heading),
    primaryCta: {
      label: cmsText(data?.primaryCtaLabel, defaults.primaryCtaLabel),
      url: localePath(cmsText(data?.primaryCtaUrl, defaults.primaryCtaUrl), lang),
    },
    secondaryCta: {
      label: cmsText(data?.secondaryCtaLabel, defaults.secondaryCtaLabel),
      url: localePath(cmsText(data?.secondaryCtaUrl, defaults.secondaryCtaUrl), lang),
    },
  };
}

/** Site paths go through next/link; mailto:, tel: and absolute URLs stay plain anchors. */
export function isInternalPath(url: string): boolean {
  return url.startsWith('/') && !url.startsWith('//');
}
