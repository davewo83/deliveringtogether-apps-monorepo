import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Basic build configuration
  build: {
    outDir: 'dist',
    emptyOutDir: true
  },
  
  // Process files in the public directory
  publicDir: 'public',
  
  // Development server settings
  server: {
    port: 3001,
  }
});