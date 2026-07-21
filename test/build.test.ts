import { spawnSync } from 'node:child_process'
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')

describe('astro build', () => {
    test('exits with code 0 and produces dist/', { timeout: 120_000 }, () => {
        const result = spawnSync('bun', ['run', 'build'], {
            cwd: ROOT,
            stdio: 'inherit',
            encoding: 'utf8',
            timeout: 120_000,
        })

        expect(result.status).toBe(0)

        const distDir = join(ROOT, 'dist')
        expect(existsSync(distDir)).toBe(true)
        expect(readdirSync(distDir).length).toBeGreaterThan(0)
    })

    test('dist contains index.html', () => {
        expect(existsSync(join(ROOT, 'dist', 'index.html'))).toBe(true)
    })

    test('dist contains events.ics', () => {
        expect(existsSync(join(ROOT, 'dist', 'events.ics'))).toBe(true)
    })

    test('events.ics is a valid VCALENDAR with SynthOmaha Events name', () => {
        const ics = readFileSync(join(ROOT, 'dist', 'events.ics'), 'utf8')
        expect(ics).toContain('BEGIN:VCALENDAR')
        expect(ics).toContain('END:VCALENDAR')
        expect(ics).toContain('VERSION:2.0')
        expect(ics).toContain('X-WR-CALNAME:SynthOmaha Events')
    })

    test('events.ics contains the recurring monthly jam', () => {
        const ics = readFileSync(join(ROOT, 'dist', 'events.ics'), 'utf8')
        expect(ics).toContain('RRULE:FREQ=MONTHLY;BYDAY=-1MO')
        expect(ics).toContain('Open Jam')
    })

    test('per-event ics files are generated', () => {
        const eventsIcsDir = join(ROOT, 'dist', 'events')
        expect(existsSync(eventsIcsDir)).toBe(true)
        const icsFiles = readdirSync(eventsIcsDir).filter((f) =>
            f.endsWith('.ics'),
        )
        expect(icsFiles.length).toBeGreaterThan(0)
    })
})
