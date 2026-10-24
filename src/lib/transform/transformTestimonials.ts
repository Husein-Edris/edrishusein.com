import { asArray } from './asArray';
import { cmsText } from '@/src/lib/cms-text';
import { decodeEntities } from './decodeEntities';
import { transformMedia, type RestMedia } from './transformMedia';
import type { Lang } from '../i18n/lang';

export type TestimonialLang = 'en' | 'de';

export interface Testimonial {
  /** Client feedback, lightly edited for flow; meaning unchanged. */
  quote: string;
  /** Client name as shown publicly (full name from the client's own site), e.g. "Leon Heuser". */
  name: string;
  /** Role and company shown under the client name, e.g. "Managing Director, ReviewForest". Empty hides it. */
  context: string;
  lang: TestimonialLang;
  /** Optional client logo (ACF image), shown small and monochrome before the name. */
  logo: TestimonialLogo | null;
  /** Optional client website (absolute http(s) only); empty = no link. */
  websiteUrl: string;
}

export interface TestimonialLogo {
  url: string;
  alt: string;
  width: number;
  height: number;
}

export interface TestimonialsSection {
  title: string;
  /** Visible label of the previous-quote button, e.g. "Prev". */
  prevLabel: string;
  /** Visible label of the next-quote button, e.g. "Next". */
  nextLabel: string;
  items: Testimonial[];
}

// Code defaults: the seven quotes shown on the homepage, used when the Home page
// picks no testimonials. All reviews live as Testimonial posts in WP
// (scripts/seed-testimonials.php); originals: docs/testimonials-2026-10-12.md.
const item = (quote: string, name: string, extra: Partial<Testimonial> = {}): Testimonial => ({
  quote,
  name,
  context: '',
  lang: 'en',
  logo: null,
  websiteUrl: '',
  ...extra,
});

export const DEFAULT_TESTIMONIALS_SECTION: TestimonialsSection = {
  title: 'What clients say',
  prevLabel: 'Prev',
  nextLabel: 'Next',
  items: [
    item(
      "Edris is the best WordPress developer and designer I've worked with. He's quick and always finds a solution. He designs the site first and takes feedback before he builds.",
      'Leon Heuser',
      {
        context: 'Managing Director, ReviewForest',
        logo: { url: '/images/clients/reviewforest.svg', alt: 'ReviewForest', width: 84, height: 40 },
        websiteUrl: 'https://reviewforest.org/',
      }
    ),
    item(
      'Edris helped me finish my online shop in a few weeks. He kept in touch by video call the whole time and explained what he was doing and what I needed to do.',
      'Chloé Kuhlow',
      {
        context: 'Owner, Campzilla',
        logo: { url: '/images/clients/campzilla-wordmark.png', alt: 'Campzilla', width: 411, height: 74 },
        websiteUrl: 'https://campzilla-shop.com/',
      }
    ),
    item(
      'Edris is an exceptional developer. His technical skills are top-notch and he communicates clearly through the whole project.',
      'Guntram Bechtold',
      {
        context: 'Founder and Managing Director, Stars Media',
        logo: { url: '/images/clients/starsmedia.svg', alt: 'Stars Media', width: 348, height: 57 },
        websiteUrl: 'https://www.starsmedia.com/',
      }
    ),
    // Martina Velmeden and Christoph Santner: platform and tool names left out.
    item(
      "Edris took care of my new website and its redesign. He organised the whole move to the new platform, made it much easier and handled everything very professionally. He also helped move the site to another host. I'm glad I found him and will definitely book him again.",
      'Martina Velmeden',
      {
        context: 'Interior architect, Velmeden Atelier',
        logo: { url: '/images/clients/velmeden-atelier.png', alt: 'Velmeden Atelier', width: 300, height: 16 },
        websiteUrl: 'https://velmeden-atelier.de/',
      }
    ),
    item(
      'I worked with Edris again on setting up a new website. He is a great web developer: absolutely reliable, on time and fast. Really outstanding work, and I can fully recommend him.',
      'Christoph Santner',
      {
        context: 'Founder, Alles KI',
        logo: { url: '/images/clients/alleski.png', alt: 'Alles KI', width: 300, height: 99 },
        websiteUrl: 'https://alleski.com/',
      }
    ),
    // Employer reference (Arbeitszeugnis, 2024), polished from: "stets zuverlaessig,
    // puenktlich und zu unserer vollsten Zufriedenheit ausgefuehrt ... immer wieder
    // konstruktiven Input geliefert" plus the projects and maintenance it lists. Agency named on Edris's request (2026-10-13).
    item(
      "Edris worked with us as a web developer on WordPress projects, including the careers site of the Vorarlberg state hospitals, and took care of the monthly maintenance and updates of our clients' websites. He always did his work reliably, on time and to our complete satisfaction, handled the maintenance we largely entrusted to him very conscientiously, and kept bringing constructive ideas to improve our development process.",
      'Thomas Rohner and Tom Glitzner',
      {
        context: 'Employer reference, Baschnegger Ammann Partner',
        logo: { url: '/images/clients/bap.svg', alt: 'Baschnegger Ammann Partner', width: 252, height: 113 },
        websiteUrl: 'https://www.bap.cc/',
      }
    ),
    // Employer reference (bobdo Zeugnis), polished from its task list and "stets zu
    // unserer vollen Zufriedenheit"; "Page Builder" left out (positioning rule).
    item(
      'Edris quickly settled into a wide range of tasks: website maintenance, managing website content, building websites and front-end work in HTML and CSS. He worked independently, responsibly and carefully, stayed motivated even under a heavy workload, and always did his job to our full satisfaction.',
      'bobdo',
      {
        context: 'Employer reference, bobdo',
        logo: { url: '/images/clients/bobdo.png', alt: 'bobdo', width: 300, height: 134 },
        websiteUrl: 'https://bobdo.com/',
      }
    ),
  ],
};

