import type { WordPressImage } from '@/src/types/wordpress';

// Edris's portrait, shared by the homepage hero and /about. Source order is
// decided by the caller (e.g. About field, then Home > Hero > Hero Image); the
// first usable photo wins, else the static file in /public.
export interface Portrait {
  src: string;
  alt: string;
  width: number;
  height: number;
}

export const PORTRAIT_FALLBACK: Portrait = {
  src: '/images/Edris-Husein-Hero.png',
  alt: 'Portrait of Edris Husein',
  width: 512,
  height: 512,
};

// The Home hero_image field long held a vector placeholder (Preview.svg); a
// portrait photo is never an SVG, so an SVG is treated as "not set".
const SVG_PATTERN = /\.svg(\?|#|$)/i;

function usable(image: WordPressImage | null | undefined): image is WordPressImage {
  const url = image?.node?.sourceUrl?.trim() ?? '';
  return url !== '' && !SVG_PATTERN.test(url);
}

export function resolvePortrait(...candidates: Array<WordPressImage | null | undefined>): Portrait {
  const image = candidates.find(usable);
  if (!image) return PORTRAIT_FALLBACK;
  const { sourceUrl, altText, mediaDetails } = image.node;
  return {
    src: sourceUrl,
    alt: altText?.trim() || PORTRAIT_FALLBACK.alt,
    width: mediaDetails?.width || PORTRAIT_FALLBACK.width,
    height: mediaDetails?.height || PORTRAIT_FALLBACK.height,
  };
}
