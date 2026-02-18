import { describe, it, expect } from 'vitest';
import {
  generateEnhancedMetadata,
  generateStructuredData,
  generateBreadcrumbStructuredData,
  type RankMathSEO,
} from './seo-utils';
import { mockRankMathSEO, mockPartialSEO } from '../__mocks__/fixtures/wordpress-data';

describe('generateEnhancedMetadata', () => {
  const baseFallback = {
    title: 'Fallback Title',
    description: 'Fallback description',
    path: '/test-page',
    type: 'website' as const,
  };

  describe('with complete RankMath data', () => {
    it('should use RankMath title when available', () => {
      const result = generateEnhancedMetadata(mockRankMathSEO, baseFallback);

      expect(result.title).toBe('Test Page Title | Edris Husein');
    });

    it('should use RankMath meta description', () => {
      const result = generateEnhancedMetadata(mockRankMathSEO, baseFallback);

      expect(result.description).toBe('Test meta description for SEO testing');
    });

    it('should use RankMath canonical URL', () => {
      const result = generateEnhancedMetadata(mockRankMathSEO, baseFallback);

      expect(result.alternates?.canonical).toBe('https://edrishusein.com/test-page');
    });

    it('should join robots array to string', () => {
      const result = generateEnhancedMetadata(mockRankMathSEO, baseFallback);

      expect(result.robots).toBe('index, follow');
    });

    it('should join focus keywords to string', () => {
      const result = generateEnhancedMetadata(mockRankMathSEO, baseFallback);

      expect(result.keywords).toBe('test, seo, keywords');
    });

    it('should include OpenGraph image with alt text', () => {
      const result = generateEnhancedMetadata(mockRankMathSEO, baseFallback);

      expect(result.openGraph?.images).toHaveLength(1);
      expect((result.openGraph?.images as any[])[0].url).toBe('https://edrishusein.com/images/og-image.png');
      expect((result.openGraph?.images as any[])[0].alt).toBe('OG Image');
    });

    it('should use Facebook social data for OpenGraph when available', () => {
      const result = generateEnhancedMetadata(mockRankMathSEO, baseFallback);

      expect(result.openGraph?.title).toBe('Facebook Title');
      expect(result.openGraph?.description).toBe('Facebook description');
    });

    it('should include Twitter card data', () => {
      const result = generateEnhancedMetadata(mockRankMathSEO, baseFallback);

      expect(result.twitter?.card).toBe('summary_large_image');
      expect(result.twitter?.title).toBe('Twitter Title');
      expect(result.twitter?.description).toBe('Twitter description');
    });

    it('should include Twitter image when available', () => {
      const result = generateEnhancedMetadata(mockRankMathSEO, baseFallback);

      expect(result.twitter?.images).toContain('https://edrishusein.com/images/twitter-image.png');
    });

    it('should set siteName to Edris Husein', () => {
      const result = generateEnhancedMetadata(mockRankMathSEO, baseFallback);

      expect(result.openGraph?.siteName).toBe('Edris Husein');
    });
  });

  describe('with partial/missing data', () => {
    it('should fall back to fallback title when RankMath title is missing', () => {
      const result = generateEnhancedMetadata(mockPartialSEO, baseFallback);

      expect(result.title).toBe('Partial SEO Title');
    });

    it('should fall back to fallback description when metaDesc is null', () => {
      const result = generateEnhancedMetadata(mockPartialSEO, baseFallback);

      expect(result.description).toBe('Fallback description');
    });

    it('should generate canonical URL from path when not provided', () => {
      const result = generateEnhancedMetadata(mockPartialSEO, baseFallback);

      expect(result.alternates?.canonical).toBe('https://edrishusein.com/test-page');
    });

    it('should return empty images array when OpenGraph image is null', () => {
      const result = generateEnhancedMetadata(mockPartialSEO, baseFallback);

      expect(result.openGraph?.images).toEqual([]);
    });

    it('should return empty Twitter images array when no images available', () => {
      const result = generateEnhancedMetadata(mockPartialSEO, baseFallback);

      expect(result.twitter?.images).toEqual([]);
    });

    it('should use default robots value when not provided', () => {
      const result = generateEnhancedMetadata(mockPartialSEO, baseFallback);

      expect(result.robots).toBe('index, follow');
    });

    it('should use fallback title for OpenGraph when social data is missing', () => {
      const result = generateEnhancedMetadata(mockPartialSEO, baseFallback);

      expect(result.openGraph?.title).toBe('Partial SEO Title');
    });

    it('should use fallback title for Twitter when social data is missing', () => {
      const result = generateEnhancedMetadata(mockPartialSEO, baseFallback);

      expect(result.twitter?.title).toBe('Partial SEO Title');
    });
  });

  describe('with null SEO data', () => {
    it('should use all fallback values when seoData is null', () => {
      const result = generateEnhancedMetadata(null, baseFallback);

      expect(result.title).toBe('Fallback Title');
      expect(result.description).toBe('Fallback description');
    });

    it('should generate canonical from fallback path', () => {
      const result = generateEnhancedMetadata(null, baseFallback);

      expect(result.alternates?.canonical).toBe('https://edrishusein.com/test-page');
    });

    it('should use fallback title for OpenGraph', () => {
      const result = generateEnhancedMetadata(null, baseFallback);

      expect(result.openGraph?.title).toBe('Fallback Title');
    });
  });

  describe('OpenGraph type handling', () => {
    it('should set type to website when fallback type is website', () => {
      const result = generateEnhancedMetadata(null, baseFallback);

      expect(result.openGraph?.type).toBe('website');
    });

    it('should set type to article when fallback type is article', () => {
      const articleFallback = { ...baseFallback, type: 'article' as const };
      const result = generateEnhancedMetadata(null, articleFallback);

      expect(result.openGraph?.type).toBe('article');
    });

    it('should default to website when type is undefined', () => {
      const noTypeFallback = { title: 'Test', path: '/test' };
      const result = generateEnhancedMetadata(null, noTypeFallback);

      expect(result.openGraph?.type).toBe('website');
    });
  });

  describe('Twitter image fallback chain', () => {
    it('should use Twitter image when available', () => {
      const seoWithTwitter: RankMathSEO = {
        twitterImage: { sourceUrl: 'https://example.com/twitter.png' },
        opengraphImage: { sourceUrl: 'https://example.com/og.png' },
      };
      const result = generateEnhancedMetadata(seoWithTwitter, baseFallback);

      expect(result.twitter?.images).toContain('https://example.com/twitter.png');
    });

    it('should fall back to OpenGraph image when Twitter image is missing', () => {
      const seoWithOGOnly: RankMathSEO = {
        opengraphImage: { sourceUrl: 'https://example.com/og.png' },
      };
      const result = generateEnhancedMetadata(seoWithOGOnly, baseFallback);

      expect(result.twitter?.images).toContain('https://example.com/og.png');
    });
  });

  describe('OpenGraph image alt text fallback', () => {
    it('should use provided alt text when available', () => {
      const result = generateEnhancedMetadata(mockRankMathSEO, baseFallback);

      expect((result.openGraph?.images as any[])[0].alt).toBe('OG Image');
    });

    it('should fall back to title when alt text is missing', () => {
      const seoWithoutAlt: RankMathSEO = {
        title: 'Page Title',
        opengraphImage: { sourceUrl: 'https://example.com/image.png' },
      };
      const result = generateEnhancedMetadata(seoWithoutAlt, baseFallback);

      expect((result.openGraph?.images as any[])[0].alt).toBe('Fallback Title');
    });
  });
});

