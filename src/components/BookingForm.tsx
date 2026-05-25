import { useState } from 'react';

export default function BookingForm() {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        subject: '',
        message: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setStatus('loading');

        try {
            const response = await fetch('/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({ 'form-name': 'booking', ...formData }).toString()
            });

            if (response.ok) {
                setStatus('success');
                setMessage("Thanks for reaching out! We'll get back to you soon.");
                setFormData({ name: '', email: '', subject: '', message: '' });
                setTimeout(() => setStatus('idle'), 5000);
            } else {
                setStatus('error');
                setMessage('Something went wrong. Please try again.');
            }
        } catch (error) {
            setStatus('error');
            setMessage('Failed to send message. Please try again.');
        }
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4 max-w-2xl" name="booking" data-netlify="true">
            <input type="hidden" name="form-name" value="booking" />
            <div>
                <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Your Name
                </label>
                <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Your name"
                    className="w-full px-4 py-2 bg-black/50 border border-primary/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address
                </label>
                <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="your@email.com"
                    className="w-full px-4 py-2 bg-black/50 border border-primary/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
            </div>

            <div>
                <label htmlFor="subject" className="block text-sm font-medium mb-2">
                    Subject
                </label>
                <input
                    type="text"
                    id="subject"
                    name="subject"
                    value={formData.subject}
                    onChange={handleChange}
                    required
                    placeholder="Gig inquiry, booking request, etc."
                    className="w-full px-4 py-2 bg-black/50 border border-primary/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
            </div>

            <div>
                <label htmlFor="message" className="block text-sm font-medium mb-2">
                    Message
                </label>
                <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    required
                    placeholder="Tell us about your inquiry..."
                    rows={5}
                    className="w-full px-4 py-2 bg-black/50 border border-primary/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                />
            </div>

            <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-2 bg-primary text-black font-semibold rounded hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {status === 'loading' ? 'Sending...' : 'Send Message'}
            </button>

            {status === 'success' && <div className="p-3 bg-green-500/20 border border-green-500 rounded text-green-300 text-sm">{message}</div>}

            {status === 'error' && <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">{message}</div>}
        </form>
    );
}
