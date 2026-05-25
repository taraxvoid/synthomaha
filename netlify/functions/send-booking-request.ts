import { getStore } from '@netlify/blobs';

const blobs = getStore('data');

export default async (req: Request) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 });
    }

    try {
        const { name, email, subject, message } = await req.json();

        if (!name || !email || !subject || !message) {
            return new Response(JSON.stringify({ error: 'Missing required fields' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' }
            });
        }

        // Store booking request in Netlify Blobs
        const bookingRequests = await blobs.get('booking-requests.json', { type: 'json' }).catch(() => []);
        const requests = Array.isArray(bookingRequests) ? bookingRequests : [];

        const newRequest = {
            id: Date.now(),
            name,
            email,
            subject,
            message,
            timestamp: new Date().toISOString()
        };

        requests.push(newRequest);
        await blobs.setJSON('booking-requests.json', requests);

        return new Response(JSON.stringify({ success: true, message: 'Booking request received!' }), {
            status: 200,
            headers: { 'Content-Type': 'application/json' }
        });
    } catch (error) {
        console.error('Error processing booking request:', error);
        return new Response(JSON.stringify({ error: 'Booking request failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' }
        });
    }
};
