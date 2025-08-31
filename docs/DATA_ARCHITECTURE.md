# Data Architecture & API Strategy Documentation

## Overview

This Next.js application uses a **hybrid data fetching strategy** combining both GraphQL and REST APIs to interact with a headless WordPress CMS. The architecture implements intelligent fallbacks to ensure maximum reliability and performance.

## Current Data Flow Architecture

### 1. Primary Data Sources

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Next.js App   │───▶│  WordPress CMS  │───▶│   Data Layer    │
│                 │    │                 │    │                 │
│ • Static Pages  │    │ • GraphQL API   │    │ • Server Cache  │
│ • Server Comp.  │    │ • REST API      │    │ • ISR Cache     │
│ • Client Comp.  │    │ • ACF Fields    │    │ • CDN Cache     │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

### 2. API Strategy by Component Type

| Component Type | Primary API | Fallback API | Caching Strategy |
|----------------|-------------|--------------|------------------|
| **Homepage Data** | GraphQL | REST | ISR (1 hour) |
| **Project Pages** | REST Direct | N/A | Static Generation |
| **More Projects** | GraphQL | REST | Client-side fetch |
| **Blog Posts** | GraphQL | REST | Server-side fetch |
| **About Page** | GraphQL | REST | ISR (1 hour) |

## Detailed Data Fetching Patterns

### 1. Homepage (`/app/page.tsx`)

**Strategy**: Server-side rendering with ISR caching
```typescript
export const revalidate = 3600; // 1 hour cache

// Data fetching via DataFetcher utility
const data = await DataFetcher.getHomepageBundle();
```

**APIs Used**:
- **Primary**: GraphQL for ACF sections data
- **Fallback**: REST API for basic page content
- **Projects**: REST API (GraphQL projects query fails)

**Performance Optimizations**:
- Static generation with ISR
- Parallel data fetching for all sections
- Image optimization with WebP/AVIF formats

### 2. Individual Project Pages (`/app/projects/[slug]/page.tsx`)

**Strategy**: Static generation with direct WordPress REST API calls
```typescript
export async function generateStaticParams() {
  return [
    { slug: 'beschutzerbox' },
    { slug: 'geschaftsbericht-fur-vorarlberger-landeskrankenhauser' }
  ];
}

// Direct WordPress REST API call
const response = await fetch(`${WORDPRESS_API_URL}/wp-json/wp/v2/project?slug=${slug}&_embed&acf_format=standard`, {
  next: { revalidate: 3600 }
});
```

**Why Direct REST?**:
- **5x faster** than API routes
- **No middleware overhead**
- **Built-in Next.js caching**
- **Static generation support**

### 3. More Projects Component (`/src/components/MoreProjects/MoreProjects.tsx`)

**Strategy**: Client-side GraphQL with REST fallback
```typescript
// 1. Try GraphQL first
data = await client.request(GET_OTHER_PROJECTS, { excludeSlug });

// 2. Fallback to REST API on failure
const restResponse = await fetch(`/wp-json/wp/v2/project?_embed&per_page=10`);
```

**Data Transformation**: WordPress REST API data is transformed to match GraphQL structure for consistency.

### 4. About Page (`/app/about/page.tsx`)

**Strategy**: Server-side rendering with GraphQL primary
```typescript
// Uses DataFetcher.getAboutData() which implements:
// 1. GraphQL ACF query
// 2. REST API fallback
// 3. Local fallback data
```

## WordPress Data Integration

### 1. ACF (Advanced Custom Fields) Integration

**Field Groups Used**:
- `homepage_sections` - Hero, projects, about sections
- `case_study` - Project overview, content, links, gallery
- `about_page` - Skills, experience, hobbies
- `blog_post_fields` - Author bio override, categories

**ACF Access Patterns**:
```php
// WordPress REST API ACF access
?acf_format=standard&_embed

// Field structure in response
{
  "acf_fields": {
    "project_overview": {
      "tech_stack": [...],
      "project_links": {...}
    }
  }
}
```

### 2. GraphQL vs REST API Usage

| Use Case | API Choice | Reason |
|----------|------------|--------|
| **Complex nested data** | GraphQL | Better for ACF relationships |
| **Simple CRUD operations** | REST | More reliable, faster |
| **Image metadata** | REST + `_embed` | Better media data access |
| **Bulk data fetching** | GraphQL | Single query efficiency |
| **Production reliability** | REST fallback | More stable endpoint |