// Section labels on German pages. The quotes themselves are never translated:
// each stays in the words the client wrote (its own `lang`).
export const TESTIMONIALS_LABELS_DE = {
  title: 'Das sagen Kunden',
  prevLabel: 'Zurück',
  nextLabel: 'Weiter',
} as const;

/** One post from /wp-json/wp/v2/testimonial (custom `acf_fields` key). */
export interface RestTestimonialPost {
  id?: unknown;
  title?: { rendered?: unknown } | null;
  acf_fields?: {
    quote?: unknown;
    name?: unknown;
    company?: unknown;
    logo?: unknown;
    website_url?: unknown;
    lang?: unknown;
  } | false | null;
}

interface RestTestimonialsSection {
  section_title?: string | null;
  prev_label?: string | null;
  next_label?: string | null;
  /** ACF relationship (return format: IDs), in the order picked. Empty = false. */
  testimonials?: unknown;
}

const asText = (value: unknown): string => (typeof value === 'string' ? value.trim() : '');

function toLang(value: unknown): TestimonialLang {
  return asText(value).toLowerCase() === 'de' ? 'de' : 'en';
}

function toLogo(value: unknown): TestimonialLogo | null {
  if (!value || typeof value !== 'object') return null;
  const media = transformMedia(value as RestMedia);
  if (!media) return null;
  const { sourceUrl, altText, mediaDetails } = media.node;
  return { url: sourceUrl, alt: altText, width: mediaDetails.width, height: mediaDetails.height };
}

function toWebsiteUrl(value: unknown): string {
  const url = asText(value);
  return /^https?:\/\//i.test(url) ? url : '';
}

function toId(value: unknown): number | null {
  const raw = value && typeof value === 'object' ? (value as { ID?: unknown; id?: unknown }).ID ?? (value as { id?: unknown }).id : value;
  const id = typeof raw === 'string' ? Number(raw) : raw;
  return typeof id === 'number' && Number.isInteger(id) && id > 0 ? id : null;
}

function sectionOf(acfFields: unknown): RestTestimonialsSection {
  const acf = (acfFields && typeof acfFields === 'object' ? acfFields : {}) as {
    testimonials_section?: RestTestimonialsSection | false | null;
  };
  return acf.testimonials_section || {};
}

// A testimonial without its own company, logo or website reuses the code
// default of the same client name, so the bundled logos keep working.
function withDefaultBrand(entry: Testimonial): Testimonial {
  const fallback = DEFAULT_TESTIMONIALS_SECTION.items.find(
    (candidate) => entry.name !== '' && candidate.name === entry.name
  );
  if (!fallback) return entry;
  return {
    ...entry,
    context: entry.context || fallback.context,
    logo: entry.logo ?? fallback.logo,
    websiteUrl: entry.websiteUrl || fallback.websiteUrl,
  };
}

function toItem(post: RestTestimonialPost): Testimonial | null {
  const acf = post?.acf_fields || {};
  const quote = asText(acf.quote);
  if (!quote) return null;
  const title = decodeEntities(asText(post.title?.rendered)).trim();
  return withDefaultBrand({
    quote,
    // Title is the fallback name, except the admin-only "Anonymous client (...)" labels.
    name: asText(acf.name) || (/^anonymous\b/i.test(title) ? '' : title),
    context: asText(acf.company),
    lang: toLang(acf.lang),
    logo: toLogo(acf.logo),
    websiteUrl: toWebsiteUrl(acf.website_url),
  });
}

/**
 * The testimonial post IDs picked on the Home page, in the order picked.
 * Old repeater data (`testimonials_section.items`) is ignored.
 */
export function selectedTestimonialIds(acfFields: unknown): number[] {
  const ids = asArray<unknown>(sectionOf(acfFields).testimonials)
    .map(toId)
    .filter((id): id is number => id !== null);
  return [...new Set(ids)];
}

/**
 * Map the Home page `acf_fields.testimonials_section` group plus the picked
 * testimonial posts to the view model. Items follow the order picked on the
 * Home page, whatever order the posts arrive in. No picked post with a quote
 * falls back to the default quotes; a blank title or label to its default.
 */
export function transformTestimonials(
  acfFields: unknown,
  posts: RestTestimonialPost[] = [],
  lang: Lang = 'en'
): TestimonialsSection {
  const group = sectionOf(acfFields);
  const byId = new Map<number, RestTestimonialPost>();
  for (const post of asArray<RestTestimonialPost>(posts)) {
    const id = toId(post?.id);
    if (id !== null) byId.set(id, post);
  }
  const items = selectedTestimonialIds(acfFields)
    .map((id) => byId.get(id))
    .filter((post): post is RestTestimonialPost => post !== undefined)
    .map(toItem)
    .filter((entry): entry is Testimonial => entry !== null);
  const defaults = DEFAULT_TESTIMONIALS_SECTION;
  const labels = lang === 'de' ? TESTIMONIALS_LABELS_DE : defaults;

  return {
    title: cmsText(group.section_title, labels.title),
    prevLabel: cmsText(group.prev_label, labels.prevLabel),
    nextLabel: cmsText(group.next_label, labels.nextLabel),
    items: items.length > 0 ? items : defaults.items,
  };
}
