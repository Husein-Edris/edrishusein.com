// Debug endpoint to check available projects
import { NextResponse } from 'next/server';
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

const GET_ALL_PROJECTS = `
  query GetAllProjects {
    projects(first: 10) {
      nodes {
        id
        title
        slug
        status
      }
    }
  }
`;

export async function GET() {
  try {
    console.log('🔍 Fetching all projects for debugging...');
    const data = await client.request(GET_ALL_PROJECTS) as {
      projects: {
        nodes: Array<{
          id: string;
          title: string;
          slug: string;
          status: string;
        }>;
      };
    };
    
    console.log('✅ Projects found:', data.projects.nodes.length);
    data.projects.nodes.forEach((project) => {
      console.log(`  - ${project.title} (${project.slug}) [${project.status}]`);
    });
    
    return NextResponse.json({
      success: true,
      projects: data.projects.nodes,
      total: data.projects.nodes.length,
      endpoint: process.env.NEXT_PUBLIC_WORDPRESS_API_URL
    });
  } catch (error) {
    console.error('❌ Debug API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch projects',
        message: error instanceof Error ? error.message : 'Unknown error',
        endpoint: process.env.NEXT_PUBLIC_WORDPRESS_API_URL
      }, 
      { status: 500 }
    );
  }
}