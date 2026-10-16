const { defineConfig } = require('vitest/config');

module.exports = defineConfig({
  test: {
    globals: true,
    setupFiles: ['./tests/setup.js'],
    fileParallelism: false,
    testTimeout: 20000,
    hookTimeout: 20000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json-summary'],
      include: ['services/**/*.js', 'middleware/**/*.js'],
      exclude: ['**/node_modules/**'],
      thresholds: { statements: 45, branches: 35, functions: 45, lines: 45 },
    },
  },
});
