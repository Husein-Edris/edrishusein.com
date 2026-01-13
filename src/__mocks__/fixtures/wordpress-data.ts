// Mock WordPress data fixtures for testing
// These match the structure expected by DataFetcher and transformers

export const mockHomepageSections = {
  heroSection: {
    title: "Test Hero Title",
    heroCopy: "Test hero description text.",
    heroImage: {
      node: {
        sourceUrl: "/images/test-hero.png",
        altText: "Test Hero Image",
        mediaDetails: {
          width: 450,
          height: 450
        }
      }
    }
  },
  aboutSection: {
    title: "About Test",
    aboutMeText: "Test about me text content."
  },
  bookshelfSection: {
    title: "BOOKSHELF",
    description: "Test bookshelf description",
    featuredImage: {
      node: {
        sourceUrl: "/images/test-books.webp",
        altText: "Books Background",
        mediaDetails: { width: 400, height: 300 }
      }
    }
  },
  techstackSection: {
    title: "TECH STACK",
    description: "Test tech stack description",
    featuredImage: {
      node: {
        sourceUrl: "/images/test-tech.webp",
        altText: "Tech Background",
        mediaDetails: { width: 400, height: 300 }
      }
    }
  },
  notebookSection: {
    title: "NOTEBOOK"
  },
  contactSection: {
    subTitle: "Get in touch",
    title: "Let's work together",
    email: "test@example.com"
  }
};

export const mockHomepageResponse = {
  page: {
    homepageSections: mockHomepageSections
  }
};

export const mockProjectsNodes = [
  {
    id: "project-1",
    title: "Test Project 1",
    excerpt: "Test project 1 description",
    slug: "test-project-1",
    content: "<p>Test project content</p>",
    featuredImage: {
      node: {
        sourceUrl: "/images/test-project-1.png",
        altText: "Test Project 1",
        mediaDetails: { height: 600, width: 800 }
      }
    },
    caseStudy: {
      projectContent: {
        challenge: "<p>Test challenge</p>",
        solution: "<p>Test solution</p>"
      },
      projectLinks: {
        liveSite: "https://test-project-1.com"
      }
    }
  },
  {
    id: "project-2",
    title: "Test Project 2",
    excerpt: "Test project 2 description",
    slug: "test-project-2",
    content: "<p>Test project 2 content</p>",
    featuredImage: {
      node: {
        sourceUrl: "/images/test-project-2.png",
        altText: "Test Project 2",
        mediaDetails: { height: 600, width: 800 }
      }
    },
    caseStudy: {
      projectLinks: {
        liveSite: null
      }
    }
  }
];

export const mockProjectsResponse = {
  projects: {
    nodes: mockProjectsNodes
  }
};

export const mockPostsNodes = [
  {
    id: "post-1",
    title: "Test Post 1",
    excerpt: "Test post 1 excerpt",
    slug: "test-post-1",
    date: "2024-01-15",
    featuredImage: {
      node: {
        sourceUrl: "/images/test-post-1.png",
        altText: "Test Post 1",
        mediaDetails: { height: 400, width: 600 }
      }
    }
  },
  {
    id: "post-2",
    title: "Test Post 2",
    excerpt: "Test post 2 excerpt",
    slug: "test-post-2",
    date: "2024-01-10",
    featuredImage: {
      node: {
        sourceUrl: "/images/test-post-2.png",
        altText: "Test Post 2",
        mediaDetails: { height: 400, width: 600 }
      }
    }
  },
  {
    id: "post-3",
    title: "Test Post 3",
    excerpt: "Test post 3 excerpt",
    slug: "test-post-3",
    date: "2024-01-05",
    featuredImage: null
  }
];

export const mockPostsResponse = {
  posts: {
    nodes: mockPostsNodes
  }
};

