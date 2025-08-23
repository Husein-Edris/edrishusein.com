// ACF Debug endpoint to check WordPress ACF configuration
import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('id') || '165'; // Use the project ID from logs
  
  const diagnostics = {
    timestamp: new Date().toISOString(),
    projectId,
    wordpressUrl: WORDPRESS_REST_URL,
    tests: []
  };

  // Test 1: Get basic project data
  try {
    const basicProject = await fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/project/${projectId}`);
    if (basicProject.ok) {
      const data = await basicProject.json();
      diagnostics.tests.push({
        name: 'Basic Project Data',
        status: 'SUCCESS',
        details: {
          title: data.title?.rendered,
          hasACF: !!data.acf,
          acfType: Array.isArray(data.acf) ? 'array' : typeof data.acf,
          acfKeys: data.acf && typeof data.acf === 'object' ? Object.keys(data.acf) : 'N/A',
          allFields: Object.keys(data)
        }
      });
    }
  } catch (error) {
    diagnostics.tests.push({
      name: 'Basic Project Data',
      status: 'ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  // Test 2: Try different ACF endpoints
  const acfEndpoints = [
    `${WORDPRESS_REST_URL}/wp-json/wp/v2/project/${projectId}?acf_format=standard`,
    `${WORDPRESS_REST_URL}/wp-json/wp/v2/project/${projectId}?_fields=acf`,
    `${WORDPRESS_REST_URL}/wp-json/wp/v2/project/${projectId}?_fields=meta`,
    `${WORDPRESS_REST_URL}/wp-json/acf/v3/project/${projectId}`, // ACF REST API
    `${WORDPRESS_REST_URL}/wp-json/wp/v2/project/${projectId}?_embed`
  ];

  for (const endpoint of acfEndpoints) {
    try {
      const response = await fetch(endpoint);
      if (response.ok) {
        const data = await response.json();
        diagnostics.tests.push({
          name: `ACF Endpoint Test`,
          status: 'SUCCESS',
          endpoint,
          details: {
            hasACF: !!data.acf,
            acfData: data.acf,
            hasMeta: !!data.meta,
            metaKeys: data.meta ? Object.keys(data.meta) : 'N/A',
            allKeys: Object.keys(data)
          }
        });
      } else {
        diagnostics.tests.push({
          name: `ACF Endpoint Test`,
          status: 'FAILED',
          endpoint,
          details: `Status: ${response.status} - ${response.statusText}`
        });
      }
    } catch (error) {
      diagnostics.tests.push({
        name: `ACF Endpoint Test`,
        status: 'ERROR',
        endpoint,
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  }

  // Test 3: Check for custom field patterns
  try {
    const customFieldsEndpoint = `${WORDPRESS_REST_URL}/wp-json/wp/v2/project/${projectId}`;
    const response = await fetch(customFieldsEndpoint);
    if (response.ok) {
      const data = await response.json();
      
      // Look for any field that might contain ACF data
      const potentialACFFields = {};
      for (const [key, value] of Object.entries(data)) {
        if (key.includes('acf') || key.includes('field') || key.includes('meta') || 
            key.includes('project') || key.includes('tech') || key.includes('challenge')) {
          potentialACFFields[key] = value;
        }
      }
      
      diagnostics.tests.push({
        name: 'Custom Fields Search',
        status: 'SUCCESS',
        details: {
          potentialACFFields,
          allFieldNames: Object.keys(data)
        }
      });
    }
  } catch (error) {
    diagnostics.tests.push({
      name: 'Custom Fields Search',
      status: 'ERROR',
      details: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  return NextResponse.json(diagnostics, { status: 200 });
}