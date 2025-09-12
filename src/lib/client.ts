import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;

export const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  },
  // Disable caching to ensure fresh WordPress content
  cache: 'no-store',
  next: { revalidate: 0 }
});