// app/api/project/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

// Start with basic query and gradually add ACF fields
const GET_PROJECT_BASIC = `
  query GetProject($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      id
      title
      slug
      content
      excerpt
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
    }
  }
`;

// Try different ACF field variations
const GET_PROJECT_WITH_CASE_STUDY_V1 = `
  query GetProject($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      id
      title
      slug
      content
      excerpt
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
      caseStudy {
        projectOverview {
          techStack {
            ... on Tech {
              id
              title
              slug
            }
          }
        }
        projectContent {
          challenge
          solution
          keyFeatures {
            title
            description
          }
        }
        projectLinks {
          liveSite
          github
        }
      }
    }
  }
`;

// Alternative field names based on ACF export
const GET_PROJECT_WITH_CASE_STUDY_V2 = `
  query GetProject($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      id
      title
      slug
      content
      excerpt
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
      caseStudy {
        projectOverview {
          technologies {
            ... on Tech {
              id
              title
              slug
            }
          }
        }
        projectContent {
          challenge
          solution
          keyFeatures {
            title
            description
          }
        }
        projectLinks {
          liveSite
          github
        }
      }
    }
  }
`;

// Basic ACF with content sections
const GET_PROJECT_WITH_CASE_STUDY = `
  query GetProject($slug: ID!) {
    project(id: $slug, idType: SLUG) {
      id
      title
      slug
      content
      excerpt
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
      caseStudy {
        projectContent {
          challenge
          solution
        }
        projectLinks {
          liveSite
          github
        }
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
  }
  
  try {
    console.log('Fetching project data for slug:', slug);
    
    // Try different query variations to find working ACF structure
    let data: { project: any };
    let queryUsed = 'unknown';
    
    const queries = [
      { name: 'Enhanced V2 (technologies)', query: GET_PROJECT_WITH_CASE_STUDY_V2 },
      { name: 'Enhanced V1 (techStack)', query: GET_PROJECT_WITH_CASE_STUDY_V1 },
      { name: 'Basic ACF (projectLinks)', query: GET_PROJECT_WITH_CASE_STUDY },
      { name: 'Minimal (no ACF)', query: GET_PROJECT_BASIC }
    ];
    
    for (const { name, query } of queries) {
      try {
        console.log(`🔍 Trying ${name} query...`);
        data = await client.request(query, { slug }) as { project: any };
        queryUsed = name;
        console.log(`✅ ${name} query successful!`);
        break;
      } catch (queryError) {
        console.warn(`⚠️ ${name} query failed:`, queryError.message);
        continue;
      }
    }
    
    if (!data!) {
      throw new Error('All query variations failed');
    }
    
    if (!data.project) {
      throw new Error(`Project with slug "${slug}" not found`);
    }
    
    console.log('✅ Project data retrieved:', data.project.title, `(using ${queryUsed} query)`);
    console.log('📊 Available fields:', Object.keys(data.project));
    if (data.project.caseStudy) {
      console.log('📋 Case study fields:', Object.keys(data.project.caseStudy));
    }
    
    return NextResponse.json({ ...data, _meta: { queryUsed } });
  } catch (error) {
    console.error('❌ API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch project data',
        message: error instanceof Error ? error.message : 'Unknown error',
        slug: slug,
        details: error instanceof Error ? error.stack : null
      }, 
      { status: 500 }
    );
  }
}