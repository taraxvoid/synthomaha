// Budgets for `bun run test:e2e:lighthouse` (shared runner from @taraxvoid/voidflow).
// The runner supplies `site`.
export default {
    scanner: {
        samples: 1,
        device: 'mobile',
        // Explicit routes, no crawling.
        urls: ['/'],
        skipJavascript: true,
    },
    lighthouseOptions: {
        onlyCategories: ['seo', 'performance'],
    },
    ci: {
        // Per-category minimum scores (0-100); the run exits non-zero if any fail.
        budget: {
            seo: 80,
            performance: 90,
        },
        buildStatic: false,
    },
}
