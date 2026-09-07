import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const DIST_DIR = join(ROOT, 'dist')

describe('astro build output', () => {
    test('dist/ exists and is non-empty', () => {
        expect(existsSync(DIST_DIR)).toBe(true)
        expect(readdirSync(DIST_DIR).length).toBeGreaterThan(0)
    })

    test('dist contains index.html', () => {
        expect(existsSync(join(DIST_DIR, 'index.html'))).toBe(true)
    })

    test('dist contains events.ics', () => {
        expect(existsSync(join(DIST_DIR, 'events.ics'))).toBe(true)
    })

    test('events.ics is a valid VCALENDAR with SynthOmaha Events name', () => {
        const ics = readFileSync(join(DIST_DIR, 'events.ics'), 'utf8')
        expect(ics).toContain('BEGIN:VCALENDAR')
        expect(ics).toContain('END:VCALENDAR')
        expect(ics).toContain('VERSION:2.0')
        expect(ics).toContain('X-WR-CALNAME:SynthOmaha Events')
    })

    test('events.ics contains the recurring monthly jam', () => {
        const ics = readFileSync(join(DIST_DIR, 'events.ics'), 'utf8')
        expect(ics).toContain('RRULE:FREQ=MONTHLY;BYDAY=-1MO')
        expect(ics).toContain('Open Jam')
    })

    test('per-event ics files are generated', () => {
        const eventsIcsDir = join(DIST_DIR, 'events')
        expect(existsSync(eventsIcsDir)).toBe(true)
        const icsFiles = readdirSync(eventsIcsDir).filter((f) =>
            f.endsWith('.ics'),
        )
        expect(icsFiles.length).toBeGreaterThan(0)
    })
})
