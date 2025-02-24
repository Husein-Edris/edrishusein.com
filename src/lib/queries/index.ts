// src/lib/queries/index.ts
export const GET_HOMEPAGE_DATA = `
  query GetHomepage {
    page(id: "home", idType: URI) {
      homepageSections {
        heroSection {
          title
          heroCopy
          heroImage {
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
        aboutSection {
          title
          aboutMeText
        }
        bookshelfSection {
          title
          description
          featuredImage {
            sourceUrl
            altText
          }
          button {
            url
            title
            target
          }
        }
        techstackSection {
          title
          description
          featuredImage {
            sourceUrl
            altText
          }
          button {
            url
            title
            target
          }
        }
        notebookSection {
          title
          button {
            url
            title
            target
          }
        }
        contactSection {
          subTitle
          title
          email
        }
      }
    }
  }
`;

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

export const GET_CASE_STUDY = `
  query GetCaseStudy($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      title
      seo {
        title
        metaDesc
        opengraphImage {
          sourceUrl
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