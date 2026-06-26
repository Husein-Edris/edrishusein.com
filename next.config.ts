import type { NextConfig } from "next";

const isDev = process.env.NODE_ENV === 'development';
// Derive the CMS host from the configured API URL so images, CSP and the upload
// proxy always follow whatever CMS the env points at (a single source of truth).
// Falls back to the conventional local/prod hosts when the env var is unset.
const cmsHostname = (() => {
  const apiUrl = process.env.NEXT_PUBLIC_WORDPRESS_API_URL;
  if (apiUrl) {
    try {
      return new URL(apiUrl).hostname;
    } catch {
      // fall through to defaults
    }
  }
  return isDev ? 'cmsedrishuseincom.local' : 'cms.edrishusein.com';
})();
const cmsOrigin = `https://${cmsHostname}`;

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: cmsHostname,
        port: '',
        pathname: '/wp-content/uploads/**',
      },
    ],
    unoptimized: isDev,
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [75, 85, 95],
    minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
  },
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  experimental: {
    optimizeCss: true,
  },
  async rewrites() {
    if (!isDev) return [];
    // Proxy WordPress uploads through localhost to avoid self-signed cert issues in browser
    return [
      {
        source: '/wp-uploads/:path*',
        destination: `http://${cmsHostname}/wp-content/uploads/:path*`,
      },
    ];
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: `default-src 'self'; script-src 'self' 'unsafe-inline' https://*.googletagmanager.com; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: ${cmsOrigin} https://*.google-analytics.com https://*.googletagmanager.com; connect-src 'self' ${cmsOrigin} https://*.google-analytics.com https://*.analytics.google.com https://*.googletagmanager.com; frame-ancestors 'none';`
          },
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
          { key: 'X-XSS-Protection', value: '1; mode=block' },
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },

          // Tech Stack Showcase Headers
          { key: 'X-Powered-By', value: 'WordPress (Headless CMS) + Next.js 16' },
          { key: 'X-Framework', value: 'Next.js' },
          { key: 'X-CMS', value: 'WordPress' },
          { key: 'X-Architecture', value: 'Headless' },
          { key: 'X-Frontend-Stack', value: 'React 19, Next.js 16, TypeScript, SCSS' },
          { key: 'X-Backend-Stack', value: 'WordPress, GraphQL, WPGraphQL, Advanced Custom Fields' },
          { key: 'X-Deployment', value: 'PM2, Node.js, Custom Server' },
        ],
      },
    ]
  },
};

export default nextConfig;
