/**
 * In development, rewrite WordPress upload URLs to go through the local Next.js
 * rewrite proxy (/wp-uploads/...) so the browser doesn't need to hit the
 * self-signed cert on cmsedrishuseincom.local directly.
 *
 * In production this is a no-op.
 */

import { CMS_BASE_URL } from './config';

const isLocalCms = process.env.NODE_ENV === 'development' && CMS_BASE_URL.includes('.local');
const uploadPrefix = `${CMS_BASE_URL}/wp-content/uploads/`;

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
