import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    target: 'es2022',
    cssCodeSplit: false,
    rollupOptions: {
      output: {
        // GSAP n'est requis que pour le motion : on l'isole du chemin critique.
        manualChunks: (id) =>
          /node_modules[\\/](gsap|lenis)[\\/]/.test(id) ? 'motion' : undefined,
      },
    },
  },
});
