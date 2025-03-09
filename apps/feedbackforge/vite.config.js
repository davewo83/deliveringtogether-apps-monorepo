import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    // Remove the custom rollupOptions or modify it to include HTML
  },
  
  // Add this to ensure public files are copied
  publicDir: 'public',
  
  server: {
    port: 3001, // Different from other apps to avoid conflicts
  },
  
  css: {
    preprocessorOptions: {
      scss: {
        additionalData: `@import "./src/scss/variables.scss";`
      }
    }
  }
});