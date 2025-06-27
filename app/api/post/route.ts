// app/api/post/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/src/lib/client';
import { GET_POST_BY_SLUG } from '@/src/lib/queries';

// Helper function to calculate reading time
function calculateReadingTime(content: string): string {
  const wordsPerMinute = 200;
  const textContent = content.replace(/<[^>]*>/g, ''); // Strip HTML
  const wordCount = textContent.split(/\s+/).length;
  const readingTime = Math.ceil(wordCount / wordsPerMinute);
  return `${readingTime} min read`;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const limit = searchParams.get('limit');

  // If limit is provided, fetch multiple posts
  if (limit && !slug) {
    try {
      const GET_MULTIPLE_POSTS = `
        query GetMultiplePosts($limit: Int!) {
          posts(first: $limit, where: { orderby: { field: DATE, order: DESC } }) {
            nodes {
              title
              excerpt
              date
              slug
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
        }
      `;

      const response = await client.request(GET_MULTIPLE_POSTS, { limit: parseInt(limit) });
      
      if (response.posts?.nodes) {
        const posts = response.posts.nodes.map(post => ({
          ...post,
          readingTime: calculateReadingTime(post.excerpt || '')
        }));

        return NextResponse.json({
          success: true,
          posts
        });
      }
    } catch (error) {
      console.error('❌ Error fetching multiple posts:', error);
    }

    return NextResponse.json({
      success: true,
      posts: []
    });
  }

  if (!slug) {
    return NextResponse.json(
      { error: 'Post slug is required' },
      { status: 400 }
    );
  }

  try {
    console.log('🔍 Fetching post data for slug:', slug);

    // Try to fetch from WordPress with basic fields first
    const BASIC_POST_QUERY = `
      query GetPostBySlug($slug: ID!) {
        post(id: $slug, idType: SLUG) {
          title
          content
          excerpt
          date
          slug
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
          author {
            node {
              name
              avatar {
                url
              }
              description
            }
          }
          categories {
            nodes {
              name
              slug
            }
          }
          tags {
            nodes {
              name
              slug
            }
          }
        }
      }
    `;

    // Try to fetch with ACF fields first, fallback to basic query
    let response;
    try {
      response = await client.request(GET_POST_BY_SLUG, { slug });
      console.log('✅ Successfully fetched with ACF fields');
    } catch (acfError) {
      console.log('⚠️ ACF fields not available, using basic query:', acfError.message);
      response = await client.request(BASIC_POST_QUERY, { slug });
    }
    
    console.log('📡 WordPress response:', response);

    if (!response.post) {
      console.log('⚠️ No post found for slug:', slug);
      return NextResponse.json(
        { error: 'Post not found' },
        { status: 404 }
      );
    }

    const post = response.post;

    // Use ACF reading time if available, otherwise calculate it
    const readingTime = post.blogPostFields?.readingTime || 
                       calculateReadingTime(post.content || post.excerpt || '');

    // Enhance the post data
    const enhancedPost = {
      ...post,
      readingTime,
      author: post.author?.node ? {
        name: post.author.node.name,
        avatar: post.author.node.avatar,
        bio: post.blogPostFields?.authorBioOverride || post.author.node.description
      } : null,
      categories: post.categories?.nodes || [],
      tags: post.tags?.nodes || [],
      customTags: post.blogPostFields?.customTags || [],
      conclusionSection: post.blogPostFields?.conclusionSection || null
    };

    console.log('✅ Successfully fetched post:', enhancedPost.title);

    return NextResponse.json({
      success: true,
      post: enhancedPost
    });

  } catch (error) {
    console.error('❌ Error fetching post:', error);

    // Return fallback post data
    const fallbackPost = {
      title: "Sample Blog Post",
      excerpt: "This is a sample blog post with fallback content for development purposes.",
      content: `
        <p>This is a sample blog post created for development and testing purposes. In a production environment, this content would be fetched from your WordPress CMS.</p>
        
        <h2>Getting Started</h2>
        <p>To see real content here, make sure your WordPress installation is properly configured with:</p>
        
        <ul>
          <li>WPGraphQL plugin installed and activated</li>
          <li>Blog posts created in WordPress admin</li>
          <li>Proper GraphQL endpoint configuration</li>
        </ul>
        
        <h3>Content Management</h3>
        <p>Once your WordPress setup is complete, this page will automatically display your blog content with rich formatting, images, and metadata.</p>
        
        <blockquote>
          <p>This fallback system ensures your site remains functional even when the CMS is unavailable.</p>
        </blockquote>
      `,
      featuredImage: {
        node: {
          sourceUrl: "/images/Blog-sample-img.png",
          altText: "Sample Blog Post",
          mediaDetails: { width: 1200, height: 600 }
        }
      },
      date: new Date().toISOString(),
      slug: slug,
      readingTime: "3 min read",
      author: {
        name: "Edris Husein",
        avatar: {
          url: "/images/Edris-Husein-Hero.png"
        },
        bio: "Full-stack developer passionate about modern web technologies."
      },
      categories: [
        { name: "Development", slug: "development" },
        { name: "Tutorial", slug: "tutorial" }
      ],
      tags: [
        { name: "WordPress", slug: "wordpress" },
        { name: "Next.js", slug: "nextjs" },
        { name: "Web Development", slug: "web-development" }
      ]
    };

    return NextResponse.json({
      success: true,
      post: fallbackPost,
      fallback: true
    });
  }
}