import { describe, it, expect } from 'vitest';
import {
  SectionTransformers,
  SectionFactory,
  createSectionConfig,
  type SectionConfig,
  type ComponentType,
} from './section-registry';
import {
  mockProjectsNodes,
  mockPostsNodes,
  mockHomepageSections,
  mockProjectsResponse,
  mockPostsResponse,
} from '../__mocks__/fixtures/wordpress-data';

describe('SectionTransformers', () => {
  describe('transformProjects', () => {
    it('should transform valid project data to TransformedProject array', () => {
      const result = SectionTransformers.transformProjects(mockProjectsNodes);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('Test Project 1');
      expect(result[0].description).toBe('Test project 1 description');
      expect(result[0].variant).toBe('dark');
    });

    it('should extract featured image URL correctly', () => {
      const result = SectionTransformers.transformProjects(mockProjectsNodes);

      expect(result[0].image).toBe('/images/test-project-1.png');
    });

    it('should extract live site link from caseStudy', () => {
      const result = SectionTransformers.transformProjects(mockProjectsNodes);

      expect(result[0].visitLink).toBe('https://test-project-1.com');
      expect(result[1].visitLink).toBeNull(); // Second project has null liveSite
    });

    it('should generate case study link from slug', () => {
      const result = SectionTransformers.transformProjects(mockProjectsNodes);

      expect(result[0].caseStudyLink).toBe('/projects/test-project-1');
      expect(result[1].caseStudyLink).toBe('/projects/test-project-2');
    });

    it('should return empty array for non-array input', () => {
      expect(SectionTransformers.transformProjects(null as unknown as unknown[])).toEqual([]);
      expect(SectionTransformers.transformProjects(undefined as unknown as unknown[])).toEqual([]);
      expect(SectionTransformers.transformProjects('string' as unknown as unknown[])).toEqual([]);
      expect(SectionTransformers.transformProjects({} as unknown as unknown[])).toEqual([]);
    });

    it('should return empty array for empty array input', () => {
      expect(SectionTransformers.transformProjects([])).toEqual([]);
    });

    it('should handle projects with missing optional fields', () => {
      const incompleteProjects = [
        {
          title: 'Minimal Project',
          slug: 'minimal',
          // Missing: excerpt, featuredImage, caseStudy
        },
      ];

      const result = SectionTransformers.transformProjects(incompleteProjects);

      expect(result[0].title).toBe('Minimal Project');
      expect(result[0].description).toBe('No description available');
      expect(result[0].image).toBeUndefined();
      expect(result[0].visitLink).toBeNull();
      expect(result[0].caseStudyLink).toBe('/projects/minimal');
    });

    it('should use default title when title is missing', () => {
      const projectWithoutTitle = [{ slug: 'no-title' }];
      const result = SectionTransformers.transformProjects(projectWithoutTitle);

      expect(result[0].title).toBe('Untitled Project');
    });

    it('should use # for caseStudyLink when slug is missing', () => {
      const projectWithoutSlug = [{ title: 'No Slug Project' }];
      const result = SectionTransformers.transformProjects(projectWithoutSlug);

      expect(result[0].caseStudyLink).toBe('#');
    });
  });

  describe('transformPosts', () => {
    it('should transform valid post data to InfoCardData array', () => {
      const result = SectionTransformers.transformPosts(mockPostsNodes);

      expect(result).toHaveLength(3);
      expect(result[0].title).toBe('Test Post 1');
      expect(result[0].description).toBe('Test post 1 excerpt');
      expect(result[0].variant).toBe('light');
    });

    it('should extract featured image URL correctly', () => {
      const result = SectionTransformers.transformPosts(mockPostsNodes);

      expect(result[0].image).toBe('/images/test-post-1.png');
    });

    it('should use default image when featured image is null', () => {
      const result = SectionTransformers.transformPosts(mockPostsNodes);

      // Third post has no featured image
      expect(result[2].image).toBe('/images/Blog-sample-img-optimized.webp');
    });

    it('should generate notebook link from slug', () => {
      const result = SectionTransformers.transformPosts(mockPostsNodes);

      expect(result[0].link).toBe('/notebook/test-post-1');
    });

    it('should return empty array for non-array input', () => {
      expect(SectionTransformers.transformPosts(null as unknown as unknown[])).toEqual([]);
      expect(SectionTransformers.transformPosts(undefined as unknown as unknown[])).toEqual([]);
    });

    it('should return empty array for empty array input', () => {
      expect(SectionTransformers.transformPosts([])).toEqual([]);
    });

    it('should handle posts with missing optional fields', () => {
      const incompletePosts = [
        {
          title: 'Minimal Post',
          slug: 'minimal-post',
        },
      ];

      const result = SectionTransformers.transformPosts(incompletePosts);

      expect(result[0].title).toBe('Minimal Post');
      expect(result[0].description).toBe('No description available');
      expect(result[0].image).toBe('/images/Blog-sample-img-optimized.webp');
      expect(result[0].link).toBe('/notebook/minimal-post');
    });

    it('should use default title when title is missing', () => {
      const postWithoutTitle = [{ slug: 'no-title' }];
      const result = SectionTransformers.transformPosts(postWithoutTitle);

      expect(result[0].title).toBe('Untitled Post');
    });

    it('should use # for link when slug is missing', () => {
      const postWithoutSlug = [{ title: 'No Slug Post' }];
      const result = SectionTransformers.transformPosts(postWithoutSlug);

      expect(result[0].link).toBe('#');
    });
  });

  describe('createStaticInfoCards', () => {
    it('should return exactly two info cards', () => {
      const result = SectionTransformers.createStaticInfoCards();

      expect(result).toHaveLength(2);
    });

    it('should include bookshelf card with correct data', () => {
      const result = SectionTransformers.createStaticInfoCards();
      const bookshelfCard = result.find(card => card.title === 'BOOKSHELF');

      expect(bookshelfCard).toBeDefined();
      expect(bookshelfCard?.description).toBe("Books and pieces of wisdom I've enjoyed reading");
      expect(bookshelfCard?.link).toBe('/bookshelf');
      expect(bookshelfCard?.image).toBe('/images/books-bg-optimized.webp');
    });

    it('should include tech stack card with correct data', () => {
      const result = SectionTransformers.createStaticInfoCards();
      const techCard = result.find(card => card.title === 'TECH STACK');

      expect(techCard).toBeDefined();
      expect(techCard?.description).toBe('The dev tools, apps, devices, and games I use and play with');
      expect(techCard?.link).toBe('/tech-stack');
      expect(techCard?.image).toBe('/images/tech-bg-optimized.webp');
    });
  });

  describe('createInfoCardsFromACF', () => {
    it('should create cards from ACF data when available', () => {
      const result = SectionTransformers.createInfoCardsFromACF(mockHomepageSections);

      expect(result).toHaveLength(2);
    });

    it('should use ACF titles when available', () => {
      const result = SectionTransformers.createInfoCardsFromACF(mockHomepageSections);

      expect(result[0].title).toBe('BOOKSHELF');
      expect(result[1].title).toBe('TECH STACK');
    });

    it('should use ACF descriptions when available', () => {
      const result = SectionTransformers.createInfoCardsFromACF(mockHomepageSections);

      expect(result[0].description).toBe('Test bookshelf description');
      expect(result[1].description).toBe('Test tech stack description');
    });

    it('should use ACF images when available', () => {
      const result = SectionTransformers.createInfoCardsFromACF(mockHomepageSections);

      expect(result[0].image).toBe('/images/test-books.webp');
      expect(result[1].image).toBe('/images/test-tech.webp');
    });

    it('should return static cards when homepageData is null', () => {
      const result = SectionTransformers.createInfoCardsFromACF(null);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('BOOKSHELF');
      expect(result[0].image).toBe('/images/books-bg-optimized.webp');
    });

    it('should return static cards when ACF sections are missing', () => {
      const emptyHomepageData = {
        heroSection: null,
        aboutSection: null,
        bookshelfSection: null,
        techstackSection: null,
        notebookSection: null,
        contactSection: null,
      };

      const result = SectionTransformers.createInfoCardsFromACF(emptyHomepageData);

      expect(result).toHaveLength(2);
      expect(result[0].title).toBe('BOOKSHELF');
    });

    it('should use default values when ACF fields are empty', () => {
      const partialACF = {
        heroSection: null,
        aboutSection: null,
        bookshelfSection: {
          title: null,
          description: null,
          featuredImage: null,
        },
        techstackSection: null,
        notebookSection: null,
        contactSection: null,
      };

      const result = SectionTransformers.createInfoCardsFromACF(partialACF);

      expect(result[0].title).toBe('BOOKSHELF');
      expect(result[0].description).toBe("Books and pieces of wisdom I've enjoyed reading");
      expect(result[0].image).toBe('/images/books-bg.png');
    });

    it('should create only bookshelf card when techstack is missing', () => {
      const onlyBookshelf = {
        heroSection: null,
        aboutSection: null,
        bookshelfSection: {
          title: 'Books',
          description: 'My books',
          featuredImage: { node: { sourceUrl: '/books.png' } },
        },
        techstackSection: null,
        notebookSection: null,
        contactSection: null,
      };

      const result = SectionTransformers.createInfoCardsFromACF(onlyBookshelf);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Books');
    });
  });
});

