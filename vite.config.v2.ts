import build from '@hono/vite-build/cloudflare-pages';
import devServer from '@hono/vite-dev-server';
import adapter from '@hono/vite-dev-server/cloudflare';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [
    build({
      outputDir: 'dist_v2',
      entry: 'src_v2/index.tsx'
    }),
    devServer({
      adapter,
      entry: 'src_v2/index.tsx'
    })
  ],
  build: {
    outDir: 'dist_v2',
    emptyOutDir: true
  }
});
