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
        color: 'from-emerald-400 to-teal-300',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'group-hover:border-emerald-500/30',
    },
    {
        id: 2,
        icon: FileText,
        value: '45,000+',
        rawValue: 45000,
        label: 'Bills Processed',
        description: 'Auto-calculated & verified',
        suffix: '+',
        color: 'from-teal-400 to-cyan-300',
        bgColor: 'bg-teal-500/10',
        borderColor: 'group-hover:border-teal-500/30',
    },
    {
        id: 3,
        icon: CheckCircle,
        value: '98%',
        rawValue: 98,
        label: 'Complaints Resolved',
        description: 'Active rapid response unit',
        suffix: '%',
        color: 'from-emerald-300 to-cyan-200',
        bgColor: 'bg-emerald-500/10',
        borderColor: 'group-hover:border-emerald-400/30',
    },
    {
        id: 4,
        icon: Clock,
        value: '15+',
        rawValue: 15,
        label: 'Years of Trust',
        description: 'Serving citizens since 2011',
        suffix: '+',
        color: 'from-cyan-400 to-emerald-300',
        bgColor: 'bg-cyan-500/10',
        borderColor: 'group-hover:border-cyan-500/30',
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
            className="relative py-20 md:py-28 bg-gradient-to-br from-emerald-950 via-slate-900 to-emerald-950 overflow-hidden border-y border-emerald-900/40"
        >
            {/* Ambient Background Decor */}
            <div className="absolute inset-0 opacity-40 pointer-events-none">
                <div className="absolute -top-32 -right-32 w-96 h-96 bg-emerald-500/20 rounded-full blur-3xl" />
                <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-teal-500/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-emerald-500/5 rounded-full blur-2xl" />

                {/* Clean Subtle Grid Overlay */}
                <svg
                    className="absolute inset-0 w-full h-full"
                    xmlns="http://www.w3.org/2000/svg"
                >
                    <defs>
                        <pattern
                            id="grid-pattern"
                            width="40"
                            height="40"
                            patternUnits="userSpaceOnUse"
                        >
                            <path
                                d="M 40 0 L 0 0 0 40"
                                fill="none"
                                stroke="rgba(16, 185, 129, 0.04)"
                                strokeWidth="1"
                            />
                        </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid-pattern)" />
                </svg>
            </div>

            <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                {/* Section Header */}
                <div className="text-center mb-16 md:mb-20 space-y-4">
                    <span className="inline-flex items-center gap-1.5 px-4.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-300 text-xs font-semibold tracking-wider uppercase">
                        Our Operational Footprint
                    </span>
                    <h2 className="text-3xl md:text-5xl font-extrabold text-white tracking-tight">
                        Powering the Future of <br className="hidden sm:inline" />
                        <span className="bg-gradient-to-r from-emerald-300 via-teal-200 to-cyan-300 bg-clip-text text-transparent">
                            Smart Utility Distribution
                        </span>
                    </h2>
                    <p className="text-sm md:text-base text-emerald-100/60 max-w-2xl mx-auto font-medium">
                        Ensuring continuous, reliable, and digitized energy management with absolute precision and customer-focused transparency across the region.
                    </p>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 relative">
                    {stats.map((stat, index) => {
                        const Icon = stat.icon;
                        const delay = index * 100;

                        return (
                            <div
                                key={stat.id}
                                className={`
                                    relative group flex flex-col items-center text-center p-8 rounded-3xl
                                    transition-all duration-700 ease-out border border-emerald-950
                                    ${isVisible
                                        ? 'opacity-100 translate-y-0'
                                        : 'opacity-0 translate-y-8'
                                    }
                                `}
                                style={{ transitionDelay: `${delay}ms` }}
                            >
                                {/* Glass card backdrop */}
                                <div className={`absolute inset-0 rounded-3xl bg-white/[0.02] border border-white/5 ${stat.borderColor} group-hover:bg-emerald-950/20 backdrop-blur-md transition-all duration-300`} />

                                {/* Icon Container */}
                                <div className="relative z-10 mb-6">
                                    <div
                                        className={`
                                            w-14 h-14 rounded-2xl ${stat.bgColor} 
                                            flex items-center justify-center mx-auto 
                                            group-hover:scale-110 group-hover:rotate-2 
                                            transition-all duration-300
                                        `}
                                    >
                                        <Icon
                                            className="w-6 h-6 text-emerald-400 group-hover:text-emerald-300 transition-colors"
                                            strokeWidth={2}
                                        />
                                    </div>
                                </div>

                                {/* Numbers & Metric */}
                                <div className="relative z-10 space-y-1">
                                    <div className="min-h-[3.75rem] flex items-center justify-center">
                                        {isVisible ? (
                                            <CountUp
                                                start={0}
                                                end={stat.rawValue}
                                                duration={2.5}
                                                suffix={stat.suffix}
                                                className={`
                                                    text-4xl sm:text-5xl font-black tracking-tight 
                                                    bg-gradient-to-r ${stat.color} bg-clip-text text-transparent
                                                    leading-none
                                                `}
                                            />
                                        ) : (
                                            <span
                                                className={`
                                                    text-4xl sm:text-5xl font-black tracking-tight 
                                                    bg-gradient-to-r ${stat.color} bg-clip-text text-transparent
                                                    leading-none
                                                `}
                                            >
                                                {stat.value}
                                            </span>
                                        )}
                                    </div>

                                    <h4 className="text-white font-bold text-base md:text-lg tracking-wide pt-1">
                                        {stat.label}
                                    </h4>

                                    <p className="text-emerald-100/60 text-xs md:text-sm font-medium">
                                        {stat.description}
                                    </p>
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Bottom Trust Badge */}
                <div className="mt-16 text-center relative z-10">
                    <p className="inline-flex items-center gap-2.5 text-emerald-400/40 text-xs font-semibold tracking-wider uppercase border-t border-emerald-900/30 pt-8 px-6">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-pulse" />
                        A Government Approved Smart Grid Initiative
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/50 animate-pulse" />
                    </p>
                </div>
            </div>
        </section>
    );
}
