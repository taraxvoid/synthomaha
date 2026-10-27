import { describe, expect, test } from 'vitest'

const { isEventPast, visibleEvents } = await import(
    '../src/utils/eventVisibility.ts'
)

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

describe('visibleEvents', () => {
    test('shows only the next non-past occurrence of a recurring series', () => {
        const events = [
            { date: '2026-10-26', series: 'jam' },
            { date: '2026-11-30', series: 'jam' },
            { date: '2026-12-28', series: 'jam' },
        ]
        expect(visibleEvents(events, '2026-10-27')).toEqual([
            false,
            true,
            false,
        ])
    })

    test('shows every non-past one-off event', () => {
        const events = [
            { date: '2026-06-29' },
            { date: '2026-11-01' },
            { date: '2026-11-02' },
        ]
        expect(visibleEvents(events, '2026-10-27')).toEqual([false, true, true])
    })

    test('tracks each series independently', () => {
        const events = [
            { date: '2026-11-09', series: 'a' },
            { date: '2026-11-30', series: 'b' },
            { date: '2026-12-14', series: 'a' },
        ]
        expect(visibleEvents(events, '2026-10-27')).toEqual([true, true, false])
    })
})
