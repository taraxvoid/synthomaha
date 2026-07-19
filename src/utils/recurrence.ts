import pkg from 'rrule'

const { RRule } = pkg

export interface Occurrence {
    date: string
    time: string
}

// rrule always computes in UTC regardless of the runtime timezone. We treat the
// anchor date/time as a plain UTC wall-clock value (not a real America/Chicago
// -> UTC conversion) since BYDAY-style rules operate on calendar fields, not
// elapsed time — this keeps the anchor and the output using the same convention.
function toUTCDate(dateStr: string, time: string): Date {
    const [year, month, day] = dateStr.split('-').map(Number)
    const [hour, minute] = time.split(':').map(Number)
    return new Date(Date.UTC(year, month - 1, day, hour, minute))
}

function fromUTCDate(date: Date): Occurrence {
    const pad = (n: number) => String(n).padStart(2, '0')
    return {
        date: `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())}`,
        time: `${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`,
    }
}

export function getNextOccurrence(
    anchorDate: string,
    anchorTime: string,
    rruleString: string,
    after: Date = new Date(),
): Occurrence | null {
    const dtstart = toUTCDate(anchorDate, anchorTime)
    const rule = new RRule({ ...RRule.parseString(rruleString), dtstart })
    const next = rule.after(after, true)
    return next ? fromUTCDate(next) : null
}
