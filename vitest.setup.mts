import { vi, beforeEach, afterEach } from 'vitest';

// Mock environment variables
vi.stubEnv('NODE_ENV', 'test');
vi.stubEnv('NEXT_PUBLIC_WORDPRESS_API_URL', 'https://mock-cms.example.com/graphql');

// Reset mocks between tests
beforeEach(() => {
  vi.clearAllMocks();
});

afterEach(() => {
  vi.restoreAllMocks();
});

// Mock console methods in test environment to reduce noise
// Comment out if you need to debug test output
// vi.spyOn(console, 'log').mockImplementation(() => {});
// vi.spyOn(console, 'warn').mockImplementation(() => {});
// vi.spyOn(console, 'error').mockImplementation(() => {});
// vi.spyOn(console, 'group').mockImplementation(() => {});
// vi.spyOn(console, 'groupEnd').mockImplementation(() => {});

// Global IntersectionObserver mock
const mockIntersectionObserver = vi.fn((callback: IntersectionObserverCallback) => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
  root: null,
  rootMargin: '',
  thresholds: [],
  takeRecords: () => [],
}));

vi.stubGlobal('IntersectionObserver', mockIntersectionObserver);

// Mock localStorage for browser API tests
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
  length: 0,
  key: vi.fn(),
};

vi.stubGlobal('localStorage', localStorageMock);

// Export mocks for direct use in tests
export { mockIntersectionObserver, localStorageMock };
