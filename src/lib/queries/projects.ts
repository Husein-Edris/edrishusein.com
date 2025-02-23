// src/lib/queries/projects.ts
export const GET_PROJECTS_FOR_GRID = `
  query GetProjects {
    projects(first: 3, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        excerpt
        uri
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              height
              width
            }
          }
        }
      }
    }
  }
`;

export const GET_ALL_PROJECTS = `
  query GetAllProjects {
    projects(first: 100, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        excerpt
        uri
        featuredImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              height
              width
            }
          }
        }
      }
    }
  }
`;