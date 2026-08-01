import { describe, expect, test } from 'vitest'

const { getNextOccurrences } = await import('../src/utils/recurrence.ts')

const ANCHOR_DATE = '2025-01-27'
const ANCHOR_TIME = '20:00'
const RRULE = 'FREQ=MONTHLY;BYDAY=-1MO'

describe('getNextOccurrences', () => {
    test('returns the anchor itself when asked for on/after the anchor date', () => {
        const [next] = getNextOccurrences(
            ANCHOR_DATE,
            ANCHOR_TIME,
            RRULE,
            1,
            new Date('2025-01-01T00:00:00Z'),
        )
        expect(next).toEqual({ date: '2025-01-27', time: '20:00' })
    })

    test('is inclusive of a date that is exactly a jam date', () => {
        const [next] = getNextOccurrences(
            ANCHOR_DATE,
            ANCHOR_TIME,
            RRULE,
            1,
            new Date('2025-01-27T20:00:00Z'),
        )
        expect(next).toEqual({ date: '2025-01-27', time: '20:00' })
    })

    test('rolls forward to next month once the current month jam has passed', () => {
        const [next] = getNextOccurrences(
            ANCHOR_DATE,
            ANCHOR_TIME,
            RRULE,
            1,
            new Date('2025-01-28T00:00:00Z'),
        )
        expect(next).toEqual({ date: '2025-02-24', time: '20:00' })
    })

    test('correctly computes the last Monday across a month boundary near month-end', () => {
        const [next] = getNextOccurrences(
            ANCHOR_DATE,
            ANCHOR_TIME,
            RRULE,
            1,
            new Date('2025-03-01T00:00:00Z'),
        )
        expect(next).toEqual({ date: '2025-03-31', time: '20:00' })
    })

    test('returns the requested number of upcoming occurrences in order', () => {
        const occurrences = getNextOccurrences(
            ANCHOR_DATE,
            ANCHOR_TIME,
            RRULE,
            2,
            new Date('2025-01-01T00:00:00Z'),
        )
        expect(occurrences).toEqual([
            { date: '2025-01-27', time: '20:00' },
            { date: '2025-02-24', time: '20:00' },
        ])
    })

    test('does not repeat the same occurrence when the anchor lands exactly on one', () => {
        const occurrences = getNextOccurrences(
            ANCHOR_DATE,
            ANCHOR_TIME,
            RRULE,
            2,
            new Date('2025-01-27T20:00:00Z'),
        )
        expect(occurrences).toEqual([
            { date: '2025-01-27', time: '20:00' },
            { date: '2025-02-24', time: '20:00' },
        ])
    })

    test('returns fewer occurrences than requested when the rule runs out', () => {
        const occurrences = getNextOccurrences(
            ANCHOR_DATE,
            ANCHOR_TIME,
            `${RRULE};COUNT=1`,
            2,
            new Date('2025-01-01T00:00:00Z'),
        )
        expect(occurrences).toEqual([{ date: '2025-01-27', time: '20:00' }])
    })

    test('returns an empty array when no future occurrences remain', () => {
        const occurrences = getNextOccurrences(
            ANCHOR_DATE,
            ANCHOR_TIME,
            `${RRULE};COUNT=1`,
            2,
            new Date('2025-02-01T00:00:00Z'),
        )
        expect(occurrences).toEqual([])
    })
})
