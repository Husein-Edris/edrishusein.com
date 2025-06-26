// API route for fetching other projects (excluding current one)
import { NextRequest, NextResponse } from 'next/server';
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

const GET_OTHER_PROJECTS = `
  query GetOtherProjects($excludeSlug: String!) {
    projects(first: 3, where: { nameNotIn: [$excludeSlug] }) {
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
            github
          }
        }
      }
    }
  }
`;

// Fallback query if the nameNotIn filter doesn't work
const GET_ALL_PROJECTS = `
  query GetAllProjects {
    projects(first: 10) {
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
            github
          }
        }
      }
    }
  }
`;

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const excludeSlug = searchParams.get('exclude');
  
  if (!excludeSlug) {
    return NextResponse.json({ error: 'exclude parameter is required' }, { status: 400 });
  }
  
  try {
    console.log('🔍 Fetching other projects, excluding:', excludeSlug);
    
    let data: { projects: { nodes: any[] } };
    
    try {
      // Try the filtered query first
      data = await client.request(GET_OTHER_PROJECTS, { excludeSlug }) as { projects: { nodes: any[] } };
      console.log('✅ Filtered query successful');
    } catch (filterError) {
      console.warn('⚠️ Filtered query failed, falling back to get all projects:', filterError);
      // Fall back to getting all projects and filtering client-side
      data = await client.request(GET_ALL_PROJECTS) as { projects: { nodes: any[] } };
      // Filter out the current project
      data.projects.nodes = data.projects.nodes.filter(project => project.slug !== excludeSlug);
      console.log('✅ Fallback query successful');
    }
    
    // Limit to 3 projects
    const limitedProjects = data.projects.nodes.slice(0, 3);
    
    console.log('✅ Found', limitedProjects.length, 'other projects');
    
    return NextResponse.json({
      projects: {
        nodes: limitedProjects
      }
    });
  } catch (error) {
    console.error('❌ More projects API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch other projects',
        message: error instanceof Error ? error.message : 'Unknown error',
        excludeSlug: excludeSlug
      }, 
      { status: 500 }
    );
  }
}