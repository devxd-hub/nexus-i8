import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig, normalizePath} from 'vite';
import {viteStaticCopy} from 'vite-plugin-static-copy';

// Canonical image root: nexus-i8-/images/ (two directories up from Eid-card/ui/)
// normalizePath is required on Windows (backslashes break tinyglobby glob matching).
const canonicalImagesGlob = normalizePath(path.resolve(__dirname, '../../images')) + '/**/*';

export default defineConfig(() => {
  return {
    plugins: [
      react(),
      tailwindcss(),
      // Serve the canonical nexus-i8-/images/ directory at URL /images/
      // for both dev server and production build output.
      viteStaticCopy({
        targets: [
          {
            src: canonicalImagesGlob,
            dest: '',
          },
        ],
      }),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      port: 3002,
      // Proxy requests starting with /api to the NEXUS Express backend
      proxy: {
        '/api': {
          target: 'http://localhost:3001',
          changeOrigin: true,
        },
      },
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});
