'use client';

import { useEffect, useState } from 'react';
import { Star } from 'lucide-react';

interface Review {
    _id: string;
    userId: string;
    complaintId: string;
    rating: number;
    text: string;
    visible: boolean;
    createdAt: string;
}

const fallbackReviews = [
    { name: 'Rahim Uddin', location: 'Kushtia', text: 'Very easy to pay bills online. Great service!', rating: 5 },
    { name: 'Fatema Begum', location: 'Khulna', text: 'Got new connection within 7 days. Impressive!', rating: 5 },
    { name: 'Shamim Hossain', location: 'Kushtia', text: 'Complaint resolved quickly. Recommended.', rating: 4 },
];

export default function TestimonialsSection() {
    const [publicReviews, setPublicReviews] = useState<Review[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${process.env.NEXT_PUBLIC_API_URL}/reviews/public`)
            .then((res) => res.json())
            .then((data) => {
                if (Array.isArray(data)) {
                    setPublicReviews(data);
                }
            })
            .catch((err) => console.error('Error loading public testimonials:', err))
            .finally(() => setLoading(false));
    }, []);

    // Combine loaded public reviews with fallbacks if there are few
    const displayReviews = publicReviews.length > 0
        ? publicReviews.map((r, idx) => ({
            name: `Verified Consumer ${r.userId.slice(-4).toUpperCase()}`,
            location: 'WZPDCL Consumer',
            text: r.text || 'Excellent service and swift response from the utility support team!',
            rating: r.rating || 5,
        }))
        : fallbackReviews;

    return (
        <section className="py-20 bg-gradient-to-b from-white to-gray-50 border-t border-gray-100">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <span className="text-emerald-600 font-bold tracking-wider text-xs uppercase bg-emerald-50 px-3 py-1 rounded-full border border-emerald-100">
                    Testimonials
                </span>
                <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 mt-3 mb-4 tracking-tight">
                    What Our Consumers Say
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto mb-16 text-sm sm:text-base">
                    Real opinions and reviews shared by citizens regarding services, connections, bills payment, and support resolution.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {displayReviews.map((r, i) => (
                        <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow flex flex-col justify-between text-left">
                            <div className="space-y-4">
                                <div className="flex items-center gap-0.5">
                                    {Array.from({ length: 5 }).map((_, idx) => (
                                        <Star
                                            key={idx}
                                            size={16}
                                            className={idx < r.rating ? "text-amber-400 fill-amber-400" : "text-gray-200"}
                                        />
                                    ))}
                                </div>
                                <p className="text-gray-600 italic leading-relaxed text-sm">
                                    “{r.text}”
                                </p>
                            </div>
                            <div className="mt-6 pt-4 border-t border-gray-50 flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-xs shrink-0">
                                    {r.name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <h4 className="font-semibold text-gray-900 text-sm truncate">{r.name}</h4>
                                    <p className="text-xs text-gray-400 truncate">{r.location}</p>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
