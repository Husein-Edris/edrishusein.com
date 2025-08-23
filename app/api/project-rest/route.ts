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

    // Try to get ACF fields - try multiple methods
    let acfData = null;
    try {
      // Method 1: Direct project endpoint with ACF
      const projectWithACF = `${WORDPRESS_REST_URL}/wp-json/wp/v2/project/${projectData.id}?acf_format=standard`;
      console.log(`🎯 Fetching full project with ACF from: ${projectWithACF}`);
      
      const fullProjectResponse = await fetch(projectWithACF);
      if (fullProjectResponse.ok) {
        const fullProject = await fullProjectResponse.json();
        // Check both acf and acf_fields (WordPress sometimes uses acf_fields)
        acfData = fullProject.acf_fields || fullProject.acf || null;
        console.log('✅ Full project ACF data:', acfData ? Object.keys(acfData) : 'empty');
        console.log('📄 Full ACF object:', JSON.stringify(acfData, null, 2));
      }
      
      // Method 2: If no ACF data, try alternative endpoint
      if (!acfData || Object.keys(acfData || {}).length === 0) {
        const altEndpoint = `${WORDPRESS_REST_URL}/wp-json/wp/v2/project/${projectData.id}?_fields=acf,meta`;
        console.log(`🔄 Trying alternative ACF endpoint: ${altEndpoint}`);
        
        const altResponse = await fetch(altEndpoint);
        if (altResponse.ok) {
          const altResult = await altResponse.json();
          acfData = altResult.acf_fields || altResult.acf || altResult.meta || null;
          console.log('✅ Alternative ACF data:', acfData ? Object.keys(acfData) : 'empty');
        }
      }
      
      // Method 3: If still no ACF, check the original project data
      if (!acfData || Object.keys(acfData || {}).length === 0) {
        console.log('🔍 Checking original project data for ACF fields');
        acfData = projectData.acf_fields || projectData.acf || null;
        console.log('✅ Project data ACF:', acfData ? Object.keys(acfData) : 'not found in original data');
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
    console.log('📋 Case study data:', transformedProject.caseStudy ? 'Present' : 'Missing');
    if (transformedProject.caseStudy) {
      console.log('📊 Case study fields:', Object.keys(transformedProject.caseStudy));
    }
    
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
  if (!acf) {
    console.log('⚠️ No ACF data to transform');
    return null;
  }

  console.log('🔄 Transforming ACF data:', JSON.stringify(acf, null, 2));
  
  // Handle the actual WordPress ACF structure from acf_fields
  const transformed = {
    projectOverview: {
      // Transform tech_stack array from project_overview section - convert WP tech posts to simple format
      technologies: (acf.project_overview?.tech_stack || acf.tech_stack || acf.technologies || []).map((tech: any) => {
        // Handle WordPress tech post objects
        if (tech && typeof tech === 'object' && tech.post_title) {
          return {
            id: tech.ID || tech.id,
            title: tech.post_title,
            featuredImage: tech.featured_image ? {
              node: {
                sourceUrl: tech.featured_image.source_url || tech.featured_image,
                altText: tech.post_title
              }
            } : null
          };
        }
        // Handle simple objects
        return tech;
      })
    },
    projectContent: {
      // Get challenge and solution from project_content section
      challenge: acf.project_content?.challenge || acf.challenge || acf.the_challenge || '',
      solution: acf.project_content?.solution || acf.solution || acf.the_solution || '',
      // Key Features (can be null in WordPress)
      keyFeatures: acf.project_content?.key_features || acf.key_features || acf.features || []
    },
    // Project Gallery section
    projectGallery: acf.project_gallery || acf.gallery || [],
    projectLinks: {
      // Get links from project_links section
      liveSite: acf.project_links?.live_site || acf.live_site_url || acf.live_site || acf.website_url || acf.project_url || '',
      github: acf.project_links?.github || acf.github_repository || acf.github || acf.github_url || acf.repository || ''
    }
  };
  
  console.log('✅ ACF data transformed:', JSON.stringify(transformed, null, 2));
  return transformed;
}