describe('generateStructuredData', () => {
  describe('BlogPosting type', () => {
    const blogData = {
      title: 'Test Blog Post',
      description: 'Test blog description',
      excerpt: 'Test excerpt',
      date: '2024-01-15',
      modifiedDate: '2024-01-20',
      slug: 'test-blog-post',
      author: { name: 'John Doe' },
      featuredImage: {
        node: { sourceUrl: 'https://example.com/image.png' },
      },
    };

    it('should include correct @context and @type', () => {
      const result = generateStructuredData('BlogPosting', blogData);

      expect(result).toHaveProperty('@context', 'https://schema.org');
      expect(result).toHaveProperty('@type', 'BlogPosting');
    });

    it('should include headline from title', () => {
      const result = generateStructuredData('BlogPosting', blogData);

      expect(result).toHaveProperty('headline', 'Test Blog Post');
    });

    it('should use description over excerpt when available', () => {
      const result = generateStructuredData('BlogPosting', blogData);

      expect(result).toHaveProperty('description', 'Test blog description');
    });

    it('should fall back to excerpt when description is missing', () => {
      const dataWithoutDesc = { ...blogData, description: undefined };
      const result = generateStructuredData('BlogPosting', dataWithoutDesc);

      expect(result).toHaveProperty('description', 'Test excerpt');
    });

    it('should include author information', () => {
      const result = generateStructuredData('BlogPosting', blogData) as any;

      expect(result.author).toEqual({
        '@type': 'Person',
        name: 'John Doe',
        url: 'https://edrishusein.com/about',
      });
    });

    it('should use default author name when not provided', () => {
      const dataWithoutAuthor = { ...blogData, author: null };
      const result = generateStructuredData('BlogPosting', dataWithoutAuthor) as any;

      expect(result.author.name).toBe('Edris Husein');
    });

    it('should include date published and modified', () => {
      const result = generateStructuredData('BlogPosting', blogData) as any;

      expect(result.datePublished).toBe('2024-01-15');
      expect(result.dateModified).toBe('2024-01-20');
    });

    it('should use date as modifiedDate fallback', () => {
      const dataWithoutModified = { ...blogData, modifiedDate: undefined };
      const result = generateStructuredData('BlogPosting', dataWithoutModified) as any;

      expect(result.dateModified).toBe('2024-01-15');
    });

    it('should include featured image URL', () => {
      const result = generateStructuredData('BlogPosting', blogData) as any;

      expect(result.image).toBe('https://example.com/image.png');
    });

    it('should generate URL from slug', () => {
      const result = generateStructuredData('BlogPosting', blogData) as any;

      expect(result.url).toBe('https://edrishusein.com/notebook/test-blog-post');
    });

    it('should use canonical URL when provided', () => {
      const dataWithCanonical = { ...blogData, canonical: 'https://custom.com/post' };
      const result = generateStructuredData('BlogPosting', dataWithCanonical) as any;

      expect(result.url).toBe('https://custom.com/post');
    });

    it('should include mainEntityOfPage', () => {
      const result = generateStructuredData('BlogPosting', blogData) as any;

      expect(result.mainEntityOfPage).toEqual({
        '@type': 'WebPage',
        '@id': 'https://edrishusein.com/notebook/test-blog-post',
      });
    });

    it('should include publisher information', () => {
      const result = generateStructuredData('BlogPosting', blogData) as any;

      expect(result.publisher).toEqual({
        '@type': 'Person',
        name: 'Edris Husein',
        url: 'https://edrishusein.com',
      });
    });
  });

  describe('WebPage type', () => {
    const webPageData = {
      title: 'Test Web Page',
      description: 'Test page description',
      canonical: 'https://edrishusein.com/test',
    };

    it('should include correct @context and @type', () => {
      const result = generateStructuredData('WebPage', webPageData);

      expect(result).toHaveProperty('@context', 'https://schema.org');
      expect(result).toHaveProperty('@type', 'WebPage');
    });

    it('should include name from title', () => {
      const result = generateStructuredData('WebPage', webPageData);

      expect(result).toHaveProperty('name', 'Test Web Page');
    });

    it('should include description', () => {
      const result = generateStructuredData('WebPage', webPageData);

      expect(result).toHaveProperty('description', 'Test page description');
    });

    it('should include URL from canonical', () => {
      const result = generateStructuredData('WebPage', webPageData);

      expect(result).toHaveProperty('url', 'https://edrishusein.com/test');
    });

    it('should include mainEntity with Person schema', () => {
      const result = generateStructuredData('WebPage', webPageData) as any;

      expect(result.mainEntity).toEqual({
        '@type': 'Person',
        name: 'Edris Husein',
        jobTitle: 'Full-stack Developer',
        url: 'https://edrishusein.com',
      });
    });
  });

  describe('CreativeWork type', () => {
    const creativeWorkData = {
      title: 'Test Project',
      description: 'Project description',
      canonical: 'https://edrishusein.com/projects/test',
      date: '2024-01-15',
      featuredImage: {
        node: { sourceUrl: 'https://example.com/project.png' },
      },
    };

    it('should include correct @context and @type', () => {
      const result = generateStructuredData('CreativeWork', creativeWorkData);

      expect(result).toHaveProperty('@context', 'https://schema.org');
      expect(result).toHaveProperty('@type', 'CreativeWork');
    });

    it('should include name and description', () => {
      const result = generateStructuredData('CreativeWork', creativeWorkData);

      expect(result).toHaveProperty('name', 'Test Project');
      expect(result).toHaveProperty('description', 'Project description');
    });

    it('should include author as Edris Husein', () => {
      const result = generateStructuredData('CreativeWork', creativeWorkData) as any;

      expect(result.author).toEqual({
        '@type': 'Person',
        name: 'Edris Husein',
      });
    });

    it('should include URL and image', () => {
      const result = generateStructuredData('CreativeWork', creativeWorkData) as any;

      expect(result.url).toBe('https://edrishusein.com/projects/test');
      expect(result.image).toBe('https://example.com/project.png');
    });

    it('should include dateCreated and genre', () => {
      const result = generateStructuredData('CreativeWork', creativeWorkData) as any;

      expect(result.dateCreated).toBe('2024-01-15');
      expect(result.genre).toBe('Web Development');
    });
  });

  describe('Unknown type', () => {
    it('should return only base data for unknown types', () => {
      const result = generateStructuredData('UnknownType', { title: 'Test' });

      expect(result).toEqual({
        '@context': 'https://schema.org',
        '@type': 'UnknownType',
      });
    });

    it('should not include any additional properties', () => {
      const result = generateStructuredData('CustomType', { title: 'Test', extra: 'data' });

      expect(Object.keys(result)).toHaveLength(2);
      expect(result).not.toHaveProperty('title');
      expect(result).not.toHaveProperty('extra');
    });
  });
});

