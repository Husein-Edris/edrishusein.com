# edrishusein.com

My portfolio and writing, built on Next.js with a headless WordPress backend. I run the content out of WordPress so I can publish projects and posts from wp-admin without redeploying, while the frontend stays a fast, statically rendered Next app.

## What it does

The site holds my work, a notebook of writing, a bookshelf, and my tech stack. All of it is edited in WordPress. The Next frontend reads that content and renders it, and it keeps working even when the CMS is unavailable.

## Architecture

- **Frontend:** Next.js 16 (App Router), React 19, TypeScript, SCSS
- **Content:** WordPress as a headless CMS, read over its REST API with Advanced Custom Fields
- **Resilience:** every page reads from REST and falls back to a static copy in `src/data/` when WordPress is slow or down, so a CMS outage never reaches a visitor
- **Performance:** cached reads use ISR with a 60-second window, so pages serve fast and still reflect edits within a minute

The site first ran on GraphQL. In 2026 I migrated it to REST only, which removed three client libraries, cut the data layer by roughly 2,900 lines, and let me switch off the WPGraphQL plugins on the CMS for a smaller attack surface.

## How the code is organized

- `src/lib/rest-client.ts` - the `cmsRest` wrapper every page uses to read WordPress
- `src/lib/data-fetcher.ts` - fetch-then-fall-back logic
- `src/lib/transform/` - reshapes raw WordPress responses into the shapes the components expect
- `src/lib/section-registry.ts` - assembles the homepage from ACF sections
- `src/components/InfoCards/` - one card component with skins for projects, blog, bookshelf, and tech
- `src/styles/variables.scss` - colors, spacing, and type
