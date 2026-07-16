const faqs = [
    { q: 'How do I claim my meter?', a: 'After logging in, go to My Bills → Claim a Meter and search your meter number.' },
    { q: 'Can I pay bills without logging in?', a: 'Yes, use the Public Pay Bill button on the homepage.' },
    { q: 'How to apply for a new connection?', a: 'Log in, go to Connections → Apply New Connection and submit the form with fee.' },
];

export default function FAQSection() {
    return (
        <section className="py-16 bg-white">
            <div className="max-w-3xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-gray-800 text-center mb-10">Frequently Asked Questions</h2>
                <div className="space-y-4">
                    {faqs.map((faq, i) => (
                        <details key={i} className="border border-gray-200 rounded-lg p-4">
                            <summary className="font-semibold text-gray-700 cursor-pointer">{faq.q}</summary>
                            <p className="text-gray-500 mt-2">{faq.a}</p>
                        </details>
                    ))}
                </div>
            </div>
        </section>
    );
}