import { notFound } from 'next/navigation';
import { LANGS, isLang, type Lang } from './lang';

// Route helpers for app/[lang]. The proxy (proxy.ts) serves English at
// unprefixed URLs by rewriting them to /en/..., and German at /de/....

export interface LangParams {
  params: Promise<{ lang: string }>;
}

/** generateStaticParams of the [lang] segment: one build per language. */
export function langStaticParams(): Array<{ lang: Lang }> {
  return LANGS.map((lang) => ({ lang }));
}

/** The page language from route params; anything else is a 404. */
export async function langFromParams(params: Promise<{ lang: string }>): Promise<Lang> {
  const { lang } = await params;
  if (!isLang(lang)) notFound();
  return lang;
}