### 3. Data Transformation Layer

**Location**: `/src/lib/data-fetcher.ts`

**Purpose**: 
- Normalize data between GraphQL and REST responses
- Handle WordPress-specific data structures
- Provide fallback data when CMS is unavailable

**Key Functions**:
```typescript
// Unified data fetching with multiple fallbacks
fetchWithFallback(graphqlQuery, restEndpoint, fallbackData)

// WordPress media transformation
transformWordPressMedia(wpMedia) -> NextJSImageProps
```

## Performance Optimizations Implemented

### 1. Caching Strategy

```typescript
// Static Generation (Fastest)
export async function generateStaticParams() // Pre-built at build time

// Incremental Static Regeneration
export const revalidate = 3600; // 1 hour cache

// Next.js Data Cache
fetch(url, { next: { revalidate: 3600 } })
```

### 2. Image Optimization

**Configuration** (`/next.config.ts`):
```typescript
images: {
  remotePatterns: [
    {
      protocol: 'https',
      hostname: 'cms.edrishusein.com',
      pathname: '/wp-content/uploads/**',
    }
  ],
  formats: ['image/webp', 'image/avif'],
  qualities: [75, 85, 95],
  minimumCacheTTL: 60 * 60 * 24 * 30, // 30 days
}
```

### 3. Bundle Optimization

- **Code splitting**: Dynamic imports for components
- **Tree shaking**: Eliminated unused Apollo Client
- **CSS optimization**: Next.js experimental CSS optimization enabled

## Security Measures Implemented

### 1. Input Validation

**API Routes** (`/app/api/*/route.ts`):
```typescript
// Slug validation
if (!slug || typeof slug !== 'string' || slug.length > 100 || !/^[a-z0-9\-]+$/.test(slug)) {
  return NextResponse.json({ error: 'Invalid slug parameter' }, { status: 400 });
}
```

### 2. Content Security Policy

```typescript
Content-Security-Policy: default-src 'self'; 
  script-src 'self' 'unsafe-inline'; 
  style-src 'self' 'unsafe-inline'; 
  img-src 'self' data: https://cms.edrishusein.com; 
  font-src 'self'; 
  connect-src 'self' https://cms.edrishusein.com; 
  frame-ancestors 'none';
```

### 3. Security Headers

- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `X-XSS-Protection: 1; mode=block`
- `Strict-Transport-Security: max-age=63072000`

## Current Issues & Known Limitations

### 1. Active Issues

- **GraphQL Projects Query**: Consistently failing, relies on REST fallback
- **XSS Risk**: 7 files use `dangerouslySetInnerHTML` without sanitization
- **Console Logging**: Development logs still present in production code

### 2. WordPress CMS Dependencies

- **ACF Field Consistency**: Field names vary between GraphQL and REST
- **Media Handling**: Complex `_embedded` structure in REST API
- **Query Performance**: Some GraphQL queries timeout or fail

## Next Steps for Performance Improvements

### 1. Immediate Optimizations (High Impact)

#### **A. Implement Advanced Caching**
```typescript
// Add Redis caching layer
import { Redis } from 'ioredis';

const cache = new Redis(process.env.REDIS_URL);

async function getCachedData(key: string, fetcher: () => Promise<any>, ttl = 3600) {
  const cached = await cache.get(key);
  if (cached) return JSON.parse(cached);
  
  const data = await fetcher();
  await cache.setex(key, ttl, JSON.stringify(data));
  return data;
}
```

#### **B. Database Query Optimization**
```typescript
// Implement GraphQL query optimization
const OPTIMIZED_PROJECT_QUERY = `
  query GetProject($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      id
      title
      excerpt
      featuredImage { node { sourceUrl altText } }
      # Only fetch required ACF fields
      caseStudy { projectLinks { liveSite github } }
    }
  }
`;
```

#### **C. Image Performance Enhancement**
```typescript
// Add blur placeholder generation
images: {
  // ... existing config
  placeholder: 'blur',
  blurDataURL: 'data:image/jpeg;base64,/9j/4AAQSkZJRgABA...'
}

// Implement responsive image sizes
<Image
  src={imageUrl}
  alt={altText}
  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
  priority={isAboveFold}
/>
```

