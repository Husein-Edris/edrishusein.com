'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_LANG, type Lang } from '@/src/lib/i18n/lang';
import { SITE_CONTENT_DEFAULTS, type NavContent } from '@/src/lib/transform/transformSiteContent';
import type { ServiceSlugPair } from '@/src/lib/i18n/language-switch';

// The page language and the CMS navigation labels for client components
// (Header, cookie UI, testimonials controls). Set once by the [lang] root
// layout; server components get the language from route params instead.
interface LangContextValue {
  lang: Lang;
  nav: NavContent;
  /** Both slugs of every service page; the Services nav link shows only when there is one. */
  serviceSlugs?: ServiceSlugPair[];
}

const NO_SERVICES: ServiceSlugPair[] = [];

const LangContext = createContext<LangContextValue>({ lang: DEFAULT_LANG, nav: SITE_CONTENT_DEFAULTS.nav, serviceSlugs: NO_SERVICES });

export default function LangProvider({ lang, nav, serviceSlugs = NO_SERVICES, children }: LangContextValue & { children: ReactNode }) {
  return <LangContext.Provider value={{ lang, nav, serviceSlugs }}>{children}</LangContext.Provider>;
}

/** The page language; English outside the provider (tests, isolated renders). */
export function useLang(): Lang {
  return useContext(LangContext).lang;
}

/** Navigation labels from Site Content in the page language. */
export function useNavLabels(): NavContent {
  return useContext(LangContext).nav;
}

/** Both slugs of every service page (none outside the provider). */
export function useServiceSlugs(): ServiceSlugPair[] {
  return useContext(LangContext).serviceSlugs ?? NO_SERVICES;
}
