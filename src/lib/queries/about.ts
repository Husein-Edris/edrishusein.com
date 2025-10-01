import { gql } from 'graphql-request';

export const GET_ABOUT_PAGE_DATA = gql`
  query GetAboutPageData {
    page(id: "about-me", idType: SLUG) {
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
      aboutPageFieldsNew {
        aboutHeroTitle
        aboutHeroSubtitle
        aboutHeroImage {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
        experienceSectionTitle
        experienceItems {
          companyName
          position
          duration
          description
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
        skillsSectionTitle
        selectedSkills {
          ... on Skill {
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
          }
        }
        personalSectionTitle
        personalContent
        personalImage {
          sourceUrl
          altText
          mediaDetails {
            width
            height
          }
        }
        selectedHobbies {
          ... on Hobby {
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
          }
        }
      }
      seo {
        title
        metaDesc
        canonical
        robots
        focusKeywords
        opengraphImage {
          sourceUrl
          altText
        }
        twitterImage {
          sourceUrl
          altText
        }
        breadcrumbs {
          text
          url
        }
        schema {
          pageType
          articleType
        }
        social {
          facebook {
            title
            description
            image
          }
          twitter {
            title
            description
            image
            cardType
          }
        }
      }
    }
  }
`;

export const GET_ALL_SKILLS = gql`
  query GetAllSkills($limit: Int = 50) {
    skills(first: $limit) {
      nodes {
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
      }
    }
  }
`;

export const GET_ALL_HOBBIES = gql`
  query GetAllHobbies($limit: Int = 50) {
    hobbies(first: $limit) {
      nodes {
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
      }
    }
  }
`;

export const GET_ALL_TECHS = gql`
  query GetAllTechs($limit: Int = 50) {
    techs(first: $limit) {
      nodes {
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
      }
    }
  }
`;