import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import { resolve } from 'path';

export default defineConfig({
  plugins: [tailwindcss()],
  root: 'src',
  envDir: import.meta.dirname,
  server: {
    port: 3000,
    open: false,
  },
  build: {
    outDir: '../dist',
    emptyOutDir: true,
    sourcemap: true,
    rollupOptions: {
      input: {
        main: resolve(import.meta.dirname, 'src/index.html'),
        about: resolve(import.meta.dirname, 'src/about/about.html'),
        products: resolve(import.meta.dirname, 'src/products/products.html'),
        applications: resolve(import.meta.dirname, 'src/applications/applications.html'),
        manufacturing: resolve(import.meta.dirname, 'src/company/manufacturing.html'),
        sustainability: resolve(import.meta.dirname, 'src/company/sustainability.html'),
        gallery: resolve(import.meta.dirname, 'src/company/gallery.html'),
        contact: resolve(import.meta.dirname, 'src/contact/contact.html'),
        admin: resolve(import.meta.dirname, 'src/admin/index.html'),
      }
    }
  }
});