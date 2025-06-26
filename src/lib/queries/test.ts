// Test queries to understand the actual schema
export const TEST_SCHEMA = `
  query TestSchema {
    __schema {
      types {
        name
        description
      }
    }
  }
`;

export const TEST_PAGES = `
  query TestPages {
    pages(first: 5) {
      nodes {
        id
        title
        content
        slug
      }
    }
  }
`;

export const TEST_SIMPLE_PAGE = `
  query TestSimplePage {
    page(id: "home", idType: URI) {
      id
      title
      content
      slug
    }
  }
`;