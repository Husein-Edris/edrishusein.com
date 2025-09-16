// app/api/post/route.ts
import { NextRequest, NextResponse } from 'next/server';
import { client } from '@/src/lib/client';
import { GET_POST_BY_SLUG } from '@/src/lib/queries';
import { PostsApiResponse, WordPressPost } from '@/src/types/api';

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

  if (slug && (typeof slug !== 'string' || slug.length > 100 || !/^[a-z0-9\-]+$/.test(slug))) {
    return NextResponse.json({ error: 'Invalid slug parameter' }, { status: 400 });
  }

  if (limit && (typeof limit !== 'string' || !/^\d+$/.test(limit) || parseInt(limit) > 50)) {
    return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
  }

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

      const response = await client.request(GET_MULTIPLE_POSTS, { limit: parseInt(limit) }) as PostsApiResponse;
      
      if (response.posts?.nodes) {
        const posts = response.posts.nodes.map((post: WordPressPost) => ({
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
    let response: { post?: WordPressPost };
    try {
      response = await client.request(GET_POST_BY_SLUG, { slug });
      console.log('✅ Successfully fetched with ACF fields');
    } catch (acfError) {
      console.log('⚠️ ACF fields not available, using basic query:', acfError instanceof Error ? acfError.message : 'Unknown error');
      response = await client.request(BASIC_POST_QUERY, { slug });
    }
    
    console.log('📡 WordPress response:', response);

    if (!response?.post) {
      console.log('⚠️ No post found in WordPress for slug:', slug, 'using fallback');
      // Don't return 404, instead fall through to fallback content below
      throw new Error('Post not found in WordPress, using fallback');
    }

    const post = response.post;

    // Use ACF reading time if available, otherwise calculate it
    const readingTime = post.blogPostFields?.readingTime || 
                       calculateReadingTime(post.content || post.excerpt || '');

    // Enhance the post data
    const enhancedPost = {
      ...post,
      readingTime,
      author: (post as any).author?.node ? {
        name: (post as any).author.node.name,
        avatar: (post as any).author.node.avatar,
        bio: (post as any).blogPostFields?.authorBioOverride || (post as any).author.node.description
      } : null,
      categories: (post as any).categories?.nodes || [],
      tags: (post as any).tags?.nodes || [],
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

    // Create dynamic fallback content based on slug
    const fallbackPosts: { [key: string]: any } = {
      'sample-blog-post': {
        title: "Welcome to My Blog",
        excerpt: "This is a sample blog post showcasing the blog functionality.",
        content: `
          <p>Welcome to my development blog! This is a sample post that demonstrates the blog functionality of this Next.js application.</p>
          
          <h2>About This Blog</h2>
          <p>Here I share insights about:</p>
          
          <ul>
            <li>Full-stack development with Next.js and WordPress</li>
            <li>Modern web technologies and best practices</li>
            <li>Project case studies and lessons learned</li>
            <li>Technical tutorials and guides</li>
          </ul>
          
          <h3>Technical Stack</h3>
          <p>This blog is built with cutting-edge technologies:</p>
          
          <ul>
            <li><strong>Frontend:</strong> Next.js 15 with TypeScript</li>
            <li><strong>CMS:</strong> Headless WordPress with WPGraphQL</li>
            <li><strong>Styling:</strong> SCSS with design system</li>
            <li><strong>SEO:</strong> RankMath integration with structured data</li>
          </ul>
          
          <blockquote>
            <p>This post demonstrates the fallback system that ensures content is always available, even when the CMS is offline.</p>
          </blockquote>
        `
      },
      'getting-started-with-nextjs': {
        title: "Getting Started with Next.js 15",
        excerpt: "A comprehensive guide to building modern web applications with Next.js 15.",
        content: `
          <p>Next.js 15 brings exciting new features that make building modern web applications easier than ever. In this guide, we'll explore the key features and how to get started.</p>
          
          <h2>What's New in Next.js 15</h2>
          <p>The latest version introduces several game-changing features:</p>
          
          <ul>
            <li><strong>App Router:</strong> Enhanced routing with layouts and server components</li>
            <li><strong>Turbopack:</strong> Faster development builds</li>
            <li><strong>Server Actions:</strong> Simplified server-side operations</li>
            <li><strong>Improved TypeScript Support:</strong> Better type safety</li>
          </ul>
          
          <h3>Setting Up Your Project</h3>
          <p>Creating a new Next.js project is straightforward:</p>
          
          <pre><code>npx create-next-app@latest my-app --typescript --tailwind --eslint</code></pre>
          
          <p>This command sets up a complete development environment with TypeScript, Tailwind CSS, and ESLint configured out of the box.</p>
          
          <h3>Key Benefits</h3>
          <ul>
            <li>Server-side rendering for better SEO</li>
            <li>Static site generation for performance</li>
            <li>Built-in optimization for images and fonts</li>
            <li>Seamless API routes</li>
          </ul>
        `
      },
      'modern-web-development': {
        title: "Modern Web Development Best Practices",
        excerpt: "Essential practices for building maintainable, scalable web applications.",
        content: `
          <p>Modern web development has evolved rapidly. Here are the essential practices every developer should follow to build maintainable, scalable applications.</p>
          
          <h2>Architecture Principles</h2>
          <p>Good architecture forms the foundation of any successful project:</p>
          
          <ul>
            <li><strong>Component-Based Design:</strong> Build reusable, modular components</li>
            <li><strong>Separation of Concerns:</strong> Keep logic, styling, and data separate</li>
            <li><strong>Progressive Enhancement:</strong> Start with basic functionality, then enhance</li>
            <li><strong>Performance First:</strong> Optimize from the beginning</li>
          </ul>
          
          <h3>Development Workflow</h3>
          <p>A solid development workflow ensures consistency and quality:</p>
          
          <ol>
            <li><strong>Version Control:</strong> Use Git with meaningful commit messages</li>
            <li><strong>Code Quality:</strong> ESLint, Prettier, and TypeScript</li>
            <li><strong>Testing:</strong> Unit tests, integration tests, and E2E testing</li>
            <li><strong>CI/CD:</strong> Automated testing and deployment</li>
          </ol>
          
          <h3>Performance Optimization</h3>
          <p>Performance directly impacts user experience and SEO:</p>
          
          <ul>
            <li>Image optimization and lazy loading</li>
            <li>Code splitting and dynamic imports</li>
            <li>Proper caching strategies</li>
            <li>Bundle analysis and optimization</li>
          </ul>
          
          <blockquote>
            <p>Remember: the best code is not just functional, but also maintainable, scalable, and performant.</p>
          </blockquote>
        `
      }
    };

    // Get fallback post or use default
    const fallbackData = fallbackPosts[slug] || fallbackPosts['sample-blog-post'];
    
    const fallbackPost = {
      ...fallbackData,
      featuredImage: {
        node: {
          sourceUrl: "/images/Blog-sample-img-optimized.webp",
          altText: fallbackData.title,
          mediaDetails: { width: 1200, height: 600 }
        }
      },
      date: new Date().toISOString(),
      slug: slug,
      readingTime: "5 min read",
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
        { name: "Next.js", slug: "nextjs" },
        { name: "Web Development", slug: "web-development" },
        { name: "TypeScript", slug: "typescript" }
      ]
    };

    return NextResponse.json({
      success: true,
      post: fallbackPost,
      fallback: true
    });
  }
}