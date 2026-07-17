// src/components/home/FeaturesSection.tsx
import { CreditCard, Zap, AlertTriangle, BarChart3 } from 'lucide-react';

const features = [
    {
        title: 'Online Bill Pay',
        description: 'Pay your electricity bills securely from anywhere, anytime.',
        icon: CreditCard,
        color: 'bg-blue-100 text-blue-600',
    },
    {
        title: 'New Connection',
        description: 'Apply for a fresh electricity connection with a few clicks.',
        icon: Zap,
        color: 'bg-yellow-100 text-yellow-600',
    },
    {
        title: 'Complaint Management',
        description: 'Register and track complaints 24/7 with real‑time updates.',
        icon: AlertTriangle,
        color: 'bg-red-100 text-red-600',
    },
    {
        title: 'Live Statistics',
        description: 'Monitor revenue, connections and performance in dashboards.',
        icon: BarChart3,
        color: 'bg-purple-100 text-purple-600',
    },
];

export default function FeaturesSection() {
    return (
        <section className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50">
            <div className="max-w-7xl mx-auto px-4">
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">Our Core Services</h2>
                    <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
                        Everything you need to manage your electricity account efficiently
                    </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {features.map((feature, index) => {
                        const Icon = feature.icon;
                        return (
                            <div
                                key={index}
                                className="group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-300"
                            >
                                <div
                                    className={`w-12 h-12 rounded-xl ${feature.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <Icon size={24} />
                                </div>
                                <h3 className="text-lg font-semibold text-gray-800 mb-2">
                                    {feature.title}
                                </h3>
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {feature.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}