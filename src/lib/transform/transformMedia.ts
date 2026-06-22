import type { WordPressImage } from '@/src/types/wordpress';

// A WordPress media object as it appears either as an ACF image field
// (`acf_format=standard` → flat `url`/`alt`/`width`/`height`) or as an embedded
// featured image (`_embed` → `source_url`/`alt_text`/`media_details`).
export interface RestMedia {
  url?: string;
  source_url?: string;
  alt?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  media_details?: { width?: number; height?: number };
}

/**
 * Normalize a REST media object into the domain `WordPressImage` shape the
 * components consume. Returns null when no usable image URL is present.
 *
 * URL rewriting for the local dev image proxy is handled centrally by
 * `rewriteImageUrls` in `DataFetcher.fetchWithFallback`, so this stays pure.
 */
export function transformMedia(input: RestMedia | null | undefined): WordPressImage | null {
  if (!input) return null;

  const sourceUrl = input.url ?? input.source_url;
  if (!sourceUrl) return null;

  return {
    node: {
      sourceUrl,
      altText: input.alt ?? input.alt_text ?? '',
      mediaDetails: {
        width: input.width ?? input.media_details?.width ?? 0,
        height: input.height ?? input.media_details?.height ?? 0,
      },
    },
  };
}
