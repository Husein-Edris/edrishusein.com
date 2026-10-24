import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { dictionary } from '@/src/lib/i18n/dictionary';
import { langFromParams, type LangParams } from '@/src/lib/i18n/route';

// Every path that matches no page: the proxy sends unknown English paths here
// as /en/..., German ones arrive as /de/.... notFound() renders
// app/[lang]/not-found.tsx inside the [lang] layout, so the 404 page has the
// right <html lang> and text, with status 404.
// Rendered per request and never cached, so random URLs do not fill the ISR
// cache. Like every runtime notFound() in Next 16 (also /projects/<unknown>),
// the server HTML is Next's error shell with status 404 and the not-found page
// renders from the inlined payload on hydration.
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: LangParams): Promise<Metadata> {
  const text = dictionary(await langFromParams(params)).notFoundMeta;
  return { title: text.title, description: text.description, robots: 'noindex, nofollow' };
}

export default function CatchAll() {
  notFound();
}
