import type { ContentLanguage } from '@/src/lib/detect-language';
import { fillLabel, type SiteContent } from '@/src/lib/transform/transformSiteContent';
import { DATE_LOCALE, DEFAULT_LANG, type Lang } from '@/src/lib/i18n/lang';
import './PostMeta.scss';

export type PostMetaLabels = Pick<
  SiteContent['notebookPage'],
  'readingTimeFormat' | 'languageDeLabel' | 'languageEnLabel'
>;

interface PostMetaProps {
  /** ISO date from WordPress; the date is left out when it does not parse. */
  date: string;
  readingMinutes: number;
  language: ContentLanguage;
  labels: PostMetaLabels;
  className?: string;
  /** Page language, for the date format. */
  lang?: Lang;
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

/**
 * "13 Aug 2026" (German: "13. Aug. 2026") from a WordPress date. WordPress
 * sends the site's local time without an offset, so the calendar date is read
 * straight from the string: no time zone conversion, and server and browser
 * always agree.
 */
export function formatPostDate(wpDate: string, lang: Lang = DEFAULT_LANG): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})/.exec(wpDate);
  if (!match) return '';
  const [, year, month, day] = match;
  const monthName = MONTHS[Number(month) - 1];
  if (!monthName) return '';
  if (lang === 'en') return `${Number(day)} ${monthName} ${year}`;
  const utc = new Date(Date.UTC(Number(year), Number(month) - 1, Number(day)));
  return new Intl.DateTimeFormat(DATE_LOCALE[lang], { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(utc);
}

/** Date, reading time and language badge of a notebook post (cards and article header). */
export default function PostMeta({ date, readingMinutes, language, labels, className, lang = DEFAULT_LANG }: PostMetaProps) {
  const formatted = formatPostDate(date, lang);
  const parts = [
    formatted ? (
      <time key="date" dateTime={date}>
        {formatted}
      </time>
    ) : null,
    <span key="reading">{fillLabel(labels.readingTimeFormat, { minutes: readingMinutes })}</span>,
    <span key="lang" className={`post-meta__lang post-meta__lang--${language}`}>
      {language === 'de' ? labels.languageDeLabel : labels.languageEnLabel}
    </span>,
  ].filter(Boolean);

  return (
    <p className={['post-meta', className].filter(Boolean).join(' ')}>
      {parts.map((part, index) => (
        <span key={index} className="post-meta__item">
          {index > 0 && (
            <span className="post-meta__dot" aria-hidden="true">
              ·
            </span>
          )}
          {part}
        </span>
      ))}
    </p>
  );
}
