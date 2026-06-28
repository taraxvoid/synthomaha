import { describe, expect, test } from 'bun:test'
import { readdirSync, readFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { parse as parseYaml } from 'yaml'

const __dirname = dirname(fileURLToPath(import.meta.url))
const ROOT = join(__dirname, '..')
const EVENTS_DIR = join(ROOT, 'src', 'content', 'events')
const MUSICIANS_DIR = join(ROOT, 'src', 'content', 'musicians')

describe('events', () => {
    const files = readdirSync(EVENTS_DIR).filter((f) => f.endsWith('.yaml'))

    test('there is at least one event file', () => {
        expect(files.length).toBeGreaterThan(0)
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

            test('time is HH:MM', () => {
                const t = String(data.time)
                expect(t).toMatch(/^\d{1,2}:\d{2}$/)
            })

            test('endTime is HH:MM if present', () => {
                if (data.endTime === undefined) return
                expect(String(data.endTime)).toMatch(/^\d{1,2}:\d{2}$/)
            })

            test('price is a numeric string', () => {
                expect(data.price).toMatch(/^\d+(\.\d+)?$/)
            })
        })
    }
})

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
