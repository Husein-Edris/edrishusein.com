import type { WordPressImage } from '@/src/types/wordpress';

interface RestMediaSize {
  source_url?: string;
  width?: number;
  height?: number;
  mime_type?: string;
}

// A WordPress media object as it appears either as an ACF image field
// (`acf_format=standard` → flat `url`/`alt`/`width`/`height`) or as an embedded
// featured image (`_embed` → `source_url`/`alt_text`/`media_details`/`sizes`).
export interface RestMedia {
  url?: string;
  source_url?: string;
  alt?: string;
  alt_text?: string;
  width?: number;
  height?: number;
  media_details?: { width?: number; height?: number; sizes?: Record<string, RestMediaSize> };
  mime_type?: string;
  media_type?: string;
}

// Mimes browsers render directly in <img>.
const WEB_IMAGE_MIME = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'image/svg+xml',
]);

// Files that must never render as <img> — non-images plus image formats browsers
// can't display (HEIC/HEIF/TIFF). WordPress still generates JPEG previews for
// these (PDF page renders, HEIC conversions) under media_details.sizes.
const NON_RENDERABLE_EXTENSION = /\.(pdf|docx?|xlsx?|pptx?|zip|mp[34]|mov|avi|txt|csv|heic|heif|tiff?)(\?|#|$)/i;

/** True when the URL+mime is a browser-renderable image. */
function isWebRenderable(url: string, mime?: string): boolean {
  if (mime) return WEB_IMAGE_MIME.has(mime);
  // No mime metadata (e.g. ACF flat field): reject only known non-renderable files.
  return !NON_RENDERABLE_EXTENSION.test(url);
}

// Prefer a reasonably large rendition before falling back to anything renderable.
const SIZE_PREFERENCE = ['large', 'medium_large', '1536x1536', 'full', 'medium', 'headless-large', 'headless-medium'];

/** Find a browser-renderable JPEG/PNG rendition from media_details.sizes. */
function pickRenderableSize(input: RestMedia): RestMediaSize | null {
  const sizes = input.media_details?.sizes;
  if (!sizes) return null;

  for (const key of SIZE_PREFERENCE) {
    const size = sizes[key];
    if (size?.source_url && isWebRenderable(size.source_url, size.mime_type)) return size;
  }
  for (const size of Object.values(sizes)) {
    if (size?.source_url && isWebRenderable(size.source_url, size.mime_type)) return size;
  }
  return null;
}

/**
 * Normalize a REST media object into the domain `WordPressImage` shape.
 *
 * When the primary file isn't a browser-renderable image (PDF/HEIC/etc.), fall
 * back to a renderable JPEG rendition from `media_details.sizes` — WordPress
 * generates these for PDFs (page previews) and HEIC uploads. Returns null only
 * when there is no usable image at all.
 *
 * URL rewriting for the local dev image proxy is handled centrally by
 * `rewriteImageUrls` in `DataFetcher.fetchWithFallback`, so this stays pure.
 */
export function transformMedia(input: RestMedia | null | undefined): WordPressImage | null {
  if (!input) return null;

  const rawUrl = input.url ?? input.source_url;
  if (!rawUrl) return null;

  let sourceUrl = rawUrl;
  let width = input.width ?? input.media_details?.width ?? 0;
  let height = input.height ?? input.media_details?.height ?? 0;

  if (!isWebRenderable(rawUrl, input.mime_type)) {
    const renderable = pickRenderableSize(input);
    if (!renderable?.source_url) return null;
    sourceUrl = renderable.source_url;
    width = renderable.width ?? width;
    height = renderable.height ?? height;
  }

  return {
    node: {
      sourceUrl,
      altText: input.alt ?? input.alt_text ?? '',
      mediaDetails: { width, height },
    },
  };
}
