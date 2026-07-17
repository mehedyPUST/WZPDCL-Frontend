// src/components/home/StatsSection.tsx
'use client';

import { useEffect, useRef, useState } from 'react';
import CountUp from 'react-countup';
import { Users, FileText, CheckCircle, Clock } from 'lucide-react';

const stats = [
    {
        id: 1,
        icon: Users,
        value: '12,000+',
        rawValue: 12000,
        label: 'Active Consumers',
        description: 'West-Zone Region coverage',
        suffix: '+',
        iconBg: 'bg-blue-100 text-blue-600',
    },
    {
        id: 2,
        icon: FileText,
        value: '45,000+',
        rawValue: 45000,
        label: 'Bills Processed',
        description: 'Auto-calculated & verified',
        suffix: '+',
        iconBg: 'bg-yellow-100 text-yellow-600',
    },
    {
        id: 3,
        icon: CheckCircle,
        value: '98%',
        rawValue: 98,
        label: 'Complaints Resolved',
        description: 'Active rapid response unit',
        suffix: '%',
        iconBg: 'bg-green-100 text-green-600',
    },
    {
        id: 4,
        icon: Clock,
        value: '15+',
        rawValue: 15,
        label: 'Years of Trust',
        description: 'Serving citizens since 2011',
        suffix: '+',
        iconBg: 'bg-purple-100 text-purple-600',
    },
];

export default function StatsSection() {
    const sectionRef = useRef<HTMLDivElement>(null);
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15 }
        );

        if (sectionRef.current) {
            observer.observe(sectionRef.current);
        }

        return () => observer.disconnect();
    }, []);

    return (
        <section
            ref={sectionRef}
            className="py-16 md:py-24 bg-gradient-to-b from-white to-gray-50"
        >
            <div className="max-w-7xl mx-auto px-4">
                {/* Section Header */}
                <div className="text-center mb-12 md:mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-gray-800">
                        Our Impact in Numbers
                    </h2>
                    <p className="mt-3 text-gray-500 max-w-2xl mx-auto">
                        Delivering reliable and transparent utility services across the region
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        const delay = index * 100;

                        return (
                            <div
                                key={stat.id}
                                className={`
                                    group bg-white rounded-2xl shadow-sm border border-gray-100 p-6 
                                    hover:shadow-lg hover:-translate-y-1 transition-all duration-300
                                    ${isVisible ? 'opacity-100' : 'opacity-0'}
                                `}
                                style={{
                                    transitionDelay: `${delay}ms`,
                                    transitionProperty: 'opacity, transform',
                                    transitionDuration: '700ms',
                                    transform: isVisible ? 'translateY(0)' : 'translateY(10px)',
                                }}
                            >
                                {/* Icon */}
                                <div
                                    className={`w-12 h-12 rounded-xl ${stat.iconBg} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300`}
                                >
                                    <Icon size={24} />
                                </div>

                                {/* Number with CountUp */}
                                <div className="mb-1">
                                    {isVisible ? (
                                        <CountUp
                                            start={0}
                                            end={stat.rawValue}
                                            duration={2.5}
                                            suffix={stat.suffix}
                                            className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight"
                                        />
                                    ) : (
                                        <span className="text-3xl md:text-4xl font-extrabold text-gray-800 tracking-tight">
                                            {stat.value}
                                        </span>
                                    )}
                                </div>

                                {/* Label */}
                                <h4 className="text-lg font-semibold text-gray-800 mb-1">
                                    {stat.label}
                                </h4>

                                {/* Description */}
                                <p className="text-sm text-gray-500 leading-relaxed">
                                    {stat.description}
                                </p>
                            </div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}