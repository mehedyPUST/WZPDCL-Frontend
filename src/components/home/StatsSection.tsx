const stats = [
    { label: 'Active Consumers', value: '12,000+' },
    { label: 'Bills Generated', value: '45,000+' },
    { label: 'Complaints Resolved', value: '98%' },
    { label: 'Years of Service', value: '15+' },
];

export default function StatsSection() {
    return (
        <section className="py-16 bg-emerald-700 text-white">
            <div className="max-w-7xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
                {stats.map((s, i) => (
                    <div key={i}>
                        <p className="text-4xl font-bold">{s.value}</p>
                        <p className="text-emerald-200 mt-2">{s.label}</p>
                    </div>
                ))}
            </div>
        </section>
    );
}