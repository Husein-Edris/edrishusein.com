// app/api/project/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { GraphQLClient } from 'graphql-request';

const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

// Simple query that should definitely work
const GET_PROJECT_SIMPLE = `
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
    console.log('Fetching basic project data for slug:', slug);
    const data = await client.request(GET_PROJECT_SIMPLE, { slug });
    return NextResponse.json(data);
  } catch (error) {
    console.error('API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch project data',
        message: error.message,
        slug: slug
      }, 
      { status: 500 }
    );
  }
}