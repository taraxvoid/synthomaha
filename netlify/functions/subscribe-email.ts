import { getStore } from '@netlify/blobs'

const blobs = getStore('data')

export default async (req: Request) => {
    if (req.method !== 'POST') {
        return new Response('Method not allowed', { status: 405 })
    }

    try {
        const { email } = await req.json()

        if (!email?.includes('@')) {
            return new Response(JSON.stringify({ error: 'Invalid email' }), {
                status: 400,
                headers: { 'Content-Type': 'application/json' },
            })
        }

        // Store email in Netlify Blobs
        const subscribers = await blobs
            .get('subscribers.json', { type: 'json' })
            .catch(() => [])
        const updatedSubscribers = Array.isArray(subscribers) ? subscribers : []

        // Check if email already subscribed
        if (!updatedSubscribers.includes(email)) {
            updatedSubscribers.push(email)
            await blobs.setJSON('subscribers.json', updatedSubscribers)
        }

        return new Response(
            JSON.stringify({ success: true, message: 'Subscribed!' }),
            {
                status: 200,
                headers: { 'Content-Type': 'application/json' },
            },
        )
    } catch (error) {
        console.error('Error subscribing:', error)
        return new Response(JSON.stringify({ error: 'Subscription failed' }), {
            status: 500,
            headers: { 'Content-Type': 'application/json' },
        })
    }
}
