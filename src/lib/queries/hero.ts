import { gql } from 'graphql-request';

export const GET_HOMEPAGE_DATA = gql`
  query GetHomepage {
    page(id: "home", idType: URI) {
      homepageSections {
        heroSection {
          title
          heroCopy
          heroImage {
            url
            alt
            width
            height
          }
        }
      }
    }
  }
`;