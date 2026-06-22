import { MetadataRoute } from 'next'
import { fetchSitemapContent, toSitemapEntries } from '@/src/lib/sitemap-content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://edrishusein.com';
  
  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 1,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/projects`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/notebook`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/bookshelf`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/tech-stack`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.6,
    },
    {
      url: `${baseUrl}/privacy-policy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/imprint`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ];

  // Fetch dynamic content via REST (returns [] on failure so the sitemap still generates)
  const [posts, projects] = await Promise.all([
    fetchSitemapContent('/posts?per_page=100&orderby=date&order=desc&_fields=slug,modified,date'),
    fetchSitemapContent('/project?per_page=100&orderby=date&order=desc&_fields=slug,modified,date'),
  ]);

  const postPages = toSitemapEntries(posts, baseUrl, 'notebook', 'weekly', 0.7);
  const projectPages = toSitemapEntries(projects, baseUrl, 'projects', 'monthly', 0.8);

  return [...staticPages, ...postPages, ...projectPages];
}