describe('createSectionConfig', () => {
  it('should create a section config with all required fields', () => {
    const config = createSectionConfig('test-section', 'hero', { title: 'Test' }, 1, true);

    expect(config.id).toBe('test-section');
    expect(config.component).toBe('hero');
    expect(config.props).toEqual({ title: 'Test' });
    expect(config.order).toBe(1);
    expect(config.enabled).toBe(true);
  });

  it('should use default values for optional parameters', () => {
    const config = createSectionConfig('test', 'about', {});

    expect(config.order).toBe(0);
    expect(config.enabled).toBe(true);
  });

  it('should allow disabled sections', () => {
    const config = createSectionConfig('disabled', 'contact', {}, 5, false);

    expect(config.enabled).toBe(false);
  });
});

describe('SectionFactory', () => {
  describe('createHomepageSections', () => {
    it('should create all 6 homepage sections', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        mockPostsResponse
      );

      expect(result).toHaveLength(6);
    });

    it('should create sections in correct order', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        mockPostsResponse
      );

      expect(result[0].id).toBe('hero');
      expect(result[0].order).toBe(1);
      expect(result[1].id).toBe('projects');
      expect(result[1].order).toBe(2);
      expect(result[2].id).toBe('about');
      expect(result[2].order).toBe(3);
      expect(result[3].id).toBe('info-cards');
      expect(result[3].order).toBe(4);
      expect(result[4].id).toBe('notebook');
      expect(result[4].order).toBe(5);
      expect(result[5].id).toBe('contact');
      expect(result[5].order).toBe(6);
    });

    it('should assign correct component types', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        mockPostsResponse
      );

      expect(result[0].component).toBe('hero');
      expect(result[1].component).toBe('projects');
      expect(result[2].component).toBe('about');
      expect(result[3].component).toBe('infocards');
      expect(result[4].component).toBe('infocards');
      expect(result[5].component).toBe('contact');
    });

    it('should transform and include project cards', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        mockPostsResponse
      );

      const projectsSection = result.find(s => s.id === 'projects');
      expect(projectsSection?.props.cards).toHaveLength(2);
      expect((projectsSection?.props.cards as any[])[0].title).toBe('Test Project 1');
    });

    it('should transform and include post cards', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        mockPostsResponse
      );

      const notebookSection = result.find(s => s.id === 'notebook');
      expect(notebookSection?.props.cards).toHaveLength(3);
      expect((notebookSection?.props.cards as any[])[0].title).toBe('Test Post 1');
    });

    it('should include info cards from ACF data', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        mockPostsResponse
      );

      const infoCardsSection = result.find(s => s.id === 'info-cards');
      expect(infoCardsSection?.props.cards).toHaveLength(2);
    });

    it('should handle null homepage data', () => {
      const result = SectionFactory.createHomepageSections(
        null,
        mockProjectsResponse,
        mockPostsResponse
      );

      expect(result).toHaveLength(6);
      // Hero section should have undefined data
      expect(result[0].props.data).toBeUndefined();
    });

    it('should handle empty projects data', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        { projects: { nodes: [] } },
        mockPostsResponse
      );

      const projectsSection = result.find(s => s.id === 'projects');
      expect(projectsSection?.props.cards).toEqual([]);
    });

    it('should handle empty posts data', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        { posts: { nodes: [] } }
      );

      const notebookSection = result.find(s => s.id === 'notebook');
      expect(notebookSection?.props.cards).toEqual([]);
    });

    it('should handle undefined projects and posts data', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        undefined,
        undefined
      );

      const projectsSection = result.find(s => s.id === 'projects');
      const notebookSection = result.find(s => s.id === 'notebook');

      expect(projectsSection?.props.cards).toEqual([]);
      expect(notebookSection?.props.cards).toEqual([]);
    });

    it('should include correct props for projects section', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        mockPostsResponse
      );

      const projectsSection = result.find(s => s.id === 'projects');
      expect(projectsSection?.props.skin).toBe('projects');
      expect(projectsSection?.props.variant).toBe('dark');
      expect(projectsSection?.props.sectionNumber).toBe('01');
      expect(projectsSection?.props.sectionTitle).toBe('Projects');
      expect(projectsSection?.props.columns).toBe(3);
      expect(projectsSection?.props.viewMoreLink).toBe('/projects');
    });

    it('should include correct props for notebook section', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        mockPostsResponse
      );

      const notebookSection = result.find(s => s.id === 'notebook');
      expect(notebookSection?.props.skin).toBe('blog');
      expect(notebookSection?.props.variant).toBe('light');
      expect(notebookSection?.props.sectionNumber).toBe('03');
      expect(notebookSection?.props.columns).toBe(3);
      expect(notebookSection?.props.viewMoreLink).toBe('/notebook');
    });

    it('should use notebook title from ACF data', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        mockPostsResponse
      );

      const notebookSection = result.find(s => s.id === 'notebook');
      expect(notebookSection?.props.sectionTitle).toBe('NOTEBOOK');
    });

    it('should use default notebook title when ACF is null', () => {
      const result = SectionFactory.createHomepageSections(
        null,
        mockProjectsResponse,
        mockPostsResponse
      );

      const notebookSection = result.find(s => s.id === 'notebook');
      expect(notebookSection?.props.sectionTitle).toBe('NOTEBOOK');
    });

    it('should pass hero data to hero section', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        mockPostsResponse
      );

      const heroSection = result.find(s => s.id === 'hero');
      expect(heroSection?.props.data).toEqual(mockHomepageSections.heroSection);
    });

    it('should pass about data to about section', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        mockPostsResponse
      );

      const aboutSection = result.find(s => s.id === 'about');
      expect(aboutSection?.props.data).toEqual(mockHomepageSections.aboutSection);
    });

    it('should pass contact data to contact section', () => {
      const result = SectionFactory.createHomepageSections(
        mockHomepageSections,
        mockProjectsResponse,
        mockPostsResponse
      );

      const contactSection = result.find(s => s.id === 'contact');
      expect(contactSection?.props.data).toEqual(mockHomepageSections.contactSection);
    });
  });
});
