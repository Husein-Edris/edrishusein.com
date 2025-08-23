// WordPress diagnostic endpoint to check what's available
import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';

export async function GET(request: NextRequest) {
  const diagnostics = {
    timestamp: new Date().toISOString(),
    wordpressUrl: WORDPRESS_URL,
    tests: []
  };

  // Test 1: Check if WordPress REST API works
  try {
    const restResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/posts?per_page=1`);
    diagnostics.tests.push({
      name: 'WordPress REST API',
      status: restResponse.ok ? 'SUCCESS' : 'FAILED',
      details: `Status: ${restResponse.status}`
    });
  } catch (error) {
    diagnostics.tests.push({
      name: 'WordPress REST API',
      status: 'ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 2: Check available post types via REST
  try {
    const typesResponse = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/types`);
    if (typesResponse.ok) {
      const types = await typesResponse.json();
      const availableTypes = Object.keys(types);
      diagnostics.tests.push({
        name: 'Available Post Types (REST)',
        status: 'SUCCESS',
        details: `Found: ${availableTypes.join(', ')}`
      });
    }
  } catch (error) {
    diagnostics.tests.push({
      name: 'Available Post Types (REST)',
      status: 'ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 3: Check if project posts exist via REST
  const postTypeEndpoints = ['project', 'projects'];
  for (const postType of postTypeEndpoints) {
    try {
      const response = await fetch(`${WORDPRESS_URL}/wp-json/wp/v2/${postType}`);
      diagnostics.tests.push({
        name: `${postType} endpoint`,
        status: response.ok ? 'SUCCESS' : 'FAILED',
        details: `Status: ${response.status}`
      });
    } catch (error) {
      diagnostics.tests.push({
        name: `${postType} endpoint`,
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Test 4: Check GraphQL endpoint basic connectivity
  try {
    const graphqlResponse = await fetch(`${WORDPRESS_URL}/graphql`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query: '{ posts(first: 1) { nodes { id title } } }' })
    });
    
    if (graphqlResponse.ok) {
      const result = await graphqlResponse.json();
      diagnostics.tests.push({
        name: 'GraphQL Basic Query',
        status: result.errors ? 'PARTIAL' : 'SUCCESS',
        details: result.errors ? `Errors: ${result.errors.length}` : 'Posts query works'
      });
    }
  } catch (error) {
    diagnostics.tests.push({
      name: 'GraphQL Basic Query',
      status: 'ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 5: Check specific GraphQL queries
  const graphqlQueries = [
    { name: 'books', query: '{ books(first: 1) { nodes { id title } } }' },
    { name: 'projects', query: '{ projects(first: 1) { nodes { id title } } }' }
  ];

  for (const { name, query } of graphqlQueries) {
    try {
      const response = await fetch(`${WORDPRESS_URL}/graphql`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query })
      });
      
      if (response.ok) {
        const result = await response.json();
        diagnostics.tests.push({
          name: `GraphQL ${name} query`,
          status: result.errors ? 'FAILED' : 'SUCCESS',
          details: result.errors ? result.errors[0]?.message : `${name} accessible`
        });
      }
    } catch (error) {
      diagnostics.tests.push({
        name: `GraphQL ${name} query`,
        status: 'ERROR',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  return NextResponse.json(diagnostics, { status: 200 });
}