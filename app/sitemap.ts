import { MetadataRoute } from 'next'
import { fetchSitemapContent, toSitemapEntries, latestModified } from '@/src/lib/sitemap-content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://edrishusein.com';

  // Fetch dynamic content first so static index pages can derive an honest
  // lastmod from their freshest child (returns [] on failure, sitemap still builds).
  const [posts, projects] = await Promise.all([
    fetchSitemapContent('/posts?per_page=100&orderby=date&order=desc&_fields=slug,modified,date'),
    fetchSitemapContent('/project?per_page=100&orderby=date&order=desc&_fields=slug,modified,date'),
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

  return [...staticPages, ...postPages, ...projectPages];
}
