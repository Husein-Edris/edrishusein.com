# Project Status & Comprehensive Documentation

## 🎯 Current Status (as of 2025-07-12)

### 🎯 **Current Focus: Fix Projects Not Showing**
**ISSUE**: Projects from production WordPress (`cms.edrishusein.com`) not displaying on frontend
- **User Confirmation**: Work with production data from `cms.edrishusein.com`
- **Goal**: Display existing projects that are saved in production WordPress
- **WordPress Admin**: Shows custom post types (Projects, Skills, Hobbies, etc.) are available

### 🔄 **User Decisions Made:**
1. ✅ **Use Production Data**: Work with `cms.edrishusein.com` (not local)
2. ✅ **Focus on Projects**: Fix project display issue first priority
3. 📋 **Later Tasks**: Create real portfolio content, set up About page functionality

### 🚨 **Active Investigation:**
- Need to test if `projects` post type exists in production GraphQL
- Verify project data structure and availability
- Fix any GraphQL query mismatches

## 🏗️ Project Architecture

### Next.js Frontend
- **Location**: `/Users/edrishusein/Local Sites/edrishusein.com`
- **Framework**: Next.js 15.1.7 with App Router
- **Language**: TypeScript 5
- **Styling**: SCSS with comprehensive design system
- **Dev Server**: Running on http://localhost:3001 (port 3000 in use)

### WordPress CMS Backend
- **Location**: `/Users/edrishusein/Local Sites/cmsedrishuseincom` 
- **Domain**: `blueprint.local` (Local by Flywheel)
- **Stack**: WordPress + MySQL 8.0.35 + Nginx 1.26.1 + PHP 8.2.23
- **Database**: `local` (user: root, password: root)
- **Ports**: 
  - HTTP: 10048
  - MySQL: 10049
  - SMTP: 10046 (Mailpit)
  - PHP-FPM: 10047

### Environment Configuration
```bash
# .env.local
NEXT_PUBLIC_WORDPRESS_API_URL=https://cms.edrishusein.com/graphql
```

**⚠️ CONFIGURATION MISMATCH**: 
- Environment points to: `https://cms.edrishusein.com/graphql`
- Local WordPress: `blueprint.local`
- This explains why local posts may not match production

## 📦 WordPress Plugin Stack

### Core Plugins (Installed & Active)
- **WPGraphQL** (Primary GraphQL API)
- **WPGraphQL for ACF** (Custom fields integration)
- **Advanced Custom Fields** (Content modeling)
- **FaustWP** (Headless WordPress framework)
- **WP GraphiQL** (GraphQL query testing)
- **WPGraphQL Smart Cache** (Performance optimization)
- **WPGraphQL Content Blocks** (Block editor support)

### Additional Tools
- **Admin Site Enhancements** (Admin UI improvements)
- **All-in-One WP Migration** (Backup/migration)
- **MalCare Security** (Security monitoring)

## 🔍 Current Data Analysis

### WordPress Posts Status
Local WordPress contains different posts than expected:
```
Available Posts:
1. "Hello Ya nas! (DUPLICATE)" (slug: hello-ya-nas-duplicate)
2. "New Post" (slug: new-post)  
3. "Hello Ya nas!" (slug: hello-world)
```

**vs Expected Project Posts:**
- "Geschäftsbericht für Vorarlberger Landeskrankenhäuser"
- "Beschützerbox 222"

