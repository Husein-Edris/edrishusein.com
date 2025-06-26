# Edris Husein Portfolio - Headless WordPress CMS

A modern, scalable portfolio website built with Next.js 15 and headless WordPress CMS integration. Features a comprehensive design system, dynamic content management, and optimized performance.

## 🚀 Tech Stack

- **Frontend**: Next.js 15 (App Router), TypeScript, React 18
- **Styling**: SCSS with comprehensive design system
- **CMS**: WordPress (Headless) with WPGraphQL
- **Data Fetching**: GraphQL with fallback systems
- **Fields**: Advanced Custom Fields (ACF)
- **Hosting**: Local development with WordPress + Next.js

## 🏗️ Architecture Overview

### Frontend (Next.js)
```
/app
├── page.tsx                 # Homepage with dynamic sections
├── projects/[slug]/         # Case study pages
├── api/                     # API routes for data fetching
└── ...

/src
├── components/              # Reusable UI components
├── lib/                     # Data fetching & utilities
├── styles/                  # SCSS design system
└── types/                   # TypeScript definitions
```

### WordPress CMS Backend
- **Location**: `/Users/edrishusein/Local Sites/cmsedrishuseincom`
- **Plugins**: WPGraphQL, ACF, FaustWP
- **Content Types**: Projects, Posts, Pages, Technologies
- **ACF Field Groups**: Homepage sections, project case studies

## 🎨 Design System

### Variables (`src/styles/variables.scss`)
- **Colors**: Semantic color system with primary, secondary, neutral palettes
- **Typography**: Complete font scale with Inter & Syncopate fonts
- **Spacing**: 8px grid system ($spacing-xs to $spacing-5xl)
- **Breakpoints**: Mobile-first responsive design
- **Shadows & Borders**: Consistent visual effects

### Components (`src/styles/mixins.scss`)
- **Button System**: Primary, secondary, outline, ghost variants
- **Layout Utilities**: Flex helpers, containers, section spacing
- **Responsive Mixins**: Mobile, tablet, desktop breakpoints
- **Card Components**: Reusable card styles

## 📁 Component Architecture

### Core Components

#### `InfoCards` - Universal Card System
- **Skins**: `default`, `projects`, `blog`, `bookshelf`, `techstack`
- **Features**: Responsive grids, hover effects, dynamic content
- **Usage**: Homepage sections, project grids, blog previews

#### `SectionRenderer` - Dynamic Content
- **Purpose**: Renders homepage sections based on WordPress data
- **Factory Pattern**: `SectionFactory.createHomepageSections()`
- **Fallbacks**: Graceful degradation when CMS unavailable

#### `Projects` - Portfolio Showcase
- **Features**: Interactive project cards, case study links
- **Hover Effects**: Scale, grayscale, transform animations
- **Responsive**: 3-column desktop, 1-column mobile

### Specialized Components

#### Case Study Pages (`/projects/[slug]`)
- **Dynamic Routing**: Slug-based project pages
- **Content Sections**: Hero, technologies, challenge/solution, gallery
- **Fallback Technologies**: Default tech stack when CMS empty
- **More Projects**: Related content suggestions

#### `MoreProjects` - Related Content
- **Client Component**: Fetches additional projects via API
- **Error Handling**: Loading states and fallbacks
- **Dynamic Display**: Excludes current project

## 🔄 Data Management

### GraphQL Queries (`src/lib/queries/`)
```typescript
GET_HOMEPAGE_DATA      // ACF homepage sections
GET_PROJECTS_FOR_GRID  // Project previews
GET_POSTS_FOR_NOTEBOOK // Blog posts
GET_CASE_STUDY         // Individual project data
```

### Data Fetcher (`src/lib/data-fetcher.ts`)
- **Error Handling**: Automatic fallback to static data
- **Bundle Fetching**: Parallel data loading
- **Development Logging**: Debug information in dev mode
- **Type Safety**: Full TypeScript coverage

### Section Factory (`src/lib/section-registry.ts`)
- **Dynamic Sections**: Creates homepage layout from CMS data
- **Transformers**: Converts WordPress data to component props
- **Flexible Configuration**: Easy section reordering and customization

## 🎯 Key Features

### ✅ Completed Features
- **Responsive Design**: Mobile-first, works on all devices
- **Dynamic Content**: WordPress CMS integration with ACF
- **Project Showcases**: Interactive cards with case studies
- **Blog Integration**: Notebook section with post previews
- **Design System**: Consistent styling and components
- **Performance**: Optimized images, fonts, and loading
- **Accessibility**: WCAG compliant design patterns
- **SEO Ready**: Meta tags, structured data preparation
- **Fallback Systems**: Works offline with static content

### 🔧 Interactive Elements
- **Clickable Project Cards**: Navigate to case studies
- **Hover Animations**: Smooth transitions and effects
- **Responsive Navigation**: Mobile hamburger menu
- **Form Handling**: Contact section (ready for backend)
- **Dynamic Routing**: Slug-based project pages

