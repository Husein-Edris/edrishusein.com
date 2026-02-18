import { vi } from 'vitest';

// Mock GraphQL client request function
export const mockRequest = vi.fn();

// Mock client object matching graphql-request's GraphQLClient
export const mockClient = {
  request: mockRequest,
};

// Helper to set up successful GraphQL response
export function mockGraphQLSuccess<T>(data: T) {
  mockRequest.mockResolvedValueOnce(data);
}

// Helper to set up GraphQL failure
export function mockGraphQLFailure(error: Error | string = 'GraphQL request failed') {
  mockRequest.mockRejectedValueOnce(
    error instanceof Error ? error : new Error(error)
  );
}

// Helper to set up REST API success (for fetch mock)
export function mockRESTSuccess<T>(data: T) {
  const mockResponse = {
    ok: true,
    json: vi.fn().mockResolvedValueOnce(data),
  };
  vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockResponse as unknown as Response);
}

// Helper to set up REST API failure
export function mockRESTFailure(error: Error | string = 'REST API request failed') {
  vi.spyOn(global, 'fetch').mockRejectedValueOnce(
    error instanceof Error ? error : new Error(error)
  );
}

// Helper to set up REST API returning non-ok response
export function mockRESTNotOk(status: number = 500) {
  const mockResponse = {
    ok: false,
    status,
    json: vi.fn().mockResolvedValueOnce({}),
  };
  vi.spyOn(global, 'fetch').mockResolvedValueOnce(mockResponse as unknown as Response);
}

// Reset all mocks
export function resetGraphQLMocks() {
  mockRequest.mockReset();
  vi.restoreAllMocks();
}

// Mock the client module
vi.mock('@/src/lib/client', () => ({
  client: mockClient,
}));
