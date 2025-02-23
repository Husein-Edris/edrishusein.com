export const GET_PROJECTS_DATA = `
  query GetProjectsData {
    # Get section title from homepage
    page(id: "home", idType: URI) {
      homepageSections {
        projectsSection {
          title
        }
      }
    }
    # Get projects using native WordPress fields
    projects(first: 3) {
      nodes {
        id
        title
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
        uri
      }
    }
  }
`;