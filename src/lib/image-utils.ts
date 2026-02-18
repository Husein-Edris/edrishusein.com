/**
 * In development, rewrite WordPress upload URLs to go through the local Next.js
 * rewrite proxy (/wp-uploads/...) so the browser doesn't need to hit the
 * self-signed cert on cmsedrishuseincom.local directly.
 *
 * In production this is a no-op.
 */

const wpBase = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || '';
const isLocalCms = process.env.NODE_ENV === 'development' && wpBase.includes('.local');
const uploadPrefix = `${wpBase}/wp-content/uploads/`;

export function rewriteUploadUrl(url: string): string {
  if (!isLocalCms) return url;
  return url.replace(uploadPrefix, '/wp-uploads/');
}

export function rewriteImageUrls<T>(data: T): T {
  if (!isLocalCms) return data;
  const json = JSON.stringify(data);
  const rewritten = json.replaceAll(uploadPrefix, '/wp-uploads/');
  return JSON.parse(rewritten);
}
