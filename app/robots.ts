import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/private/', '/admin/', '/api/', '/_next/', '/test-post'],
    },
    sitemap: 'https://edrishusein.com/sitemap.xml',
  }
}