import { describe, expect, test } from 'bun:test';

const { generateFeedICS, generateEventICS, generateRecurringEventICS } = await import('../src/utils/ical.ts');

const baseEvent = {
    title: 'Test Show',
    date: '2026-06-12',
    time: '20:00',
    location: 'Shakedown Street',
    description: 'A great show',
    price: '10',
    revision: 0
};

const recurringEvent = {
    title: 'Monthly Jam - SynthOmaha',
    date: '2025-01-27',
    time: '20:00',
    location: 'Shakedown Street in Benson',
    description: 'Last Monday of every month — twiddle your knobs and tangle wires with like-minded folks.',
    price: '0',
    recurrence: 'FREQ=MONTHLY;BYDAY=-1MO'
};

describe('generateFeedICS', () => {
    test('produces valid VCALENDAR wrapper', () => {
        const ics = generateFeedICS([]);
        expect(ics).toContain('BEGIN:VCALENDAR');
        expect(ics).toContain('END:VCALENDAR');
        expect(ics).toContain('VERSION:2.0');
        expect(ics).toContain('X-WR-CALNAME:SynthOmaha Events');
        expect(ics).toContain('X-WR-TIMEZONE:America/Chicago');
    });

    test('does not inject a recurring jam on its own', () => {
        const ics = generateFeedICS([]);
        expect(ics).not.toContain('RRULE');
    });

    test('emits an RRULE VEVENT for entries with a recurrence field', () => {
        const ics = generateFeedICS([{ data: recurringEvent, id: 'monthly-jam-recurring' }]);
        expect(ics).toContain('UID:monthly-jam-recurring@synthomaha.net');
        expect(ics).toContain('RRULE:FREQ=MONTHLY;BYDAY=-1MO');
        expect(ics).toContain('SUMMARY:Monthly Jam - SynthOmaha');
        expect(ics).toContain('DTSTART;TZID=America/Chicago:20250127T200000');
        expect(ics).toContain('DURATION:PT2H');
        expect(ics).not.toContain('DTEND;TZID=America/Chicago:20250127');
    });

    test('includes upcoming events as VEVENTs', () => {
        const ics = generateFeedICS([{ data: baseEvent, id: 'test-show' }]);
        expect(ics).toContain('UID:test-show@synthomaha.net');
        expect(ics).toContain('SUMMARY:Test Show');
        expect(ics).toContain('DTSTART;TZID=America/Chicago:20260612T200000');
        expect(ics).toContain('LOCATION:Shakedown Street');
    });

    test('paid event description includes price', () => {
        const ics = generateFeedICS([{ data: baseEvent, id: 'paid' }]);
        expect(ics).toContain('$10 admission');
    });

    test('free event description says Free admission', () => {
        const ics = generateFeedICS([{ data: { ...baseEvent, price: '0' }, id: 'free' }]);
        expect(ics).toContain('Free admission');
    });

    test('CRLF line endings throughout', () => {
        const ics = generateFeedICS([]);
        expect(ics).toContain('\r\n');
        expect(ics.replace(/\r\n/g, '')).not.toContain('\n');
    });
});

describe('generateEventICS', () => {
    test('produces valid single-event VCALENDAR', () => {
        const ics = generateEventICS(baseEvent, 'test-show');
        expect(ics).toContain('BEGIN:VCALENDAR');
        expect(ics).toContain('END:VCALENDAR');
        expect(ics).toContain('BEGIN:VEVENT');
        expect(ics).toContain('END:VEVENT');
    });

    test('X-WR-CALNAME uses event title', () => {
        const ics = generateEventICS(baseEvent, 'test-show');
        expect(ics).toContain('X-WR-CALNAME:Test Show');
    });

    test('UID is slug-based', () => {
        const ics = generateEventICS(baseEvent, 'my-event');
        expect(ics).toContain('UID:my-event@synthomaha.net');
    });

    test('endTime overrides default +2h', () => {
        const ics = generateEventICS({ ...baseEvent, endTime: '22:30' }, 'e');
        expect(ics).toContain('DTEND;TZID=America/Chicago:20260612T223000');
    });

    test('default endTime is start + 2h', () => {
        const ics = generateEventICS(baseEvent, 'e');
        expect(ics).toContain('DTEND;TZID=America/Chicago:20260612T220000');
    });

    test('revision appears as SEQUENCE', () => {
        const ics = generateEventICS({ ...baseEvent, revision: 3 }, 'e');
        expect(ics).toContain('SEQUENCE:3');
    });
});

describe('generateRecurringEventICS', () => {
    test('emits an RRULE VEVENT anchored on the original date', () => {
        const ics = generateRecurringEventICS(recurringEvent, 'monthly-jam-recurring');
        expect(ics).toContain('X-WR-CALNAME:Monthly Jam - SynthOmaha');
        expect(ics).toContain('UID:monthly-jam-recurring@synthomaha.net');
        expect(ics).toContain('DTSTART;TZID=America/Chicago:20250127T200000');
        expect(ics).toContain('RRULE:FREQ=MONTHLY;BYDAY=-1MO');
        expect(ics).toContain('DURATION:PT2H');
    });
});
