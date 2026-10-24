'use client';

import Link from 'next/link';
import { useLang } from '@/src/components/LangProvider/LangProvider';
import { localePath } from '@/src/lib/i18n/paths';
import type { Lang } from '@/src/lib/i18n/lang';
import type { SiteContent } from '@/src/lib/transform/transformSiteContent';

// not-found.tsx receives no route params, so the server passes the text of both
// languages and the page language (set by the [lang] layout) picks one.
export default function NotFoundView({ copy }: { copy: Readonly<Record<Lang, SiteContent['notFound']>> }) {
  const lang = useLang();
  const text = copy[lang];
  return (
    <div className="not-found-page">
      <div className="container">
        <h2>{text.heading}</h2>
        <p>{text.text}</p>
        <Link href={localePath('/', lang)}>{text.homeLinkLabel}</Link>
      </div>
    </div>
  );
}
