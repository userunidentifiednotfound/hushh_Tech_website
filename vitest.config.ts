import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    // Default environment for tests that don't declare a per-file override.
    // Tests that need browser APIs declare // @vitest-environment jsdom at the
    // top of the file and vitest honours that directive automatically.
    environment: 'node',
    include: ['tests/**/*.test.ts', 'tests/**/*.test.js'],
    exclude: [
      'node_modules/**',
      // Live Supabase integration suite (disabled until backend/schema is stable again)
      'tests/ndaIntegration.test.ts',
    ],
    coverage: {
      reporter: ['text', 'json', 'html'],
    },
    testTimeout: 15000,
  },
});
