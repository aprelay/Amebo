import build from '@hono/vite-build/cloudflare-pages'
import devServer from '@hono/vite-dev-server'
import adapter from '@hono/vite-dev-server/cloudflare'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [
    build({
      outputDir: 'dist',
      externalize: ['/sw.js'] // Exclude sw.js from worker routing
    }),
    devServer({
      adapter,
      entry: 'src/index.tsx'
    })
  ]
})
