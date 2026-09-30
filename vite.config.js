import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss()],
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'index.html'),
        about: resolve(import.meta.dirname, 'about.html'),
        products: resolve(import.meta.dirname, 'products.html'),
        applications: resolve(import.meta.dirname, 'applications.html'),
        manufacturing: resolve(import.meta.dirname, 'manufacturing.html'),
        sustainability: resolve(import.meta.dirname, 'sustainability.html'),
        globalReach: resolve(import.meta.dirname, 'global-reach.html'),
        gallery: resolve(import.meta.dirname, 'gallery.html'),
        contact: resolve(import.meta.dirname, 'contact.html'),
      }
    }
  }
});
