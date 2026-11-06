// @ts-check
import { defineConfig } from 'astro/config'

// Fully static build (ADR-0001). Add @astrojs/cloudflare only if a page
// ever needs on-demand rendering.
export default defineConfig({
  site: 'https://ooctav.io',
  trailingSlash: 'ignore',
})
