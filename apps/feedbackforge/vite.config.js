import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'src/js/main.js'),
      },
      output: {
        entryFileNames: 'js/bundle.js',
        chunkFileNames: 'js/[name].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const extType = info[info.length - 1];
          if (/\.(css|sass|scss)$/.test(assetInfo.name)) {
            return 'css/styles.[hash].[ext]';
          }
          return `assets/[name].[hash].[ext]`;
        },
      },
    },
  },
  
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