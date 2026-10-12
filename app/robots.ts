import { MetadataRoute } from 'next'
 
export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // `/_next/` is deliberately NOT disallowed: every on-page image is served
      // through the optimizer at `/_next/image?url=...`, so blocking it stops
      // Googlebot-Image from fetching any image on the site (no Google Images
      // results, no photo next to the brand SERP). It also hides the JS/CSS
      // chunks Google needs to render the page, which Google warns against.
      disallow: ['/private/', '/admin/', '/api/', '/test-post'],
    },
    sitemap: 'https://edrishusein.com/sitemap.xml',
  }
}
