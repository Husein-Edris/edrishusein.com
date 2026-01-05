# Edris Husein Portfolio

A modern portfolio website built with Next.js and headless WordPress. The site pulls content from WordPress via GraphQL and falls back to static data when needed.

## Tech Stack

- **Frontend**: Next.js 15, TypeScript, React 19, SCSS
- **CMS**: WordPress with WPGraphQL and Advanced Custom Fields
- **Data**: GraphQL with REST API fallback and static fallback data

## How It Works

The site uses a three-tier data strategy:
1. Try to get content from WordPress GraphQL
2. If that fails, try WordPress REST API
3. If that fails, use static fallback data

This means the site always works, even if WordPress is down.

## Key Files

- `src/lib/data-fetcher.ts` - Handles all data fetching with fallbacks
- `src/lib/section-registry.ts` - Converts WordPress data to React components
- `src/components/InfoCards/` - Universal card component with different skins
- `src/styles/variables.scss` - Design system colors, spacing, typography

Import the ACF field groups from `/wordpress-exports/` to get the content structure set up.



## Content Management

The homepage is built from WordPress ACF sections. Each section gets converted to a React component automatically. Projects, blog posts, and other content types are managed through WordPress custom post types.

## Deployment

The site runs on PM2 with a custom Node.js server.


Built with ❤️ by Edris Husein