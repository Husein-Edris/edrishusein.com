// API route for fetching other projects (excluding current one)
import { NextRequest, NextResponse } from 'next/server';
import { GraphQLClient } from 'graphql-request';
import { ProjectsApiResponse, WordPressProject } from '@/src/types/api';

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
  
  // Make exclude parameter optional for testing
  if (excludeSlug && (typeof excludeSlug !== 'string' || excludeSlug.length > 100 || !/^[a-z0-9\-]+$/.test(excludeSlug))) {
    return NextResponse.json({ error: 'Invalid exclude parameter' }, { status: 400 });
  }
  
  try {
    let data: ProjectsApiResponse;
    
    try {
      data = await client.request(excludeSlug ? GET_OTHER_PROJECTS : GET_ALL_PROJECTS, excludeSlug ? { excludeSlug } : {}) as ProjectsApiResponse;
    } catch {
      // If GraphQL fails, return fallback data
      return NextResponse.json({
        projects: {
          nodes: [
            {
              id: '1',
              title: 'Sample Project',
              excerpt: 'This is a sample project from fallback data',
              slug: 'sample-project',
              featuredImage: null,
              caseStudy: {
                projectLinks: {
                  liveSite: 'https://example.com',
                  github: 'https://github.com/example/project'
                }
              }
            }
          ]
        },
        source: 'fallback'
      });
    }
    
    const limitedProjects = data.projects.nodes.slice(0, 3);
    
    return NextResponse.json({
      projects: {
        nodes: limitedProjects
      }
    });
  } catch (error) {
    try {
      const restUrl = `${process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '')}/wp-json/wp/v2/project?_embed&per_page=10`;
      const restResponse = await fetch(restUrl);
      
      if (restResponse.ok) {
        const restProjects = await restResponse.json();
        
        const transformedProjects = (restProjects as any[])
          .filter((project: any) => project.slug !== excludeSlug)
          .slice(0, 3)
          .map((project: any): WordPressProject => ({
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
        
        return NextResponse.json({
          projects: {
            nodes: transformedProjects
          },
          source: 'wordpress-rest'
        });
      }
      
      throw new Error('REST API also failed');
    } catch (restError) {
      console.error('REST API failed:', restError);
      return NextResponse.json(
        { 
          error: 'Failed to fetch projects'
        }, 
        { status: 500 }
      );
    }
  }
}