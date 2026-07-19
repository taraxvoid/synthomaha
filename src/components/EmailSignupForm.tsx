import type { SubmitEvent } from 'react'
import { useState } from 'react'

export default function EmailSignupForm() {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<
        'idle' | 'loading' | 'success' | 'error'
    >('idle')
    const [message, setMessage] = useState('')

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
                    'form-name': 'signup',
                    email,
                }).toString(),
            })

            if (response.ok) {
                setStatus('success')
                setMessage(
                    'Thanks for signing up! Check your email for updates.',
                )
                setEmail('')
                setTimeout(() => setStatus('idle'), 5000)
            } else {
                setStatus('error')
                setMessage('Something went wrong. Please try again.')
            }
        } catch (_error) {
            setStatus('error')
            setMessage('Failed to subscribe. Please try again.')
        }
    }

    return (
        <form
            onSubmit={handleSubmit}
            className="space-y-4"
            id="signup"
            name="signup"
            data-netlify="true"
        >
            <input type="hidden" name="form-name" value="signup" />
            <div>
                <label
                    htmlFor="email"
                    className="block text-sm font-medium mb-2"
                >
                    Email Address
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                    <input
                        type="email"
                        id="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="your@email.com"
                        required
                        className="flex-1 px-4 py-2 bg-black/50 border border-primary/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                    />
                    <button
                        type="submit"
                        disabled={status === 'loading'}
                        className="px-6 py-2 bg-primary text-black font-semibold rounded hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    >
                        {status === 'loading' ? 'Subscribing...' : 'Subscribe'}
                    </button>
                </div>
            </div>

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
