// src/lib/queries/index.ts
export * from './about';
export const GET_HOMEPAGE_DATA = `
  query GetHomepage {
    page(id: "home", idType: URI) {
      id
      title
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
        projectsSection {
          title
        }
        aboutSection {
          title
          aboutMeText
        }
        bookshelfSection {
          title
          description
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
        techstackSection {
          title
          description
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
        notebookSection {
          title
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

export const GET_POSTS_FOR_NOTEBOOK = `
  query GetPostsForNotebook {
    posts(first: 3, where: { orderby: { field: DATE, order: DESC } }) {
      nodes {
        id
        title
        excerpt
        slug
        date
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

export const GET_CASE_STUDY = `
  query GetCaseStudy($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      title
      excerpt
      content
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
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
            nodes {
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

export const GET_POST_BY_SLUG = `
  query GetPostBySlug($slug: ID!) {
    post(id: $slug, idType: SLUG) {
      title
      content
      excerpt
      date
      slug
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      author {
        node {
          name
          avatar {
            url
          }
          description
        }
      }
      categories {
        nodes {
          name
          slug
        }
      }
      tags {
        nodes {
          name
          slug
        }
      }
      blogPostFields {
        readingTime
        conclusionSection {
          conclusionTitle
          conclusionPoints {
            pointText
          }
        }
        customTags {
          tagName
          tagColor
        }
        authorBioOverride
      }
      seo {
        title
        metaDesc
        opengraphImage {
          sourceUrl
        }
      }
    }
  }
`;

export const GET_ALL_TECH = `
  query GetAllTech {
    techs(first: 50) {
      nodes {
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
`;

export const GET_ABOUT_PAGE = `
  query GetAboutPage {
    page(id: "about", idType: URI) {
      id
      title
      content
      featuredImage {
        node {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
      }
      aboutPageFields {
        aboutHeroTitle
        aboutHeroSubtitle
        aboutHeroImage {
          node {
            sourceUrl
            altText
            mediaDetails {
              width
              height
            }
          }
        }
        experienceSection {
          sectionTitle
          experienceItems {
            companyName
            position
            duration
            description
            technologies
          }
        }
        skillsSection {
          sectionTitle
          skillCategories {
            categoryName
            skills {
              skillName
              proficiencyLevel
            }
          }
        }
        personalSection {
          sectionTitle
          personalContent
          personalImage {
            node {
              sourceUrl
              altText
              mediaDetails {
                width
                height
              }
            }
          }
        }
      }
      seo {
        title
        metaDesc
        opengraphImage {
          sourceUrl
        }
      }
    }
  }
`;