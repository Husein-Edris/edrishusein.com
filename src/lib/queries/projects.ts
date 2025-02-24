// src/lib/queries/projects.ts
export const GET_PROJECTS_FOR_GRID = `
  query GetProjects {
    projects(first: 3) {
      nodes {
        id
        title
        excerpt
        slug
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
        caseStudy {
          projectLinks {
            liveSite
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
        slug
        excerpt
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
        caseStudy {
          projectLinks {
            liveSite
            github
          }
        }
      }
    }
  }
`;

export const GET_CASE_STUDY = `
  query GetCaseStudy($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      id
      title
      content
      excerpt
      featuredImage {
        node {
          sourceUrl
          altText
        }
      }
      caseStudy {
        projectOverview {
          technologies {
            ... on Tech {
              id
              title
              featuredImage {
                node {
                  sourceUrl
                  altText
                }
              }
            }
          }
        }
        projectContent {
          challenge
          solution
          keyFeatures {
            title
            description
            image {
              sourceUrl
              altText
            }
          }
        }
        projectGallery {
          sourceUrl
          altText
        }
        projectLinks {
          liveSite
          github
        }
      }
    }
  }
`;