import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
    testDir: './test/e2e',
    timeout: 30_000,
    fullyParallel: true,
    use: {
        baseURL: 'http://localhost:4343',
        serviceWorkers: 'block',
    },
    webServer: {
        command: 'bun run preview --port 4343',
        url: 'http://localhost:4343',
        reuseExistingServer: !process.env.CI,
        timeout: 30_000,
        // Astro auto-backgrounds `astro preview` when it detects an agentic
        // environment (e.g. Claude Code), which makes Playwright think the
        // server process exited early. Force foreground mode.
        env: { ASTRO_PREVIEW_BACKGROUND: 'false' },
    },
    projects: [
        {
            name: 'mobile-chrome',
            use: devices['Pixel 7'],
        },
        {
            name: 'desktop-chrome',
            use: devices['Desktop Chrome'],
        },
    ],
})
