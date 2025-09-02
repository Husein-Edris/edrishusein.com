// API Response Types for better type safety

export interface WordPressPost {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  slug: string;
  date: string;
  readingTime?: string;
  author?: {
    name: string;
    bio?: string;
    node?: {
      name: string;
      bio?: string;
    };
  };
  categories?: Array<{
    name: string;
  }>;
  tags?: Array<{
    name: string;
  }>;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails: {
        width: number;
        height: number;
      };
    };
  };
  blogPostFields?: {
    readingTime?: string;
    author?: {
      node?: {
        name: string;
        bio?: string;
        avatar?: string;
        description?: string;
      };
    };
    authorBioOverride?: string;
    categories?: {
      nodes?: Array<{
        name: string;
      }>;
    };
    tags?: {
      nodes?: Array<{
        name: string;
      }>;
    };
    customTags?: Array<{
      name: string;
    }>;
    conclusionSection?: string;
  };
}

export interface WordPressProject {
  id: string;
  title: string;
  excerpt: string;
  slug: string;
  featuredImage?: {
    node: {
      sourceUrl: string;
      altText: string;
      mediaDetails: {
        width: number;
        height: number;
      };
    };
  } | null;
  caseStudy?: {
    projectLinks?: {
      liveSite?: string;
      github?: string;
    };
  };
}

export interface PostsApiResponse {
  posts: {
    nodes: WordPressPost[];
  };
}

export interface ProjectsApiResponse {
  projects: {
    nodes: WordPressProject[];
  };
}

export interface ACFImageField {
  url?: string;
  source_url?: string;
  alt?: string;
  alt_text?: string;
  width?: number;
  height?: number;
}

export interface AboutPageACF {
  about_hero_title?: string;
  about_hero_subtitle?: string;
  about_hero_image?: ACFImageField;
  experience_section_title?: string;
  experience_items?: unknown[];
  skills_section_title?: string;
  selected_skills?: unknown[];
  personal_section_title?: string;
  personal_content?: string;
  personal_image?: ACFImageField;
  selected_hobbies?: unknown[];
}

export interface GraphQLError {
  message: string;
  locations?: Array<{
    line: number;
    column: number;
  }>;
  path?: string[];
}

export interface FetchResult<T> {
  data: T | null;
  error: string | null;
  source: 'wordpress' | 'rest' | 'fallback';
}