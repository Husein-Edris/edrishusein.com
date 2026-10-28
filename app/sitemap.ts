import { MetadataRoute } from 'next'
import {
  fetchSitemapContent,
  toSitemapEntries,
  latestModified,
  withLanguageVersions,
  toServiceSitemapEntries,
  servicesIndexEntries,
} from '@/src/lib/sitemap-content';
import { getServices } from '@/src/lib/services';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://edrishusein.com';

  // Fetch dynamic content first so static index pages can derive an honest
  // lastmod from their freshest child. A CMS outage throws, so ISR keeps the last
  // good sitemap instead of caching one without posts and projects.
  // Services carry both slugs, so they come from getServices (same outage rule:
  // transient throws, no post type yet yields none).
  const [posts, projects, services] = await Promise.all([
    fetchSitemapContent('/posts?per_page=100&orderby=date&order=desc&_fields=slug,modified,date'),
    fetchSitemapContent('/project?per_page=100&orderby=date&order=desc&_fields=slug,modified,date'),
    getServices('en'),
  ]);

  const latestPost = latestModified(posts);
  const latestProject = latestModified(projects);
  // Homepage surfaces the latest work + writing, so it is as fresh as the newest of either.
  const latestOverall = latestModified([...posts, ...projects]);

  // Static pages. lastModified is set only where a real content date exists; the
  // remaining evergreen pages (about, bookshelf, tech-stack, legal, contact) omit
  // it rather than fake a build-time date, which would train Google to distrust it.
  const staticPages: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: latestOverall, changeFrequency: 'monthly', priority: 1 },
    // /services only while services exist; without them the index is a 404.
    ...servicesIndexEntries(services, baseUrl),
    { url: `${baseUrl}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${baseUrl}/projects`, lastModified: latestProject, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${baseUrl}/notebook`, lastModified: latestPost, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${baseUrl}/bookshelf`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/tech-stack`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${baseUrl}/contact`, changeFrequency: 'yearly', priority: 0.6 },
    { url: `${baseUrl}/privacy-policy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${baseUrl}/imprint`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const postPages = toSitemapEntries(posts, baseUrl, 'notebook', 'weekly', 0.7);
  const projectPages = toSitemapEntries(projects, baseUrl, 'projects', 'monthly', 0.8);

  // Every page exists in English and German (/de + same path); each entry
  // lists both with hreflang alternates. Service pages use a different slug per
  // language and bring their own pairs.
  return [
    ...withLanguageVersions([...staticPages, ...postPages, ...projectPages], baseUrl),
    ...toServiceSitemapEntries(services, baseUrl),
  ];
}
