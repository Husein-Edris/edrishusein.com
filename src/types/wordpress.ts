// Core WordPress types matching GraphQL schema

export interface WordPressImage {
  node: {
    sourceUrl: string;
    altText: string;
    mediaDetails: {
      height: number;
      width: number;
    };
  };
}

export interface WordPressButton {
  url: string;
  title: string;
  target?: string;
}

export interface WordPressProject {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: WordPressImage;
  caseStudy?: {
    projectLinks?: {
      liveSite?: string;
      github?: string;
    };
    projectOverview?: {
      technologies?: Array<{
        id: string;
        title: string;
        featuredImage?: WordPressImage;
      }>;
    };
    projectContent?: {
      challenge?: string;
      solution?: string;
      keyFeatures?: Array<{
        title: string;
        description: string;
        image?: {
          sourceUrl: string;
          altText: string;
        };
      }>;
    };
    projectGallery?: Array<{
      sourceUrl: string;
      altText: string;
    }>;
  };
}

// ACF Image type (GraphQL structure)
export interface ACFImage {
  node: {
    sourceUrl: string;
    altText: string;
    mediaDetails: {
      height: number;
      width: number;
    };
  };
}

// Section-specific types matching ACF structure
export interface HeroSection {
  title?: string;
  heroCopy?: string;
  heroImage?: ACFImage;
}

export interface ProjectsSection {
  title?: string;
}

export interface AboutSection {
  title?: string;
  aboutMeText?: string;
}

export interface BookshelfSection {
  title?: string;
  description?: string;
  featuredImage?: ACFImage;
}

export interface TechStackSection {
  title?: string;
  description?: string;
  featuredImage?: ACFImage;
}

export interface NotebookSection {
  title?: string;
}

export interface ContactSection {
  subTitle?: string;
  title?: string;
  email?: string;
}

export interface HomepageSections {
  heroSection?: HeroSection;
  projectsSection?: ProjectsSection;
  aboutSection?: AboutSection;
  bookshelfSection?: BookshelfSection;
  techstackSection?: TechStackSection;
  notebookSection?: NotebookSection;
  contactSection?: ContactSection;
}

export interface ProjectsResponse {
  projects: {
    nodes: WordPressProject[];
  };
}

export interface HomepageResponse {
  page: {
    homepageSections: HomepageSections;
  };
}

// Transformed types for components
export interface TransformedProject {
  title: string;
  description: string;
  image?: string;
  variant: 'dark' | 'light';
  visitLink: string;
  caseStudyLink: string;
}

export interface InfoCardData {
  title: string;
  description: string;
  image?: string;
  link?: string;
  visitLink?: string;
  caseStudyLink?: string;
}