import { defineConfig } from 'vite';
import { copyFileSync, mkdirSync, readdirSync, statSync, existsSync, rmSync } from 'fs';
import { join, resolve } from 'path';

// Helper function to copy directory recursively
function copyDirSync(src: string, dest: string) {
  mkdirSync(dest, { recursive: true });
  const entries = readdirSync(src);
  for (const entry of entries) {
    const srcPath = join(src, entry);
    const destPath = join(dest, entry);
    if (statSync(srcPath).isDirectory()) {
      copyDirSync(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

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
        // Apply thresholds only to pure logic code (not Phaser-dependent)
        'src/data/**/*.ts': {
          lines: 100,
          functions: 100,
          branches: 90,
          statements: 100,
        },
        'src/objects/TowerAbilityDefinitions.ts': {
          lines: 100,
          functions: 100,
          branches: 100,
          statements: 100,
        },
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
  plugins: [
    {
      name: 'organize-dist-folders',
      closeBundle() {
        const distDir = resolve(__dirname, 'dist');
        const deployDir = resolve(distDir, 'deploy');
        const initDir = resolve(distDir, 'init');
        const serverDir = resolve(__dirname, 'server');

        try {
          // Create deploy and init folders
          mkdirSync(deployDir, { recursive: true });
          mkdirSync(initDir, { recursive: true });

          // Move all built files to deploy folder
          const distEntries = readdirSync(distDir);
          for (const entry of distEntries) {
            if (entry === 'deploy' || entry === 'init') continue;
            const srcPath = join(distDir, entry);
            const destPath = join(deployDir, entry);
            if (statSync(srcPath).isDirectory()) {
              copyDirSync(srcPath, destPath);
              rmSync(srcPath, { recursive: true });
            } else {
              copyFileSync(srcPath, destPath);
              rmSync(srcPath);
            }
          }

          // Copy api.php and config.php to deploy root
          copyFileSync(join(serverDir, 'api.php'), join(deployDir, 'api.php'));
          copyFileSync(join(serverDir, 'config.php'), join(deployDir, 'config.php'));

          // Copy init_db.php to init folder
          copyFileSync(join(serverDir, 'init_db.php'), join(initDir, 'init_db.php'));

          console.log('✓ Deploy folder: game client + api.php + config.php');
          console.log('✓ Init folder: init_db.php');
        } catch (error) {
          console.error('Failed to organize dist folders:', error);
        }
      },
    },
  ],
});
