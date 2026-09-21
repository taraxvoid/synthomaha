import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { describe, expect, test } from 'vitest'
import { parse as parseYaml } from 'yaml'
import { TIME_RE } from '../src/utils/times'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const EVENTS_DIR = join(ROOT, 'src', 'content', 'events')
const MUSICIANS_DIR = join(ROOT, 'src', 'content', 'musicians')

// ---------------------------------------------------------------------------
// Event source files
// ---------------------------------------------------------------------------
//
describe('events', () => {
    const files = readdirSync(EVENTS_DIR).filter((f) => f.endsWith('.yaml'))

    test('there is at least one event file', () => {
        expect(files.length).toBeGreaterThan(0)
    })

    describe('TIME_RE format', () => {
        const valid = ['00:00', '09:00', '18:00', '23:59', '20:30']
        const invalid = [
            '24:00', // end-of-day sentinel is 23:59
            '23:60', // invalid minute
            '9:00', // bare hours
            '6pm', // 12h
            '18:00:00', // includes seconds
            '',
        ]
        test.each(valid)('accepts %s', (t) => {
            expect(t).toMatch(TIME_RE)
        })
        test.each(invalid)('rejects %s', (t) => {
            expect(t).not.toMatch(TIME_RE)
        })
    })

    for (const file of files) {
        const data = parseYaml(readFileSync(join(EVENTS_DIR, file), 'utf8'))

        describe(file, () => {
            test('has required fields', () => {
                expect(typeof data.title).toBe('string')
                expect(data.title.length).toBeGreaterThan(0)
                expect(typeof data.location).toBe('string')
                expect(typeof data.description).toBe('string')
                expect(typeof data.price).toBe('string')
            })

            test('date is YYYY-MM-DD', () => {
                const dateStr =
                    typeof data.date === 'string'
                        ? data.date
                        : data.date?.toISOString?.().slice(0, 10)
                expect(dateStr).toMatch(/^\d{4}-\d{2}-\d{2}$/)
            })

            test('time is strict 24h HH:MM (00:00–23:59)', () => {
                expect(String(data.time)).toMatch(TIME_RE)
            })

            test('endTime, if present, is strict 24h HH:MM', () => {
                if (data.endTime == null) return
                expect(String(data.endTime)).toMatch(TIME_RE)
            })

            test('price is a numeric string', () => {
                expect(data.price).toMatch(/^\d+(\.\d+)?$/)
            })
        })
    }
})

// ---------------------------------------------------------------------------
// Musician source files
// ---------------------------------------------------------------------------
describe('musicians', () => {
    const files = readdirSync(MUSICIANS_DIR).filter((f) => f.endsWith('.yaml'))

    test('there is at least one musician file', () => {
        expect(files.length).toBeGreaterThan(0)
    })

    for (const file of files) {
        const data = parseYaml(readFileSync(join(MUSICIANS_DIR, file), 'utf8'))

        describe(file, () => {
            test('has a name string', () => {
                expect(typeof data.name).toBe('string')
                expect(data.name.length).toBeGreaterThan(0)
            })

            test('social links are valid URLs if present', () => {
                for (const field of [
                    'bandcamp',
                    'soundcloud',
                    'instagram',
                    'website',
                ]) {
                    if (!data[field]) continue
                    expect(() => new URL(data[field])).not.toThrow(
                        `${file}: invalid URL in ${field}: ${data[field]}`,
                    )
                }
            })
        })
    }
})
