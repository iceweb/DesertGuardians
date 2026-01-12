import { defineConfig } from 'vite';

export default defineConfig({
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
});
