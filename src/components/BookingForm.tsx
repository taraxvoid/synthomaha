import type { SubmitEvent } from 'react'
import { useState } from 'react'

interface Musician {
    name: string
}

interface Props {
    musicians: Musician[]
}

export default function BookingForm({ musicians }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        phone: '',
        venue: '',
        event_date: '',
        additional_info: '',
    })
    const [selectedMusicians, setSelectedMusicians] = useState<string[]>([])
    const [status, setStatus] = useState<
        'idle' | 'loading' | 'success' | 'error'
    >('idle')
    const [message, setMessage] = useState('')

    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>,
    ) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const toggleMusician = (musicianName: string) => {
        setSelectedMusicians((prev) =>
            prev.includes(musicianName)
                ? prev.filter((name) => name !== musicianName)
                : [...prev, musicianName],
        )
    }

    const handleSubmit = async (e: SubmitEvent<HTMLFormElement>) => {
        e.preventDefault()
        setStatus('loading')

        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    'form-name': 'booking',
                    ...formData,
                    musician: selectedMusicians.join(', '),
                }).toString(),
            })

            if (response.ok) {
                setStatus('success')
                setMessage(
                    "Thanks for reaching out! We'll get back to you soon.",
                )
                setFormData({
                    name: '',
                    email: '',
                    phone: '',
                    venue: '',
                    event_date: '',
                    additional_info: '',
                })
                setSelectedMusicians([])
                setTimeout(() => setStatus('idle'), 5000)
            } else {
                setStatus('error')
                setMessage('Something went wrong. Please try again.')
            }
        } catch (_error) {
            setStatus('error')
            setMessage('Failed to send message. Please try again.')
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4 max-w-md"
            name="booking"
            data-netlify="true"
        >
            <input type="hidden" name="form-name" value="booking" />
            <div>
                <span className="block text-sm font-medium mb-2">
                    Which Musician(s)?
                </span>
                <div className="flex flex-wrap gap-2">
                    {musicians.map((musician) => {
                        const isSelected = selectedMusicians.includes(
                            musician.name,
                        )
                        return (
                            <button
                                key={musician.name}
                                type="button"
                                aria-pressed={isSelected}
                                onClick={() => toggleMusician(musician.name)}
                                className={`px-3 py-1.5 rounded-full border text-sm transition-colors ${
                                    isSelected
                                        ? 'bg-signal text-signal-content border-signal'
                                        : 'bg-panel-raised text-inherit border-signal/40 hover:border-signal'
                                }`}
                            >
                                {musician.name}
                            </button>
                        )
                    })}
                </div>
            </div>
            <div>
                <label
                    htmlFor="name"
                    className="block text-sm font-medium mb-2"
                >
                    Your Name
                    <span className="text-red-500 ml-0.5" aria-hidden="true">
                        *
                    </span>
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="field"
                />
            </div>

            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                >
                    Your Email Address
                    <span className="text-red-500 ml-0.5" aria-hidden="true">
                        *
                    </span>
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="field"
                />
            </div>

            <div>
                <label
                    htmlFor="phone"
                    className="block text-sm font-medium mb-2"
                >
                    Phone Number (optional)
                </label>
                <input
                    type="tel"
                    id="phone"
                    name="phone"
                    value={formData.phone}
                    onChange={handleChange}
                    pattern="[\d\s\-\(\)\+]{7,20}"
                    placeholder="(555) 123-4567"
                    className="field"
                />
            </div>

            <div>
                <label
                    htmlFor="venue"
                    className="block text-sm font-medium mb-2"
                >
                    Your Venue
                    <span className="text-red-500 ml-0.5" aria-hidden="true">
                        *
                    </span>
                </label>
                <textarea
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    required
                    placeholder="Venue Name"
                    rows={1}
                    className="field"
                />
            </div>

            <div>
                <label
                    htmlFor="event_date"
                    className="block text-sm font-medium mb-2"
                >
                    Preferred Date (optional)
                </label>
                <input
                    type="date"
                    id="event_date"
                    name="event_date"
                    value={formData.event_date}
                    onChange={handleChange}
                    className="field"
                />
            </div>

            <div>
                <label
                    htmlFor="additional_info"
                    className="block text-sm font-medium mb-2"
                >
                    Venue Info (optional)
                </label>
                <textarea
                    id="additional_info"
                    name="additional_info"
                    value={formData.additional_info}
                    onChange={handleChange}
                    placeholder="Hookups, System, Audience, Event, $$$"
                    rows={3}
                    maxLength={280}
                    className="field resize-none"
                />
                <div className="text-xs text-right opacity-60 mt-1">
                    {formData.additional_info.length}/280
                </div>
            </div>

            <br />

            <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-2 bg-signal text-signal-content font-semibold rounded hover:bg-signal/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {status === 'loading' ? 'Sending...' : 'Send Booking Request'}
            </button>

            {status === 'success' && (
                <div className="p-3 bg-green-500/20 border border-green-500 rounded text-green-300 text-sm">
                    {message}
                </div>
            )}

            {status === 'error' && (
                <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">
                    {message}
                </div>
            )}
        </form>
    )
}
