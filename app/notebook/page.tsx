import { GraphQLClient } from 'graphql-request';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/Blog.scss';
import { PostsApiResponse } from '@/src/types/api';

const client = new GraphQLClient(process.env.NEXT_PUBLIC_WORDPRESS_API_URL || '');

const GET_POSTS = `
  query GetPosts {
    posts(first: 100) {
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
      }
    }
  }
`;

async function getPostsData() {
    try {
        console.log('🔍 Fetching all projects for projects page');
        const data = await client.request(GET_POSTS) as PostsApiResponse;
        
        if (data?.posts?.nodes) {
            console.log(`✅ Found ${data.posts.nodes.length} posts via GraphQL`);
            return data.posts.nodes;
        }
        
        throw new Error('No posts data received from GraphQL');
        
    } catch (error) {
        console.error('Error fetching posts:', error);
        
        // Try WordPress REST API as fallback
        try {
            const WORDPRESS_REST_URL = process.env.NEXT_PUBLIC_WORDPRESS_API_URL?.replace('/graphql', '') || 'https://cms.edrishusein.com';
            console.log('🔄 Falling back to WordPress REST API...');
            
            const restResponse = await fetch(`${WORDPRESS_REST_URL}/wp-json/wp/v2/posts?_embed&per_page=100`);
            
            if (restResponse.ok) {
                const restPosts = await restResponse.json();
                console.log(`✅ Found ${restPosts.length} posts via REST API`);
                
                // Transform REST API data to match GraphQL structure
                return restPosts.map((post: any) => ({
                    id: post.id.toString(),
                    title: post.title?.rendered || post.title,
                    excerpt: post.excerpt?.rendered || post.excerpt || '',
                    slug: post.slug,
                    featuredImage: post._embedded?.['wp:featuredmedia']?.[0] ? {
                        node: {
                            sourceUrl: post._embedded['wp:featuredmedia'][0].source_url,
                            altText: post._embedded['wp:featuredmedia'][0].alt_text || post.title?.rendered || '',
                            mediaDetails: {
                                width: post._embedded['wp:featuredmedia'][0].media_details?.width || 400,
                                height: post._embedded['wp:featuredmedia'][0].media_details?.height || 400
                            }
                        }
                    } : null
                }));
            }
        } catch (restError) {
            console.error('REST API fallback also failed:', restError);
        }
        
        console.log('⚠️ Using empty posts array as final fallback');
        return [];
    }
}

export default async function BlogArchivePage() {
    const posts = await getPostsData();

    return (
        <>
            <Header />
            <main className="blog-archive">
                <div className="hero-section">
                    <h1 className="title">NOTEBOOK</h1>
                    <p className="description">
                        My thoughts, insights, and reflections
                    </p>
                </div>

                <div className="container">
                    <div className="blog-grid">
                        {posts.length > 0 ? (
                            posts.map((post) => (
                                <Link href={`/notebook/${post.slug}`} key={post.id} className="blog-card">
                                    <div className="card-content">
                                        {post.featuredImage?.node && (
                                            <div className="card-image">
                                                <Image
                                                    src={post.featuredImage.node.sourceUrl}
                                                    alt={post.featuredImage.node.altText || post.title}
                                                    fill
                                                    className="post-image"
                                                />
                                            </div>
                                        )}
                                        <div className="card-info">
                                            <h3 className="card-title">{post.title}</h3>
                                            {post.excerpt && (
                                                <div
                                                    className="card-description"
                                                    dangerouslySetInnerHTML={{ __html: post.excerpt }}
                                                />
                                            )}
                                        </div>
                                    </div>
                                </Link>
                            ))
                        ) : (
                            <div className="no-posts-message" style={{ textAlign: 'center', padding: '2rem', color: '#666' }}>
                                <p>No posts available at the moment. Please check back later.</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}