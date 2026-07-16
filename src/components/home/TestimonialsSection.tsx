const reviews = [
    { name: 'Rahim Uddin', location: 'Kushtia', text: 'Very easy to pay bills online. Great service!' },
    { name: 'Fatema Begum', location: 'Khulna', text: 'Got new connection within 7 days. Impressive!' },
    { name: 'Shamim Hossain', location: 'Kushtia', text: 'Complaint resolved quickly. Recommended.' },
];

export default function TestimonialsSection() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-10">What Our Consumers Say</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {reviews.map((r, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border">
                            <p className="text-gray-600 italic">“{r.text}”</p>
                            <p className="font-semibold text-gray-800 mt-3">{r.name}</p>
                            <p className="text-sm text-gray-400">{r.location}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}