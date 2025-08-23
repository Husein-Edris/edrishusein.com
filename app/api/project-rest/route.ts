// REST API alternative to get WordPress projects with ACF data
import { NextRequest, NextResponse } from 'next/server';

const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  
  if (!slug) {
    return NextResponse.json({ error: 'Slug parameter is required' }, { status: 400 });
  }
  
  try {
    console.log('🔍 Fetching project via WordPress REST API for slug:', slug);
    
    // WordPress uses different slug format, so let's try both
    const slugVariations = [
      slug, // original slug
      slug.replace(/ue/g, 'u').replace(/ae/g, 'a').replace(/oe/g, 'o'), // without umlauts
      slug.replace(/-/g, ''), // without hyphens
    ];

    const endpoints = [];
    for (const slugVar of slugVariations) {
      endpoints.push(
        `${WORDPRESS_REST_URL}/wp-json/wp/v2/project?slug=${slugVar}`,
        `${WORDPRESS_REST_URL}/wp-json/wp/v2/project?slug=${slugVar}&_embed`,
      );
    }

    let projectData = null;
    let endpointUsed = 'none';

    for (const endpoint of endpoints) {
      try {
        console.log(`🔗 Trying endpoint: ${endpoint}`);
        const response = await fetch(endpoint);
        
        if (!response.ok) {
          console.warn(`⚠️ Endpoint failed with status: ${response.status}`);
          continue;
        }
        
        const data = await response.json();
        
        if (Array.isArray(data) && data.length > 0) {
          projectData = data[0];
          endpointUsed = endpoint;
          console.log(`✅ Found project data via: ${endpoint}`);
          break;
        } else if (data.id) {
          projectData = data;
          endpointUsed = endpoint;
          console.log(`✅ Found project data via: ${endpoint}`);
          break;
        }
      } catch (error) {
        console.warn(`⚠️ Endpoint ${endpoint} failed:`, error.message);
        continue;
      }
    }

    if (!projectData) {
      throw new Error(`Project with slug "${slug}" not found via REST API`);
    }

    // Try to get ACF fields
    let acfData = null;
    try {
      const acfEndpoint = `${WORDPRESS_REST_URL}/wp-json/wp/v2/${projectData.type || 'posts'}/${projectData.id}?acf_format=standard&_fields=acf`;
      console.log(`🎯 Fetching ACF data from: ${acfEndpoint}`);
      
      const acfResponse = await fetch(acfEndpoint);
      if (acfResponse.ok) {
        const acfResult = await acfResponse.json();
        acfData = acfResult.acf;
        console.log('✅ ACF data retrieved:', Object.keys(acfData || {}));
      }
    } catch (acfError) {
      console.warn('⚠️ ACF data fetch failed:', acfError.message);
    }

    // Transform WordPress REST data to match our expected structure
    const transformedProject = {
      id: projectData.id.toString(),
      title: projectData.title?.rendered || projectData.title,
      slug: projectData.slug,
      content: projectData.content?.rendered || projectData.content || '',
      excerpt: projectData.excerpt?.rendered || projectData.excerpt || '',
      featuredImage: projectData._embedded?.['wp:featuredmedia']?.[0] ? {
        node: {
          sourceUrl: projectData._embedded['wp:featuredmedia'][0].source_url,
          altText: projectData._embedded['wp:featuredmedia'][0].alt_text,
          mediaDetails: {
            width: projectData._embedded['wp:featuredmedia'][0].media_details?.width,
            height: projectData._embedded['wp:featuredmedia'][0].media_details?.height
          }
        }
      } : null,
      caseStudy: acfData ? transformACFData(acfData) : null
    };

    console.log('✅ Project transformed successfully:', transformedProject.title);
    
    return NextResponse.json({ 
      project: transformedProject, 
      _meta: { 
        source: 'wordpress-rest',
        endpointUsed,
        hasACF: !!acfData
      } 
    });

  } catch (error) {
    console.error('❌ REST API error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to fetch project data via REST API',
        message: error instanceof Error ? error.message : 'Unknown error',
        slug: slug
      }, 
      { status: 500 }
    );
  }
}

// Transform ACF data to match expected case study structure
function transformACFData(acf: any) {
  if (!acf) return null;

  return {
    projectOverview: {
      technologies: acf.technologies || acf.tech_stack || []
    },
    projectContent: {
      challenge: acf.challenge || acf.the_challenge || '',
      solution: acf.solution || acf.the_solution || '',
      keyFeatures: acf.key_features || acf.features || []
    },
    projectGallery: acf.project_gallery || acf.gallery || [],
    projectLinks: {
      liveSite: acf.live_site || acf.website_url || acf.project_url || '',
      github: acf.github || acf.github_url || acf.repository || ''
    }
  };
}