describe('generateBreadcrumbStructuredData', () => {
  it('should include correct @context and @type', () => {
    const breadcrumbs = [{ text: 'Home', url: 'https://edrishusein.com' }];
    const result = generateBreadcrumbStructuredData(breadcrumbs);

    expect(result).toHaveProperty('@context', 'https://schema.org');
    expect(result).toHaveProperty('@type', 'BreadcrumbList');
  });

  it('should create itemListElement for each breadcrumb', () => {
    const breadcrumbs = [
      { text: 'Home', url: 'https://edrishusein.com' },
      { text: 'Blog', url: 'https://edrishusein.com/notebook' },
      { text: 'Post', url: 'https://edrishusein.com/notebook/post' },
    ];
    const result = generateBreadcrumbStructuredData(breadcrumbs) as any;

    expect(result.itemListElement).toHaveLength(3);
  });

  it('should assign correct position starting from 1', () => {
    const breadcrumbs = [
      { text: 'Home', url: 'https://edrishusein.com' },
      { text: 'Blog', url: 'https://edrishusein.com/notebook' },
    ];
    const result = generateBreadcrumbStructuredData(breadcrumbs) as any;

    expect(result.itemListElement[0].position).toBe(1);
    expect(result.itemListElement[1].position).toBe(2);
  });

  it('should include ListItem type for each element', () => {
    const breadcrumbs = [{ text: 'Home', url: 'https://edrishusein.com' }];
    const result = generateBreadcrumbStructuredData(breadcrumbs) as any;

    expect(result.itemListElement[0]['@type']).toBe('ListItem');
  });

  it('should include name and item properties', () => {
    const breadcrumbs = [{ text: 'Test Page', url: 'https://edrishusein.com/test' }];
    const result = generateBreadcrumbStructuredData(breadcrumbs) as any;

    expect(result.itemListElement[0].name).toBe('Test Page');
    expect(result.itemListElement[0].item).toBe('https://edrishusein.com/test');
  });

  it('should handle empty breadcrumbs array', () => {
    const result = generateBreadcrumbStructuredData([]) as any;

    expect(result.itemListElement).toEqual([]);
  });

  it('should handle single breadcrumb', () => {
    const breadcrumbs = [{ text: 'Home', url: 'https://edrishusein.com' }];
    const result = generateBreadcrumbStructuredData(breadcrumbs) as any;

    expect(result.itemListElement).toHaveLength(1);
    expect(result.itemListElement[0]).toEqual({
      '@type': 'ListItem',
      position: 1,
      name: 'Home',
      item: 'https://edrishusein.com',
    });
  });
});
