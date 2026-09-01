/**
 * Optimized Astro build script.
 *
 * By default, `astro build` re-runs the full content sync on every invocation,
 * which includes creating a temp Vite dev server (~1s), dependency optimization
 * on cold cache (~10s), and content collection type generation (~5s).
 *
 * This script skips that sync step when the content store is already
 * up-to-date, cutting build time by ~50% on repeat builds. Content changes
 * are detected automatically by comparing file mtimes against a `.last-sync`
 * timestamp — no manual sync needed.
 *
 * Files that trigger a re-sync:
 *   - Everything under `src/content/` (YAML data, images, etc.)
 *   - `src/content.config.ts` (collection schemas — a schema change would
 *     invalidate the cached data store format)
 *
 * Image compression is also cached: `scripts/compress-images.ts` runs only
 * when files in `public/images/uploads/` have changed since the last build.
 *
 * Trade-offs:
 *   - Skipping sync means content schema validation (Zod) doesn't run during
 *     build. Run `bun run check` to validate types, or `bun run check:content`
 *     to force a content sync + schema validation.
 *   - The `sync: false` option is an internal Astro API. If it breaks in a
 *     future Astro version, remove the `{ sync: false }` option as a fallback.
 */
import {
    existsSync,
    mkdirSync,
    readdirSync,
    readFileSync,
    statSync,
    writeFileSync,
} from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('..', import.meta.url))
const astroDir = join(root, 'node_modules/.astro')
const dataStorePath = join(astroDir, 'data-store.json')
const lastSyncPath = join(astroDir, '.last-sync')
const contentDir = join(root, 'src/content')
const contentConfigPath = join(root, 'src/content.config.ts')

/** Walk a directory recursively and return the newest mtime (ms) across
 * all files, or 0 if the directory doesn't exist. */
function getNewestMtime(dir) {
    if (!existsSync(dir)) return 0
    let newest = 0
    for (const entry of readdirSync(dir, { withFileTypes: true })) {
        const fullPath = join(dir, entry.name)
        if (entry.isDirectory()) {
            newest = Math.max(newest, getNewestMtime(fullPath))
        } else {
            newest = Math.max(newest, statSync(fullPath).mtimeMs)
        }
    }
    return newest
}

const lastSyncTime = existsSync(lastSyncPath)
    ? Number(readFileSync(lastSyncPath, 'utf-8'))
    : 0

const uploadsDir = join(root, 'public/images/uploads')
const lastCompressPath = join(astroDir, '.last-compress')

/** Compress oversized images in public/images/uploads/ if any have changed
 * since the last build. Uses Bun.Image (no sharp dependency). */
async function maybeCompressImages() {
    const lastCompress = existsSync(lastCompressPath)
        ? Number(readFileSync(lastCompressPath, 'utf-8'))
        : 0
    const uploadsMtime = getNewestMtime(uploadsDir)
    const needsCompress = uploadsMtime > lastCompress

    if (!needsCompress) {
        console.log('Image cache up-to-date, skipping compression')
        return
    }

    console.log('Compressing changed images...')
    const { compressImages } = await import('../scripts/compress-images.ts')
    let result
    try {
        result = await compressImages()
    } catch (err) {
        console.error('Image compression failed:', err)
        return
    }
    // `null` means compression was skipped entirely (e.g. Bun.Image
    // unavailable on this runtime) — don't mark the cache as up-to-date in
    // that case, or the images would never get retried after a Bun upgrade.
    if (result === null) return
    mkdirSync(astroDir, { recursive: true })
    writeFileSync(lastCompressPath, String(Date.now()), 'utf-8')
}

await maybeCompressImages()

// Check if any content or config file is newer than the last successful sync
const contentMtime = getNewestMtime(contentDir)
const configMtime = existsSync(contentConfigPath)
    ? statSync(contentConfigPath).mtimeMs
    : 0
const newestChange = Math.max(contentMtime, configMtime)

// Re-sync if the store is missing or any content/config file is newer
const needsSync = !existsSync(dataStorePath) || newestChange > lastSyncTime

if (needsSync) {
    console.log('Content store missing or stale, running astro sync first...')
    const { sync } = await import('astro')
    await sync({})
    // Record the successful sync timestamp
    writeFileSync(lastSyncPath, String(Date.now()), 'utf-8')
}

// Build with sync disabled — reuses the cached content store
const { build } = await import('astro')
await build({}, { sync: false })