## 🛠️ Development Workflow

### Getting Started
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Start WordPress (if using Local)
# Ensure WordPress is running on cmsedrishuseincom.local
```

### Environment Setup
```bash
# .env.local
NEXT_PUBLIC_WORDPRESS_API_URL=https://cmsedrishuseincom.local/graphql
```

### WordPress Configuration
1. **Install Required Plugins**:
   - WPGraphQL
   - WPGraphQL for Advanced Custom Fields
   - Advanced Custom Fields (ACF)

2. **Import ACF Fields**:
   - Use `/Users/edrishusein/Downloads/acf-export-2025-06-26.json`
   - Import via ACF admin panel

3. **Create Content**:
   - Add homepage content to `/home` page
   - Create project posts with ACF fields
   - Add blog posts for notebook section

## 📊 Content Management

### Homepage Sections (ACF)
- **Hero Section**: Title, description, profile image
- **About Section**: Bio content with rich text
- **Projects Section**: Dynamic project grid
- **Bookshelf/Tech Stack**: Info cards with links
- **Notebook Section**: Latest blog posts
- **Contact Section**: Get in touch information

### Project Case Studies
- **Basic Info**: Title, excerpt, featured image
- **Project Overview**: Technologies used
- **Project Content**: Challenge, solution, key features
- **Project Links**: Live site, GitHub repository
- **Project Gallery**: Additional images

### Technology Management
- **Custom Post Type**: Tech items with icons
- **Relationship Fields**: Link projects to technologies
- **Fallback System**: Default tech stack when empty

## 🎨 Styling Guidelines

### Button System
```scss
// Usage examples
.primary-button {
  @include button-primary;
  @include button-size('md');
}

.secondary-button {
  @include button-secondary;
  @include button-size('sm');
}
```

### Spacing System
```scss
// Consistent spacing using design system
.section {
  padding: $spacing-3xl $container-padding;
  margin-bottom: $spacing-2xl;
  
  @include mobile {
    padding: $spacing-xl $container-padding-mobile;
  }
}
```

### Color Usage
```scss
// Semantic color naming
.card {
  background-color: $bg-light;
  color: $text-dark-gray;
  border: 1px solid $color-beige;
}
```

## 🚦 Performance Optimizations

- **Image Optimization**: Next.js Image component with lazy loading
- **Font Loading**: Optimized web fonts with fallbacks
- **Code Splitting**: Dynamic imports for better performance
- **Caching**: Static generation where possible
- **Bundle Analysis**: Optimized chunk sizes

## 🔍 SEO & Accessibility

- **Meta Tags**: Dynamic titles and descriptions
- **Alt Text**: Comprehensive image descriptions
- **Semantic HTML**: Proper heading hierarchy
- **Keyboard Navigation**: Full keyboard accessibility
- **Color Contrast**: WCAG AA compliant colors
- **Screen Readers**: ARIA labels and descriptions

## 📱 Browser Support

- **Modern Browsers**: Chrome, Firefox, Safari, Edge (latest 2 versions)
- **Mobile Browsers**: iOS Safari, Chrome Mobile
- **Progressive Enhancement**: Core functionality without JavaScript

## 🔄 Deployment

### Production Checklist
- [ ] Update environment variables
- [ ] WordPress URL configuration
- [ ] Image optimization settings
- [ ] Performance testing
- [ ] Accessibility audit
- [ ] Cross-browser testing

### WordPress Hosting
- Ensure WordPress is accessible via public URL
- Configure CORS for GraphQL endpoint
- SSL certificate for secure connections

## 🐛 Troubleshooting

### Common Issues

**WordPress Connection Issues**:
- Check WordPress URL in `.env.local`
- Verify WPGraphQL plugin is active
- Test GraphQL endpoint directly

**Missing Content**:
- Verify ACF fields are published
- Check GraphQL schema in WP admin
- Review fallback data in console

**Styling Issues**:
- Ensure SCSS variables are imported
- Check responsive breakpoints
- Verify design system usage

### Debug Mode
```bash
# Enable development logging
NODE_ENV=development npm run dev
```

## 📈 Future Enhancements

### Planned Features
- **Search Functionality**: Project and blog search
- **Contact Form**: Backend integration
- **Animation Library**: Enhanced micro-interactions
- **CMS Preview**: Real-time content preview
- **Multi-language**: i18n support
- **Analytics**: Performance tracking

### Scalability Considerations
- **Static Generation**: Move to SSG for better performance
- **CDN Integration**: Global content delivery
- **Database Optimization**: Caching layers
- **Micro-frontends**: Component library extraction

## 👥 Contributing

### Code Standards
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Consistent code formatting
- **Husky**: Pre-commit hooks

### Git Workflow
```bash
# Feature development
git checkout -b feature/new-component
git commit -m "Add new component with tests"
git push origin feature/new-component
```

## 📄 License

This project is for portfolio purposes. All rights reserved.

---

**Built with ❤️ by Edris Husein**