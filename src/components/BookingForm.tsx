import { useState, useEffect, useRef } from 'react';

interface Musician {
    name: string;
}

interface Props {
    musicians: Musician[];
}

export default function BookingForm({ musicians }: Props) {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        musician: '',
        venue: '',
        additional_info: ''
    });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');
    const [openDropdown, setOpenDropdown] = useState(false);
    const [filteredMusicians, setFilteredMusicians] = useState<Musician[]>([]);
    const dropdownRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpenDropdown(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));

        if (name === 'musician') {
            const filtered = musicians.filter((m) => m.name.toLowerCase().includes(value.toLowerCase()));
            setFilteredMusicians(filtered);
            setOpenDropdown(value.length > 0 && filtered.length > 0);
        }
    };

    const selectMusician = (musicianName: string) => {
        setFormData((prev) => ({ ...prev, musician: musicianName }));
        setOpenDropdown(false);
    };

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
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
                setFormData({ name: '', email: '', musician: '', venue: '', additional_info: '' });
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
                    Your Email Address
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

            <div ref={dropdownRef} className="relative">
                <label htmlFor="musician" className="block text-sm font-medium mb-2">
                    Which Musician?
                </label>
                <input
                    type="text"
                    id="musician"
                    name="musician"
                    value={formData.musician}
                    onChange={handleChange}
                    onFocus={() => {
                        if (formData.musician.length > 0) {
                            const filtered = musicians.filter((m) => m.name.toLowerCase().includes(formData.musician.toLowerCase()));
                            setFilteredMusicians(filtered);
                            setOpenDropdown(filtered.length > 0);
                        }
                    }}
                    placeholder="Musician Name (will autocomplete)"
                    className="w-full px-4 py-2 bg-black/50 border border-primary/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
                {openDropdown && filteredMusicians.length > 0 && (
                    <div className="absolute z-10 w-full mt-1 bg-black/80 border border-primary/50 rounded shadow-lg">
                        {filteredMusicians.map((musician) => (
                            <div
                                key={musician.name}
                                onClick={() => selectMusician(musician.name)}
                                className="px-4 py-2 cursor-pointer hover:bg-primary/20 text-white text-sm"
                            >
                                {musician.name}
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <div>
                <label htmlFor="venue" className="block text-sm font-medium mb-2">
                    Which Venue?
                </label>
                <textarea
                    id="venue"
                    name="venue"
                    value={formData.venue}
                    onChange={handleChange}
                    required
                    placeholder="Which Venue?"
                    rows={1}
                    className="w-full px-4 py-2 bg-black/50 border border-primary/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary"
                />
            </div>

            <div>
                <label htmlFor="additional_info" className="block text-sm font-medium mb-2">
                    Additional Information
                </label>
                <textarea
                    id="additional_info"
                    name="additional_info"
                    value={formData.additional_info}
                    onChange={handleChange}
                    placeholder="Any Gear Provided, Power and Hookups, Sound System and Mixer, PAs, Seating, Likely Audience, Event Type, Cover and Payment"
                    rows={3}
                    className="w-full px-4 py-2 bg-black/50 border border-primary/50 rounded text-white placeholder-gray-400 focus:outline-none focus:border-primary resize-none"
                />
            </div>

            <br />

            <button
                type="submit"
                disabled={status === 'loading'}
                className="px-6 py-2 bg-primary text-black font-semibold rounded hover:bg-primary/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
                {status === 'loading' ? 'Sending...' : 'Send Booking Request'}
            </button>

            {status === 'success' && <div className="p-3 bg-green-500/20 border border-green-500 rounded text-green-300 text-sm">{message}</div>}

            {status === 'error' && <div className="p-3 bg-red-500/20 border border-red-500 rounded text-red-300 text-sm">{message}</div>}
        </form>
    );
}
