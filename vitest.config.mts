import { defineConfig } from 'vitest/config';
import path from 'path';

export default defineConfig({
  test: {
    globals: true,
    environment: 'happy-dom',
    setupFiles: ['./vitest.setup.mts'],
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    exclude: ['node_modules', '.next', 'dist'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'html', 'lcov'],
      include: [
        'src/lib/data-fetcher.ts',
        'src/lib/section-registry.ts',
        'src/lib/seo-utils.ts',
        'src/hooks/*.ts',
      ],
      exclude: [
        'src/**/*.test.ts',
        'src/**/*.test.tsx',
        'src/__mocks__/**',
        'src/types/**',
      ],
      thresholds: {
        // Soft targets - report but don't fail
        statements: 0,
        branches: 0,
        functions: 0,
        lines: 0,
      },
    },
    testTimeout: 10000,
    hookTimeout: 10000,
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, '.'),
      '@/src': path.resolve(__dirname, './src'),
    },
  },
});