export const mockAboutPageResponse = {
  page: {
    id: "about-1",
    title: "About Test User",
    content: "<p>Test about content</p>",
    featuredImage: {
      node: {
        sourceUrl: "/images/test-about.png",
        altText: "Test About Image",
        mediaDetails: { width: 450, height: 450 }
      }
    },
    aboutPageFields: {
      aboutHeroTitle: "About Test User",
      aboutHeroSubtitle: "Test subtitle",
      aboutHeroImage: {
        sourceUrl: "/images/test-hero.png",
        altText: "Test Hero",
        mediaDetails: { width: 450, height: 450 }
      },
      experienceSectionTitle: "Experience",
      experienceItems: [
        {
          companyName: "Test Company",
          position: "Test Position",
          duration: "2023 - 2024",
          description: "<p>Test description</p>",
          technologies: []
        }
      ],
      skillsSectionTitle: "Skills",
      selectedSkills: [],
      personalSectionTitle: "Personal",
      personalContent: "<p>Test personal content</p>",
      personalImage: {
        sourceUrl: "/images/test-personal.png",
        altText: "Test Personal",
        mediaDetails: { width: 450, height: 450 }
      },
      selectedHobbies: []
    }
  }
};

// Partial/incomplete data fixtures for edge case testing
export const mockPartialHomepageSections = {
  heroSection: {
    title: "Test Hero",
    heroCopy: null,
    heroImage: null
  },
  aboutSection: null,
  bookshelfSection: null,
  techstackSection: null,
  notebookSection: null,
  contactSection: null
};

export const mockEmptyProjectsResponse = {
  projects: {
    nodes: []
  }
};

export const mockEmptyPostsResponse = {
  posts: {
    nodes: []
  }
};

// REST API response format (different from GraphQL)
export const mockRESTProjects = [
  {
    id: 1,
    title: { rendered: "REST Project 1" },
    excerpt: { rendered: "REST project 1 excerpt" },
    slug: "rest-project-1",
    _embedded: {
      'wp:featuredmedia': [{
        source_url: "/images/rest-project-1.png",
        alt_text: "REST Project 1",
        media_details: { height: 600, width: 800 }
      }]
    },
    acf: {
      project_links: {
        live_site: "https://rest-project-1.com"
      }
    }
  }
];

export const mockRESTPosts = [
  {
    id: 1,
    title: { rendered: "REST Post 1" },
    excerpt: { rendered: "REST post 1 excerpt" },
    slug: "rest-post-1",
    date: "2024-01-15T10:00:00",
    _embedded: {
      'wp:featuredmedia': [{
        source_url: "/images/rest-post-1.png",
        alt_text: "REST Post 1",
        media_details: { width: 600, height: 400 }
      }]
    }
  }
];

export const mockRESTHomepage = [
  {
    id: 1,
    acf: {
      hero_title: "REST Hero Title",
      hero_copy: "REST hero copy",
      hero_image: {
        url: "/images/rest-hero.png",
        alt: "REST Hero"
      },
      about_title: "About",
      about_text: "REST about text"
    }
  }
];

// SEO data fixtures
export const mockRankMathSEO = {
  title: "Test Page Title | Edris Husein",
  metaDesc: "Test meta description for SEO testing",
  canonical: "https://edrishusein.com/test-page",
  robots: ["index", "follow"],
  focusKeywords: ["test", "seo", "keywords"],
  opengraphImage: {
    sourceUrl: "https://edrishusein.com/images/og-image.png",
    altText: "OG Image"
  },
  twitterImage: {
    sourceUrl: "https://edrishusein.com/images/twitter-image.png",
    altText: "Twitter Image"
  },
  social: {
    facebook: {
      title: "Facebook Title",
      description: "Facebook description",
      image: "https://edrishusein.com/images/fb-image.png"
    },
    twitter: {
      title: "Twitter Title",
      description: "Twitter description",
      image: "https://edrishusein.com/images/tw-image.png",
      cardType: "summary_large_image"
    }
  }
};

export const mockPartialSEO = {
  title: "Partial SEO Title",
  metaDesc: null,
  canonical: null,
  opengraphImage: null,
  twitterImage: null
};
