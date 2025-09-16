import { MetadataRoute } from 'next'
import { client } from '@/src/lib/client';

// Fetch all blog posts for sitemap
async function fetchAllPosts() {
  try {
    const query = `
      query GetAllPostsForSitemap {
        posts(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
          nodes {
            slug
            date
            modified
          }
        }
      }
    `;
    
    const response = await client.request(query);
    return response.posts?.nodes || [];
  } catch (error) {
    console.error('Error fetching posts for sitemap:', error);
    return [];
  }
}

// Fetch all projects for sitemap
async function fetchAllProjects() {
  try {
    const query = `
      query GetAllProjectsForSitemap {
        projects(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
          nodes {
            slug
            date
            modified
          }
        }
      }
    `;
    
    const response = await client.request(query);
    return response.projects?.nodes || [];
  } catch (error) {
    console.error('Error fetching projects for sitemap:', error);
    return [];
  }
}

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

  // Fetch dynamic content
  const [posts, projects] = await Promise.all([
    fetchAllPosts(),
    fetchAllProjects()
  ]);

  // Blog post pages
  const postPages: MetadataRoute.Sitemap = posts.map((post: any) => ({
    url: `${baseUrl}/notebook/${post.slug}`,
    lastModified: new Date(post.modified || post.date),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }));

  // Project pages
  const projectPages: MetadataRoute.Sitemap = projects.map((project: any) => ({
    url: `${baseUrl}/projects/${project.slug}`,
    lastModified: new Date(project.modified || project.date),
    changeFrequency: 'monthly' as const,
    priority: 0.8,
  }));

  return [...staticPages, ...postPages, ...projectPages];
}