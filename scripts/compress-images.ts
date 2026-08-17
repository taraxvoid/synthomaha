#!/usr/bin/env bun

// Compresses images in public/images/uploads/ to appropriate sizes using
// Bun's native image pipeline (no external deps like sharp).
//
// Discovers which images need compression by scanning src/content/ YAML files
// for `image:` and `profileImage:` references — so new CMS uploads are handled
// automatically without touching this script.
//
// Usage: bun run compress:images
// Also imported by scripts/build.mjs to auto-compress changed images.

import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = fileURLToPath(new URL('.', import.meta.url))
const root = join(__dirname, '..')
const contentDir = join(root, 'src/content')
const uploadsDir = join(root, 'public/images/uploads')

interface Spec {
    width: number
    quality: number
}

// Display context determines the target size. These are NOT derived
// automatically — if the display size in the corresponding component
// changes, update the matching entry here too:
// - profileImage: 48×56px display (src/components/MusicianCard.astro,
//   `w-12 h-14` / `width={48} height={56}`) → 120px wide at Q80 (2.5x retina)
// - image (events): 160×160/375×192px display (src/components/EventCalendar.astro,
//   `w-full h-48 sm:w-40 sm:h-40` / `width={160} height={160}`) → 480px wide at Q75 (1.3x mobile)
const SPECS: Record<string, Spec> = {
    profile: { width: 120, quality: 80 },
    event: { width: 480, quality: 75 },
}

/** Returns a map of image filename → spec, discovered from content YAML files. */
function discoverImageSpecs(): Map<string, Spec> {
    const specs = new Map<string, Spec>()

    for (const entry of readdirSync(contentDir, { withFileTypes: true })) {
        if (!entry.isDirectory()) continue

        const collectionDir = join(contentDir, entry.name)
        const isMusicians = entry.name === 'musicians'

        for (const file of readdirSync(collectionDir)) {
            if (!file.endsWith('.yaml') && !file.endsWith('.yml')) continue

            const content = readFileSync(join(collectionDir, file), 'utf-8')
            const pattern = isMusicians
                ? /profileImage:\s*['"]?([^'";\n]+)/g
                : /image:\s*['"]?([^'";\n]+)/g
            for (
                let match = pattern.exec(content);
                match !== null;
                match = pattern.exec(content)
            ) {
                const path = match[1].trim()
                // Only handle uploads paths: /images/uploads/filename
                const basename = path.startsWith('/images/uploads/')
                    ? path.slice('/images/uploads/'.length)
                    : null
                if (basename && !specs.has(basename)) {
                    specs.set(
                        basename,
                        isMusicians ? SPECS.profile : SPECS.event,
                    )
                }
            }
        }
    }

    return specs
}

/** Whether a filename should be re-encoded as PNG rather than JPEG, so the
 * output bytes always match the file's existing extension (no format/
 * extension mismatch after compression). */
function isPng(file: string): boolean {
    return file.toLowerCase().endsWith('.png')
}

/** Compresses oversized images in the uploads directory.
 * Returns the number of images that were compressed, or `null` if
 * compression was skipped entirely (e.g. Bun.Image unavailable) — callers
 * should treat `null` as "nothing was checked" rather than "checked, found
 * nothing to do", so a stale cache marker isn't written. */
export async function compressImages(): Promise<number | null> {
    // Bun.Image (and BunFile.image() shorthand) was introduced in Bun v1.3.14.
    // Guard against older runtimes so a missing API never crashes the build.
    if (typeof Bun.Image === 'undefined') {
        console.log(
            '  Bun.Image API not available (requires Bun ≥1.3.14), skipping image compression',
        )
        return null
    }

    const specs = discoverImageSpecs()
    let compressed = 0
    let skipped = 0
    let failed = 0

    for (const [file, spec] of specs) {
        const filepath = `${uploadsDir}/${file}`

        try {
            const input = Bun.file(filepath)

            if (!(await input.exists())) {
                console.log(`  ${file} — not found in uploads, skipping`)
                skipped++
                continue
            }

            const original = input.size
            const img = input.image()
            const { width: origW } = await img.metadata()

            if (origW <= spec.width) {
                console.log(
                    `  ${file}: ${origW}px — already ≤ target (${spec.width}px), skipping`,
                )
                continue
            }

            // Resize keeping aspect ratio (width only), then re-encode in the
            // format matching the file's existing extension so the output
            // bytes never mismatch the extension.
            const resized = img.resize(spec.width)
            const encoded = isPng(file)
                ? resized.png()
                : resized.jpeg({ quality: spec.quality, progressive: true })
            await encoded.write(filepath)

            const newsize = Bun.file(filepath).size
            const reduction = ((1 - newsize / original) * 100).toFixed(0)
            console.log(
                `  ${file}: ${(original / 1024).toFixed(0)}K → ${(newsize / 1024).toFixed(0)}K (${reduction}% smaller)`,
            )
            compressed++
        } catch (err) {
            // A single corrupt/unsupported image shouldn't abort the whole
            // build — log it and keep processing the rest.
            console.error(`  ${file} — failed to compress, skipping:`, err)
            failed++
        }
    }

    if (skipped > 0) {
        console.log(
            `  (${skipped} image(s) referenced in content but not found in uploads)`,
        )
    }

    if (failed > 0) {
        console.log(`  (${failed} image(s) failed to compress, left as-is)`)
    }

    if (compressed > 0) {
        console.log(`\nCompressed ${compressed} image(s)`)
    }

    return compressed
}

// CLI entry point — only run when invoked directly, not when imported
// by scripts/build.mjs
if (import.meta.main) {
    compressImages().catch((err) => {
        console.error(err)
        process.exit(1)
    })
}
