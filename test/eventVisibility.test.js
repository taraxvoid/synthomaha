import { describe, expect, test } from 'bun:test'

const { isEventPast } = await import('../src/utils/eventVisibility.ts')

describe('isEventPast', () => {
    test('returns true when the event date is before today', () => {
        expect(isEventPast('2026-06-09', '2026-06-19')).toBe(true)
    })

    test('returns false when the event date is after today', () => {
        expect(isEventPast('2026-08-04', '2026-06-19')).toBe(false)
    })

    test('returns false when the event date is today', () => {
        expect(isEventPast('2026-06-19', '2026-06-19')).toBe(false)
    })
})
