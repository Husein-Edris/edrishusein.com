# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production  
- `npm run start` - Start production server
- `npm run lint` - Run ESLint to check code quality

## Project Architecture

This is a Next.js 15 portfolio website with headless WordPress CMS integration. The architecture follows a hybrid approach with WordPress as primary content source and comprehensive fallback systems.

### Tech Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, React 19
- **Styling**: SCSS with design system (variables + mixins)
- **CMS**: WordPress headless via WPGraphQL + Advanced Custom Fields
- **Data Fetching**: GraphQL with Apollo Client and fallback mechanisms

### WordPress Integration
- **GraphQL Endpoint**: `NEXT_PUBLIC_WORDPRESS_API_URL` environment variable
- **Local Backend**: `/Users/edrishusein/Local Sites/cmsedrishuseincom` (Local by Flywheel)
- **Production Backend**: `cms.edrishusein.com`
- **Local Environment**: PHP 8.2.23, MySQL 8.0.35, Nginx 1.26.1

#### Core Plugins Stack
- **WPGraphQL**: Core GraphQL API layer for headless architecture
- **WPGraphQL for ACF**: Exposes Advanced Custom Fields via GraphQL
- **FaustWP**: Headless WordPress framework optimized for Next.js
- **Advanced Custom Fields (ACF)**: Content modeling and custom field management
- **WP GraphiQL**: GraphQL IDE for query development and testing
- **WPGraphQL Smart Cache**: Performance optimization for GraphQL queries
- **WPGraphQL Content Blocks**: Block editor content via GraphQL

#### Content Architecture
- **Custom Post Types**: Projects, Books (Bookshelf)
- **Default Post Types**: Posts (Blog/Notebook), Pages (Homepage sections)
- **Custom Theme**: `headless-wp-theme` - Security-optimized theme for headless setups

### Data Flow Architecture
The application implements a sophisticated data fetching strategy via `src/lib/data-fetcher.ts`:

1. **Primary**: GraphQL queries to WordPress CMS
2. **Fallback**: Comprehensive static data when WordPress unavailable
3. **Error Handling**: Graceful degradation with logging
4. **Development Mode**: Enhanced debugging and fallback warnings

Key data transformation occurs in `src/lib/section-registry.ts`:
- `SectionFactory.createHomepageSections()` - Converts WordPress data to component configs
- `SectionTransformers` - Handles data normalization and null-safety
- Dynamic section ordering and configuration management

### Component Architecture

#### InfoCards System (`src/components/InfoCards/`)
Universal card component with multiple skins:
- `default` - General purpose cards
- `projects` - Project showcase with hover effects
- `blog` - Blog post previews
- `bookshelf` - Book recommendations
- `techstack` - Technology showcase

#### Dynamic Homepage Rendering
- `SectionRenderer` component processes WordPress ACF sections
- Factory pattern creates section configurations
- Supports reordering and enabling/disabling sections
- Fallback to static content when CMS unavailable

#### Case Study Pages (`/projects/[slug]`)
- Dynamic routing with slug-based URLs
- Client-side data fetching via API routes
- MoreProjects component for related content
- Technology association with fallback stacks

### Styling System

#### SCSS Architecture
- **Variables** (`src/styles/variables.scss`): Colors, typography, spacing, breakpoints
- **Mixins** (`src/styles/mixins.scss`): Button system, responsive helpers, layout utilities
- **Component Styles**: Co-located `.scss` files using BEM methodology
- **Page Styles**: Organized in `src/styles/pages/` by route

#### Design System Features
- 8px spacing grid system (`$spacing-xs` to `$spacing-5xl`)
- Semantic color palette with dark/light variants
- Button variants: primary, secondary, outline, ghost
- Mobile-first responsive breakpoints
- Consistent typography scale

### Security Configuration
Next.js config includes comprehensive security headers:
- Content Security Policy with domain restrictions
- X-Frame-Options, X-Content-Type-Options
- Strict Transport Security
- Image domain allowlist for WordPress media

### Environment Setup

#### Required Environment Variables
- `NEXT_PUBLIC_WORDPRESS_API_URL` - WordPress GraphQL endpoint URL
  - Local: `https://cmsedrishuseincom.local/graphql`
  - Production: `https://cms.edrishusein.com/graphql`

#### WordPress Development Setup
1. **Local Environment**: Uses Local by Flywheel (`blueprint.local`)
2. **Database**: MySQL with `local` database, `root:root` credentials
3. **Services**: Nginx (port 10048), PHP-FPM (port 10047), MySQL (port 10049)
4. **GraphQL Testing**: Access WP GraphiQL at `/wp-admin/admin.php?page=graphiql-ide`
5. **Security**: Custom theme includes CORS headers and security hardening

### Development Patterns
- All pages use `export const dynamic = 'force-dynamic'` for fresh content
- Comprehensive error boundaries and fallback systems  
- TypeScript strict mode with custom path aliases (`@/*`, `@/src/*`)
- Parallel data fetching with `Promise.allSettled()`
- Development-only logging and debugging features

### Content Management

#### WordPress Theme Features
The `headless-wp-theme` provides:
- **Security Hardening**: Disabled XML-RPC, WP version removal, security headers
- **Performance Optimization**: Disabled emojis, dequeued unnecessary scripts/styles
- **CORS Configuration**: Allowed origins for `localhost:3000`, `edrishusein.com`
- **Admin Optimizations**: Cleaned menu pages, helpful admin notices

#### ACF Field Groups Structure
- **Homepage Sections**: Hero, About, Projects, Bookshelf, Tech Stack, Notebook, Contact
- **Project Case Studies**: Basic info, technologies, content sections, links, gallery
- **Blog Posts**: Reading time, conclusion sections, key takeaways, featured images
- **Custom Post Types**: Books (Bookshelf), Projects with GraphQL integration

#### Content Export Files
- **ACF Blog Fields**: `/acf-blog-fields-export.json` - Blog post custom fields
- **Custom Post Types**: `/wordpress-exports/acf-custom-post-types-2025-07-12.json`
- **Homepage Sections**: Available in ACF exports for field group imports

#### GraphQL Schema
WordPress GraphQL exposes:
- **Projects**: Custom post type with case study fields, featured images, technologies
- **Books**: Bookshelf custom post type with category taxonomy
- **Posts**: Blog content with custom fields and reading time
- **Homepage Data**: ACF sections for dynamic homepage rendering
- **Media**: WordPress media library with optimized image URLs

#### Common Issues & Troubleshooting

**Projects Not Loading from GraphQL:**
If projects show in WordPress admin but GraphQL query fails with "Cannot query field 'projects'":

1. **Check Custom Post Type Registration:**
   - Go to WordPress Admin → ACF → Post Types
   - Ensure "Projects" post type has these GraphQL settings:
     - `show_in_graphql: true`
     - `graphql_single_name: "project"`
     - `graphql_plural_name: "projects"`

2. **Import Custom Post Type Configuration:**
   - Go to WordPress Admin → Custom Fields → Tools → Import
   - Import `/wordpress-exports/acf-custom-post-types-2025-07-12.json`
   - This contains the proper GraphQL configuration

3. **Verify GraphQL Endpoint:**
   - Test query at `https://cms.edrishusein.com/wp-admin/admin.php?page=graphiql-ide`
   - Query: `{ projects(first: 1) { nodes { id title } } }`

**Fallback System:**
The application includes comprehensive fallback data in `src/lib/data-fetcher.ts` that displays sample projects when WordPress GraphQL fails, ensuring the site remains functional during configuration issues.