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
    
    let data: { projects: { nodes: unknown[] } };
    
    try {
      // Try the filtered query first
      data = await client.request(GET_OTHER_PROJECTS, { excludeSlug }) as { projects: { nodes: unknown[] } };
      console.log('✅ Filtered query successful');
    } catch (filterError) {
      console.warn('⚠️ Filtered query failed, falling back to get all projects:', filterError);
      // Fall back to getting all projects and filtering client-side
      data = await client.request(GET_ALL_PROJECTS) as { projects: { nodes: unknown[] } };
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
    console.error('❌ GraphQL failed, trying REST API fallback:', error);
    
    try {
      // REST API fallback
      const restUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/project?_embed&per_page=10`;
      const restResponse = await fetch(restUrl);
      
      if (restResponse.ok) {
        const restProjects = await restResponse.json();
        console.log('✅ REST API projects fetched for more-projects');
        
        // Transform and filter projects
        const transformedProjects = restProjects
          .filter((project: any) => project.slug !== excludeSlug) // Exclude current project
          .slice(0, 3) // Limit to 3 projects
          .map((project: any) => ({
            id: project.id.toString(),
            title: project.title?.rendered || project.title,
            excerpt: project.excerpt?.rendered || project.excerpt || '',
            slug: project.slug,
            featuredImage: (() => {
              const featuredMedia = project._embedded && project._embedded['wp:featuredmedia'] && project._embedded['wp:featuredmedia'][0];
              
              if (featuredMedia) {
                return {
                  node: {
                    sourceUrl: featuredMedia.source_url,
                    altText: featuredMedia.alt_text || project.title?.rendered || '',
                    mediaDetails: {
                      width: featuredMedia.media_details?.width || 800,
                      height: featuredMedia.media_details?.height || 600
                    }
                  }
                };
              }
              return null;
            })(),
            caseStudy: {
              projectLinks: {
                liveSite: project.acf_fields?.project_links?.live_site || project.acf?.project_links?.live_site || null,
                github: project.acf_fields?.project_links?.github || project.acf?.project_links?.github || null
              }
            }
          }));
        
        console.log('✅ Transformed', transformedProjects.length, 'projects for more-projects');
        
        return NextResponse.json({
          projects: {
            nodes: transformedProjects
          },
          source: 'wordpress-rest'
        });
      }
      
      throw new Error('REST API also failed');
    } catch (restError) {
      console.error('❌ REST API also failed:', restError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch other projects from both GraphQL and REST API',
          message: error instanceof Error ? error.message : 'Unknown error',
          excludeSlug: excludeSlug
        }, 
        { status: 500 }
      );
    }
  }
}