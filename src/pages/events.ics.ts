import type { APIRoute } from 'astro';
import { getCollection } from 'astro:content';
import { generateFeedICS } from '../utils/ical';

export const prerender = true;

export const GET: APIRoute = async () => {
    const today = new Date().toISOString().split('T')[0];
    const allEvents = await getCollection('events');
    const upcoming = allEvents.filter((e) => e.data.date >= today).sort((a, b) => a.data.date.localeCompare(b.data.date));

    const ics = generateFeedICS(upcoming);
    return new Response(ics, {
        headers: {
            'Content-Type': 'text/calendar; charset=utf-8',
            'Content-Disposition': 'attachment; filename="synthomaha-events.ics"'
        }
    });
};
