import { GraphQLClient } from 'graphql-request';

const endpoint = process.env.NEXT_PUBLIC_WORDPRESS_API_URL!;

export const client = new GraphQLClient(endpoint, {
  headers: {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
  },
  timeout: 30000, // 30 second timeout (increased for server builds)
  fetch: fetch,
});