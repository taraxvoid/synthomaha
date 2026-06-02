export interface EventData {
    title: string;
    date: string;
    time: string;
    endTime?: string;
    location: string;
    description: string;
    price: string;
}

function formatICSTime(time: string): string {
    const [h, m] = time.split(':');
    return `${h.padStart(2, '0')}${m.padStart(2, '0')}00`;
}

function addTwoHours(time: string): string {
    const [h, m] = time.split(':').map(Number);
    const newH = (h + 2) % 24;
    return `${String(newH).padStart(2, '0')}${String(m).padStart(2, '0')}00`;
}

function stamp(): string {
    return new Date().toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function buildVEvent(data: EventData, slug: string): string {
    const dateStr = data.date.replace(/-/g, '');
    const startTime = formatICSTime(data.time);
    const endTime = data.endTime ? formatICSTime(data.endTime) : addTwoHours(data.time);
    const desc = [data.description, data.price === '0' ? 'Free admission' : `$${data.price} admission`].join(' | ').replace(/\n/g, '\\n');

    return [
        'BEGIN:VEVENT',
        `UID:${slug}@synthomaha.net`,
        `DTSTAMP:${stamp()}`,
        `DTSTART;TZID=America/Chicago:${dateStr}T${startTime}`,
        `DTEND;TZID=America/Chicago:${dateStr}T${endTime}`,
        `SUMMARY:${data.title}`,
        `DESCRIPTION:${desc}`,
        `LOCATION:${data.location}`,
        'STATUS:CONFIRMED',
        'SEQUENCE:0',
        'END:VEVENT'
    ].join('\r\n');
}

export function generateEventICS(data: EventData, slug: string): string {
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SynthOmaha//SynthOmaha Events//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        `X-WR-CALNAME:${data.title}`,
        'X-WR-TIMEZONE:America/Chicago',
        buildVEvent(data, slug),
        'END:VCALENDAR'
    ].join('\r\n');
}

export function generateFeedICS(events: Array<{ data: EventData; id: string }>): string {
    const vevents = events.map(({ data, id }) => buildVEvent(data, id)).join('\r\n');
    return [
        'BEGIN:VCALENDAR',
        'VERSION:2.0',
        'PRODID:-//SynthOmaha//SynthOmaha Events//EN',
        'CALSCALE:GREGORIAN',
        'METHOD:PUBLISH',
        'X-WR-CALNAME:SynthOmaha Events',
        'X-WR-TIMEZONE:America/Chicago',
        vevents,
        'END:VCALENDAR'
    ].join('\r\n');
}
