import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [
      // Tests that declare // @vitest-environment jsdom need the browser-like environment
      ['tests/**/*.test.ts', 'node'],
      ['tests/**/*.test.js', 'node'],
    ],
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
