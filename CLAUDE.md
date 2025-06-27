# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Next.js 15 personal portfolio website for Edris Husein using the App Router, TypeScript, and SCSS. The site uses a headless WordPress CMS backend for content management with a hybrid data approach for development/fallback.

### WordPress CMS Backend
- **Location**: `/Users/edrishusein/Local Sites/cmsedrishuseincom`
- **Environment**: Local development (blueprint.local)
- **Stack**: WordPress + MySQL + Nginx + PHP 8.2

### Key WordPress Plugins
- **WPGraphQL (v2.1.1)**: Core GraphQL API layer
- **WPGraphQL for ACF (v2.4.1)**: Custom fields integration
- **FaustWP (v1.8.0)**: Headless WordPress framework optimized for Next.js
- **Advanced Custom Fields**: Content modeling for portfolio projects
- **JWT Authentication**: Secure API access

## Development Commands

- `npm run dev` - Start development server with Turbopack
- `npm run build` - Build the application for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Git Commit Guidelines

When making commits, use standard commit messages without AI tool attribution. Do not include:
- "🤖 Generated with [Claude Code]" 
- "Co-Authored-By: Claude <noreply@anthropic.com>"

Keep commit messages clean and focused on the actual changes made.

## Architecture & Data Flow

### Content Management Strategy
The site uses a dual-content approach:
- **Primary**: WordPress headless CMS via GraphQL for dynamic content (hero sections, projects, about)
- **Fallback**: Static data files in `/src/data/` for development and backup

### WordPress Backend Setup
- **GraphQL Endpoint**: Configured in `NEXT_PUBLIC_WORDPRESS_API_URL`
- **Content Types**: Uses custom ACF fields for portfolio projects and homepage sections
- **Development Tool**: WP GraphiQL available for query testing
- **Media**: WordPress media library for project images and assets

### GraphQL Integration
- **Client**: `src/lib/client.ts` - GraphQL client configuration
- **Queries**: `src/lib/queries/index.ts` - All GraphQL queries centralized
- **Environment**: Requires `NEXT_PUBLIC_WORDPRESS_API_URL` in `.env.local`

Key queries:
- `GET_HOMEPAGE_DATA` - Homepage sections and content
- `GET_PROJECTS_FOR_GRID` - Project listings for homepage
- `GET_ALL_PROJECTS` - All projects for projects page
- `GET_CASE_STUDY` - Individual project details

### Page Architecture
- **Homepage** (`app/page.tsx`): Server-side rendered, fetches both homepage and project data in parallel
- **Projects** (`app/projects/[slug]/page.tsx`): Client-side rendered dynamic pages using API routes
- **API Route** (`app/api/project/route.ts`): Simplified GraphQL proxy for project data

### Component Structure
Components are organized by feature with co-located SCSS files:
- Layout components: Header, Footer, Hero
- Content components: InfoCards (configurable card system), About, Contact
- Each component has its own `.scss` file following BEM methodology

### Styling System
- **SCSS Architecture**: Variables (`src/styles/variables.scss`) and mixins (`src/styles/mixins.scss`)
- **Page Styles**: Organized in `src/styles/pages/` by page type
- **Font Loading**: Custom fonts (Syncopate, Inter) preloaded in layout
- **Design Pattern**: Dark/light variants with consistent spacing system

### Data Transformation
Homepage data flows through transformation layers:
1. GraphQL response from WordPress
2. Null-safe transformation for component props
3. InfoCards component with flexible configuration

## Key Environment Variables

- `NEXT_PUBLIC_WORDPRESS_API_URL` - WordPress GraphQL endpoint (required for production)

## Development Notes

- The site gracefully handles WordPress API failures with fallback content
- All pages use `export const dynamic = 'force-dynamic'` for fresh data
- Project pages use client-side fetching through API routes for better error handling
- Static assets (images, fonts) are in `/public/` directory