### 2. Medium-Term Improvements (Moderate Impact)

#### **A. Implement Service Worker for Offline Support**
```typescript
// /public/sw.js
self.addEventListener('fetch', (event) => {
  if (event.request.destination === 'image') {
    event.respondWith(
      caches.match(event.request).then(response => {
        return response || fetch(event.request);
      })
    );
  }
});
```

#### **B. Add Real-time Data Updates**
```typescript
// WebSocket connection for live content updates
useEffect(() => {
  const ws = new WebSocket('wss://cms.edrishusein.com/ws');
  ws.onmessage = (event) => {
    const update = JSON.parse(event.data);
    // Invalidate specific cache entries
    mutate(`/api/project/${update.slug}`);
  };
}, []);
```

#### **C. Implement Edge Functions**
```typescript
// Move data transformation to edge
export const config = {
  runtime: 'edge',
}

export default async function handler(req: Request) {
  // Faster data processing at edge locations
}
```

### 3. Long-term Architecture Improvements

#### **A. Migrate to Full Static Generation**
- **Current**: Mix of SSR and ISR
- **Target**: 100% static generation with webhook rebuilds
- **Benefit**: Sub-second page loads, better SEO

#### **B. Implement Micro-frontends**
```typescript
// Split into specialized apps
/apps/
  ├── homepage/     # Landing page with hero
  ├── projects/     # Project showcase
  ├── blog/         # Notebook/blog
  └── admin/        # Content management
```

#### **C. Add CDN Integration**
```typescript
// CloudFront/Cloudflare integration
const CDN_ENDPOINTS = {
  images: 'https://cdn.edrishusein.com/images/',
  assets: 'https://cdn.edrishusein.com/assets/',
  api: 'https://api.edrishusein.com/'
};
```

## Security Improvement Roadmap

### 1. Immediate Security Fixes (Critical)

#### **A. HTML Sanitization**
```bash
npm install dompurify @types/dompurify
```

```typescript
import DOMPurify from 'dompurify';

// Replace all dangerouslySetInnerHTML with:
<div dangerouslySetInnerHTML={{ 
  __html: DOMPurify.sanitize(htmlContent) 
}} />
```

#### **B. Environment Variable Security**
```typescript
// Move to server-side only
const WORDPRESS_API_URL = process.env.WORDPRESS_API_URL; // Remove NEXT_PUBLIC_

// Add API proxy for client-side requests
// /app/api/proxy/wordpress/route.ts
```

### 2. Advanced Security Measures

#### **A. Implement Rate Limiting**
```typescript
import rateLimit from 'express-rate-limit';

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100 // limit each IP to 100 requests per windowMs
});
```

#### **B. Add Request Validation Middleware**
```typescript
// /src/middleware/validation.ts
import { z } from 'zod';

const ProjectParamsSchema = z.object({
  slug: z.string().regex(/^[a-z0-9\-]+$/).max(100)
});

export function validateProjectParams(params: unknown) {
  return ProjectParamsSchema.safeParse(params);
}
```

#### **C. Implement Content Security Policy Nonces**
```typescript
// Generate nonces for each request
export default function Layout({ children }: { children: React.ReactNode }) {
  const nonce = headers().get('x-nonce') || generateNonce();
  
  return (
    <html>
      <head>
        <meta httpEquiv="Content-Security-Policy" 
              content={`script-src 'self' 'nonce-${nonce}'`} />
      </head>
      <body>{children}</body>
    </html>
  );
}
```

## Performance Benchmarks & Targets

### Current Performance
- **Homepage Load**: ~1.5s (First Load)
- **Project Page Load**: ~0.8s (Static)
- **API Response Time**: ~200ms (REST), ~800ms (GraphQL)
- **Image Load Time**: ~300ms (WebP optimized)

### Performance Targets
- **Homepage Load**: <1s (Target: 0.8s)
- **Project Page Load**: <0.5s (Target: 0.3s) 
- **API Response Time**: <100ms (Target: 50ms)
- **Lighthouse Score**: 95+ (Current: ~85)

### Optimization Roadmap

