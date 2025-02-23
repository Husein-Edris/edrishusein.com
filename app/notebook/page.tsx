import { GraphQLClient } from 'graphql-request';
import Image from 'next/image';
import Link from 'next/link';
import Header from '@/src/components/Header/Header';
import Footer from '@/src/components/Footer/Footer';
import '@/src/styles/pages/Blog.scss';

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
        const data = await client.request(GET_POSTS);
        return data.posts.nodes;
    } catch (error) {
        console.error('Error fetching posts:', error);
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
                        {posts.map((post: any) => (
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
                        ))}
                    </div>
                </div>
            </main>
            <Footer />
        </>
    );
}