### GraphQL Endpoint Analysis
- ✅ **Connection**: GraphQL endpoint responds correctly
- ✅ **Posts Query**: `posts(first: 3)` returns data successfully
- ❌ **Projects Query**: `projects(first: 3)` returns error (field doesn't exist)
- ✅ **Introspection**: Disabled (security feature active)

## 🚀 Development Commands

```bash
# Frontend Development
npm run dev          # Start Next.js dev server (uses Turbopack)
npm run build        # Build for production  
npm run start        # Start production server
npm run lint         # Run ESLint

# WordPress Management
# Start Local by Flywheel app to manage WordPress
# WordPress Admin: http://blueprint.local/wp-admin
# GraphQL Endpoint: http://blueprint.local/graphql
```

## 📊 Component Architecture

### Core Components
```
src/components/
├── Contact/           # Contact form section
├── Footer/           # Site footer with links
├── Header/           # Navigation header
├── Hero/             # Homepage hero section
├── InfoCards/        # Universal card system (5 skins)
│   ├── InfoCards.tsx      # Client component
│   └── InfoCardsServer.tsx # Server component
├── MoreProjects/     # Related projects (client-side)
├── Projects/         # Project grid display
├── SectionHeader/    # Reusable section headers
├── SectionRenderer/  # Dynamic homepage sections
└── about/           # About page components
```

### Page Structure
```
app/
├── page.tsx                    # Homepage (server-rendered)
├── about/page.tsx             # About page
├── projects/
│   ├── page.tsx               # Projects listing
│   └── [slug]/page.tsx        # Individual case studies
├── notebook/
│   ├── page.tsx               # Blog listing
│   └── [slug]/page.tsx        # Individual blog posts
├── api/
│   ├── project/route.ts       # Project data API
│   ├── post/route.ts          # Blog post API
│   └── debug-projects/route.ts # Debug endpoint
└── bookshelf/page.tsx         # Bookshelf page
```

## 🎨 Design System Status

### SCSS Architecture
```
src/styles/
├── variables.scss    # Design tokens (colors, spacing, typography)
├── mixins.scss       # Reusable mixins (buttons, layouts, responsive)
└── pages/           # Page-specific styles
    ├── About.scss
    ├── Blog.scss
    ├── CaseStudy.scss
    └── Projects.scss
```

### Font System
- **Primary**: Inter (Variable font)
- **Display**: Syncopate (Bold & Regular)
- **Loading**: Optimized with font-display: swap

### Component Skins
InfoCards supports 5 different presentations:
1. **default** - Standard cards
2. **projects** - Project showcase cards  
3. **blog** - Blog post cards
4. **bookshelf** - Book/resource cards
5. **techstack** - Technology cards

## 🔄 Data Flow Analysis

### GraphQL Queries (Fixed)
```typescript
// src/lib/queries/index.ts
GET_HOMEPAGE_DATA      // ✅ Works - fetches ACF homepage sections
GET_PROJECTS_FOR_GRID  // ✅ Fixed - now uses 'posts' instead of 'projects'
GET_ALL_PROJECTS       // ✅ Fixed - now uses 'posts' instead of 'projects'  
GET_CASE_STUDY         // ✅ Fixed - now uses 'post' instead of 'project'
GET_POSTS_FOR_NOTEBOOK // ✅ Works - blog posts for notebook section
GET_ABOUT_PAGE         // ✅ Works - about page ACF fields
GET_ALL_TECH           // ❓ Unknown - custom post type status unclear
```

### Data Fetching Strategy
1. **Server Components**: Direct GraphQL client calls
2. **Client Components**: API routes for data fetching
3. **Fallback System**: Static data when WordPress unavailable
4. **Error Handling**: Graceful degradation throughout

## ❓ Unclear Areas & Questions

### 1. WordPress Environment Discrepancy
**Question**: Should we update the environment to point to local WordPress?
- Current: `https://cms.edrishusein.com/graphql` (production)
- Local: `http://blueprint.local/graphql` 
- **Impact**: Frontend won't show local WordPress content

### 2. Missing Project Content
**Question**: Where are the actual project posts?
- Expected: "Geschäftsbericht für Vorarlberger Landeskrankenhäuser", "Beschützerbox 222"
- Found: Generic "Hello World" posts
- **Need**: Import actual project content or create new posts

### 3. Custom Post Types
**Question**: Do we need to create a custom 'projects' post type?
- Current: Using standard 'posts' for everything
- Alternative: Create dedicated post types for projects, skills, hobbies, tech
- **Impact**: Better content organization vs. simpler setup

### 4. ACF Field Configuration
**Question**: Are all ACF fields properly configured?
- Files available: Multiple ACF export JSONs in `wordpress-exports/`
- Status: Unknown if properly imported in current WordPress
- **Need**: Verify field groups match the GraphQL queries

### 5. Production Deployment Strategy  
**Question**: How should production WordPress be structured?
- Local development: `blueprint.local`
- Production URL: `cms.edrishusein.com`
- **Need**: Clarify hosting strategy and content migration plan

## 🛠️ Immediate Action Items

### 🚨 Current Priority (Confirmed by User)
1. **Fix Project Display Issue**
   - ✅ Confirmed: Use production WordPress (`cms.edrishusein.com`)
   - Test if `projects` post type exists in production GraphQL
   - Verify existing project data can be queried
   - Fix GraphQL queries if needed to match production structure

2. **Production Data Verification**
   - Test connection to production GraphQL endpoint
   - Verify projects saved in WordPress admin are accessible via GraphQL
   - Ensure frontend can display production project data

### 📋 Later Tasks (User Confirmed)
1. **Content Creation**
   - Create actual project posts with real portfolio content
   - ✅ User has some projects in production already

2. **About Page Setup**
   - Set up Skills/Hobbies custom post types
   - Import ACF field groups for About page functionality

3. **Environment Consistency**
   - Ensure development workflow with production data
   - Document setup process

## 📈 Performance Status

### Current Optimizations
- ✅ Next.js Image optimization
- ✅ Font preloading and optimization  
- ✅ SCSS compilation and minification
- ✅ Turbopack for fast development
- ✅ GraphQL query optimization

### Potential Improvements
- Static site generation (SSG) for better performance
- Image CDN integration
- GraphQL query caching
- Bundle size optimization

## 🔐 Security Considerations

### Current Security Features
- ✅ GraphQL introspection disabled in production
- ✅ Environment variables for sensitive data
- ✅ CORS configuration (assumed)
- ✅ MalCare security plugin active

### Security Best Practices
- Regular WordPress updates
- Strong authentication for WordPress admin
- HTTPS for all communications
- Regular security audits

---

## 📝 Next Steps

### ✅ **Confirmed Decisions (User Input)**
1. **Environment**: Use production WordPress (`cms.edrishusein.com`)
2. **Priority**: Fix projects not showing on frontend first
3. **Content**: Work with existing projects in production, add more later
4. **About Page**: Set up Skills/Hobbies functionality later

### 🔄 **Immediate Actions**
1. **Test production GraphQL endpoint** for projects data
2. **Verify project post type** exists and is accessible
3. **Fix GraphQL queries** if needed to match production structure
4. **Test frontend display** with production data

**Last Updated**: 2025-07-12  
**Status**: Active Investigation - Fixing projects display issue with production data