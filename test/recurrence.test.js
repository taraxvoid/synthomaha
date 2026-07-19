import { describe, expect, test } from 'bun:test';

const { getNextOccurrence } = await import('../src/utils/recurrence.ts');

const ANCHOR_DATE = '2025-01-27';
const ANCHOR_TIME = '20:00';
const RRULE = 'FREQ=MONTHLY;BYDAY=-1MO';

describe('getNextOccurrence', () => {
    test('returns the anchor itself when asked for on/after the anchor date', () => {
        const next = getNextOccurrence(ANCHOR_DATE, ANCHOR_TIME, RRULE, new Date('2025-01-01T00:00:00Z'));
        expect(next).toEqual({ date: '2025-01-27', time: '20:00' });
    });

    test('is inclusive of a date that is exactly a jam date', () => {
        const next = getNextOccurrence(ANCHOR_DATE, ANCHOR_TIME, RRULE, new Date('2025-01-27T20:00:00Z'));
        expect(next).toEqual({ date: '2025-01-27', time: '20:00' });
    });

    test('rolls forward to next month once the current month jam has passed', () => {
        const next = getNextOccurrence(ANCHOR_DATE, ANCHOR_TIME, RRULE, new Date('2025-01-28T00:00:00Z'));
        expect(next).toEqual({ date: '2025-02-24', time: '20:00' });
    });

    test('correctly computes the last Monday across a month boundary near month-end', () => {
        const next = getNextOccurrence(ANCHOR_DATE, ANCHOR_TIME, RRULE, new Date('2025-03-01T00:00:00Z'));
        expect(next).toEqual({ date: '2025-03-31', time: '20:00' });
    });
});
