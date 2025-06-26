// Schema discovery tool for WordPress GraphQL
import { client } from './client';

export async function discoverWordPressSchema() {
  try {
    // Test basic connectivity
    const basicTest = await client.request(`
      query BasicTest {
        generalSettings {
          title
          description
        }
      }
    `);
    
    console.log('✅ WordPress GraphQL is working');
    console.log('Site:', basicTest);

    // Test pages
    const pagesTest = await client.request(`
      query PagesTest {
        pages(first: 3) {
          nodes {
            id
            title
            slug
          }
        }
      }
    `);
    
    console.log('✅ Pages query working');
    console.log('Pages:', pagesTest);

    // Test if ACF is available
    try {
      const acfTest = await client.request(`
        query ACFTest {
          page(id: "home", idType: URI) {
            id
            title
            acfField: __typename
          }
        }
      `);
      
      console.log('✅ ACF might be available');
      console.log('ACF Test:', acfTest);
    } catch (acfError) {
      console.log('⚠️ ACF fields not configured yet');
    }

    // Test projects post type
    try {
      const projectsTest = await client.request(`
        query ProjectsTest {
          projects(first: 1) {
            nodes {
              id
              title
              slug
            }
          }
        }
      `);
      
      console.log('✅ Projects post type exists');
      console.log('Projects:', projectsTest);
    } catch (projectError) {
      console.log('⚠️ Projects post type not configured yet');
    }

    return { success: true, basic: basicTest, pages: pagesTest };
    
  } catch (error) {
    console.error('❌ WordPress GraphQL connection failed:', error);
    return { success: false, error };
  }
}

// Simple working queries for development
export const WORKING_QUERIES = {
  BASIC_SITE_INFO: `
    query BasicSiteInfo {
      generalSettings {
        title
        description
        url
      }
    }
  `,
  
  BASIC_PAGES: `
    query BasicPages {
      pages(first: 10) {
        nodes {
          id
          title
          content
          slug
        }
      }
    }
  `,
  
  BASIC_PROJECTS: `
    query BasicProjects {
      projects(first: 10) {
        nodes {
          id
          title
          content
          excerpt
          slug
          featuredImage {
            node {
              sourceUrl
              altText
            }
          }
        }
      }
    }
  `
};