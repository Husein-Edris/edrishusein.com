// app/api/post/route.ts — WordPress posts via REST API
import { NextRequest, NextResponse } from 'next/server';
import { rewriteImageUrls } from '@/src/lib/image-utils';
import { cmsRest } from '@/src/lib/rest-client';
import { transformPostListItem, transformPostDetail } from '@/src/lib/transform/transformPost';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const slug = searchParams.get('slug');
  const limit = searchParams.get('limit');

  if (slug && (typeof slug !== 'string' || slug.length > 100 || !/^[a-z0-9\-]+$/.test(slug))) {
    return NextResponse.json({ error: 'Invalid slug parameter' }, { status: 400 });
  }

  if (limit && (!/^\d+$/.test(limit) || parseInt(limit) > 50)) {
    return NextResponse.json({ error: 'Invalid limit parameter' }, { status: 400 });
  }

  // List mode: ?limit=N (no slug)
  if (limit && !slug) {
    try {
      const posts = await cmsRest<unknown[]>(
        `/posts?_embed&per_page=${parseInt(limit)}&orderby=date&order=desc`
      );
      const nodes = Array.isArray(posts) ? posts.map((p) => transformPostListItem(p as never)) : [];
      return NextResponse.json(rewriteImageUrls({ success: true, posts: nodes }));
    } catch (error) {
      console.error('Error fetching posts:', error);
      return NextResponse.json({ success: true, posts: [] });
    }
  }

  if (!slug) {
    return NextResponse.json({ error: 'Post slug is required' }, { status: 400 });
  }

  // Detail mode: ?slug=X
  try {
    const posts = await cmsRest<unknown[]>(
      `/posts?slug=${slug}&_embed&acf_format=standard`
    );
    if (!Array.isArray(posts) || posts.length === 0) {
      throw new Error('Post not found in WordPress, using fallback');
    }

    const post = transformPostDetail(posts[0] as never);
    return NextResponse.json(rewriteImageUrls({ success: true, post }));
  } catch (error) {
    console.error('Error fetching post:', error);
    return NextResponse.json({ success: true, post: buildFallbackPost(slug), fallback: true });
  }
}

// Resilient static fallback when the CMS is unreachable.
function buildFallbackPost(slug: string) {
  const fallbackPosts: Record<string, { title: string; excerpt: string; content: string }> = {
    'sample-blog-post': {
      title: 'Welcome to My Blog',
      excerpt: 'This is a sample blog post showcasing the blog functionality.',
      content:
        '<p>Welcome to my development blog! This is a sample post that demonstrates the blog functionality of this Next.js application.</p>',
    },
  };

  const data = fallbackPosts[slug] || fallbackPosts['sample-blog-post'];

  return {
    ...data,
    featuredImage: {
      node: {
        sourceUrl: '/images/Blog-sample-img-optimized.webp',
        altText: data.title,
        mediaDetails: { width: 1200, height: 600 },
      },
    },
    date: '2025-01-01T00:00:00',
    slug,
    readingTime: '5 min read',
    author: {
      name: 'Edris Husein',
      avatar: { url: '/images/Edris-Husein-Hero.png' },
      bio: 'Full-stack developer passionate about modern web technologies.',
    },
    categories: [{ name: 'Development', slug: 'development' }],
    tags: [{ name: 'Web Development', slug: 'web-development' }],
    customTags: [],
    conclusionSection: null,
  };
}
