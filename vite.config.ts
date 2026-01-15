import { defineConfig } from 'vite';

export default defineConfig({
  // Use relative paths so the game works from any subdirectory
  base: './',
  
  // Vitest configuration
  test: {
    globals: true,
    environment: 'node',
    include: ['src/**/*.{test,spec}.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/**/*.{test,spec}.ts', 'src/main.ts'],
      thresholds: {
        lines: 70,
        functions: 70,
        branches: 60,
        statements: 70,
      },
    },
  },
  server: {
    // Keep the server running even if there are errors
    hmr: {
      overlay: true, // Show errors as overlay instead of crashing
    },
    // Watch options for better stability
    watch: {
      usePolling: true, // More reliable file watching on Windows
      interval: 100,
    },
  },
  // Don't fail the build on TypeScript errors during dev
  esbuild: {
    // Log errors but don't crash
    logLevel: 'warning',
  },
  // Prevent clearing the terminal on rebuild
  clearScreen: false,
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          phaser: ['phaser'],
          audio: ['howler'],
        },
      },
    },
  },
});
