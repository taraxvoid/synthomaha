import react from '@astrojs/react'
import sitemap from '@astrojs/sitemap'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'astro/config'

export default defineConfig({
    site: 'https://synthomaha.net',
    output: 'static',
    // Disable the dev toolbar — not needed during build or on the deployed site
    devToolbar: { enabled: false },
    build: {
        // Allow parallel page generation
        concurrency: 4,
    },
    vite: {
        plugins: [tailwindcss()],
        // Skip Vite dependency pre-bundling during the temp dev server created
        // by `astro sync` — deps are already bundled by Rolldown during build,
        // so this avoids the expensive "Re-optimizing dependencies" step.
        optimizeDeps: { noDiscovery: true },
        build: {
            sourcemap: false,
            brotliSize: false,
        },
    },
    integrations: [react(), sitemap()],
})