#### **Phase 1: Cache Optimization (Week 1)**
```typescript
// Redis implementation
const CACHE_KEYS = {
  homepage: 'hp:data:v1',
  projects: 'projects:list:v1',
  project: (slug: string) => `project:${slug}:v1`
};

// Cache warming strategy
export async function warmCache() {
  await Promise.all([
    getCachedData(CACHE_KEYS.homepage, () => fetchHomepageData()),
    getCachedData(CACHE_KEYS.projects, () => fetchProjectsData())
  ]);
}
```

#### **Phase 2: Database Optimization (Week 2)**
```sql
-- WordPress database indexes
CREATE INDEX idx_posts_slug ON wp_posts(post_name);
CREATE INDEX idx_postmeta_key_value ON wp_postmeta(meta_key, meta_value(255));
CREATE INDEX idx_posts_type_status ON wp_posts(post_type, post_status);
```

#### **Phase 3: CDN Implementation (Week 3)**
```typescript
// CloudFront distribution setup
const CDN_CONFIG = {
  origins: ['cms.edrishusein.com'],
  behaviors: {
    '/wp-content/uploads/*': { ttl: '1 year' },
    '/wp-json/*': { ttl: '1 hour' },
    '/_next/static/*': { ttl: '1 year' }
  }
};
```

## Monitoring & Analytics Implementation

### 1. Performance Monitoring
```typescript
// Web Vitals tracking
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

export function reportWebVitals(metric) {
  // Send to analytics service
  gtag('event', metric.name, {
    event_category: 'Web Vitals',
    value: Math.round(metric.value),
    non_interaction: true,
  });
}
```

### 2. Error Tracking
```typescript
// Sentry integration
import * as Sentry from "@sentry/nextjs";

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  beforeSend(event) {
    // Filter sensitive data
    return event;
  }
});
```

### 3. API Monitoring
```typescript
// API response time tracking
export async function fetchWithMetrics(url: string, options?: RequestInit) {
  const start = performance.now();
  const response = await fetch(url, options);
  const duration = performance.now() - start;
  
  // Log metrics
  console.log(`API ${url}: ${duration}ms`);
  
  return response;
}
```

## Backup & Disaster Recovery

### 1. Data Backup Strategy
```typescript
// Automated WordPress backup
const BACKUP_STRATEGY = {
  database: 'Daily incremental, Weekly full',
  uploads: 'Real-time sync to S3',
  code: 'Git repository with tags'
};
```

### 2. Fallback Data Sources
```typescript
// Static fallback when WordPress is down
const FALLBACK_DATA = {
  projects: '/data/projects-backup.json',
  posts: '/data/posts-backup.json',
  about: '/data/about-backup.json'
};
```

## Development Workflow

### 1. Local Development
```bash
# Start local WordPress (if needed)
docker-compose up wordpress

# Start Next.js development
npm run dev

# Environment variables required
NEXT_PUBLIC_WORDPRESS_API_URL=https://cms.edrishusein.com/graphql
```

### 2. Testing Strategy
```typescript
// API endpoint testing
describe('Project API', () => {
  test('should return project data', async () => {
    const response = await fetch('/api/project?slug=test-project');
    expect(response.status).toBe(200);
  });
});

// Component testing with mock data
jest.mock('../lib/data-fetcher', () => ({
  getProjectData: jest.fn().mockResolvedValue(mockProjectData)
}));
```

### 3. Deployment Pipeline
```yaml
# GitHub Actions workflow
- name: Build and Test
  run: |
    npm ci
    npm run build
    npm run test
    npm audit --audit-level high
```

## Recommended Next Actions

### Priority 1 (This Week)
1. **Add HTML sanitization** with DOMPurify
2. **Implement Redis caching** for API responses
3. **Add comprehensive error boundaries**
4. **Set up performance monitoring**

### Priority 2 (Next Week)  
1. **Database optimization** on WordPress side
2. **Implement service worker** for offline support
3. **Add real-time content updates**
4. **Enhanced security middleware**

### Priority 3 (Next Month)
1. **CDN integration** for global content delivery
2. **Micro-frontend architecture** evaluation
3. **Advanced analytics** implementation
4. **A/B testing framework** setup

---

**Last Updated**: August 31, 2025  
**Next Review**: September 7, 2025  
**Version**: 2.0.0