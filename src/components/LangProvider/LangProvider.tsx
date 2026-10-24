'use client';

import { createContext, useContext, type ReactNode } from 'react';
import { DEFAULT_LANG, type Lang } from '@/src/lib/i18n/lang';
import { SITE_CONTENT_DEFAULTS, type NavContent } from '@/src/lib/transform/transformSiteContent';

// The page language and the CMS navigation labels for client components
// (Header, cookie UI, testimonials controls). Set once by the [lang] root
// layout; server components get the language from route params instead.
interface LangContextValue {
  lang: Lang;
  nav: NavContent;
}

const LangContext = createContext<LangContextValue>({ lang: DEFAULT_LANG, nav: SITE_CONTENT_DEFAULTS.nav });

export default function LangProvider({ lang, nav, children }: LangContextValue & { children: ReactNode }) {
  return <LangContext.Provider value={{ lang, nav }}>{children}</LangContext.Provider>;
}

/** The page language; English outside the provider (tests, isolated renders). */
export function useLang(): Lang {
  return useContext(LangContext).lang;
}

/** Navigation labels from Site Content in the page language. */
export function useNavLabels(): NavContent {
  return useContext(LangContext).nav;
}
