const features = [
    { title: 'Online Bill Pay', description: 'Pay your electricity bills anytime, anywhere.', icon: '💳' },
    { title: 'New Connection', description: 'Apply for a new electricity connection easily.', icon: '🔌' },
    { title: 'Complaint Management', description: 'Register and track your complaints 24/7.', icon: '🛠️' },
    { title: 'Real-time Stats', description: 'XEN & Admin dashboards with live statistics.', icon: '📊' },
];

export default function FeaturesSection() {
    return (
        <section className="py-16 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 text-center">
                <h2 className="text-3xl font-bold text-gray-800 mb-10">Our Services</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((f, i) => (
                        <div key={i} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition">
                            <div className="text-4xl mb-3">{f.icon}</div>
                            <h3 className="font-semibold text-gray-800 mb-2">{f.title}</h3>
                            <p className="text-sm text-gray-500">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}